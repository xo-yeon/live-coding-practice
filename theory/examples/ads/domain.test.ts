import { describe, expect, it } from 'vitest';
import {
  aggregateMetrics,
  applyBudget,
  attachMetrics,
  campaignKey,
  canActivate,
  changeStatus,
  ConflictError,
  ExplicitRejection,
  exportSnapshot,
  inRange,
  kstDayRange,
  parseBudget,
  summarizeBulk,
  type Campaign,
  type Filters,
} from './domain';

const campaign: Campaign = {
  id: 'card-A',
  accountId: 'agency-A',
  name: '가상 카드 혜택 광고',
  dailyBudget: 100000,
  version: 7,
  status: 'PAUSED',
  review: 'APPROVED',
};
const filters: Filters = { status: 'ALL', page: 7, keyword: '카드' };

describe('성과와 캠페인 결합', () => {
  it('노출 규모가 다른 행의 비율을 전체 원자료에서 다시 계산한다', () => {
    const summary = aggregateMetrics([
      { campaignId: 'A', impressions: 10, clicks: 1, spendWon: 100 },
      { campaignId: 'B', impressions: 990, clicks: 9, spendWon: 900 },
    ]);
    expect(summary.ctrPercent).toBe(1);
    expect(summary.cpcWon).toBe(100);
    expect(summary.spendWon).toBe(1000);
  });
  it('0%와 계산 불가를 구분한다', () => {
    const summary = aggregateMetrics([
      { campaignId: 'A', impressions: 100, clicks: 0, spendWon: 50 },
    ]);
    expect(summary.ctrPercent).toBe(0);
    expect(summary.cpcWon).toBeNull();
    expect(aggregateMetrics([]).ctrPercent).toBeNull();
  });
  it('계산 단계에서 비용을 반올림하지 않는다', () => {
    expect(
      aggregateMetrics([{ campaignId: 'A', impressions: 10, clicks: 3, spendWon: 100 }]).cpcWon,
    ).toBe(100 / 3);
  });
  it('성과가 없더라도 캠페인을 보존하며 확정 0과 구분한다', () => {
    const rows = attachMetrics(
      [campaign, { ...campaign, id: 'B' }],
      [{ campaignId: campaign.id, impressions: 0, clicks: 0, spendWon: 0 }],
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].metric?.impressions).toBe(0);
    expect(rows[1].metric).toBeNull();
  });
});

describe('예산 입력과 동시 수정', () => {
  it.each(['', ' ', 'abc', '10000.5', '1e5', '9999', '10000001'])('%j는 허용하지 않는다', (raw) => {
    expect(() => parseBudget(raw)).toThrow();
  });
  it.each([
    ['10000', 10000],
    [' 10000000 ', 10000000],
  ])('%j 경계값을 허용한다', (raw, amount) => {
    expect(parseBudget(String(raw))).toBe(amount);
  });
  it('성공한 명령만 새 예산과 version을 반환하며 원본을 보존한다', () => {
    const saved = applyBudget(campaign, {
      accountId: 'agency-A',
      campaignId: 'card-A',
      dailyBudget: 200000,
      expectedVersion: 7,
    });
    expect(saved.dailyBudget).toBe(200000);
    expect(saved.version).toBe(8);
    expect(campaign.dailyBudget).toBe(100000);
  });
  it('동료가 바꾼 version 8에 오래된 명령을 적용하지 않는다', () => {
    const latest = { ...campaign, dailyBudget: 200000, version: 8 };
    expect(() =>
      applyBudget(latest, {
        accountId: 'agency-A',
        campaignId: 'card-A',
        dailyBudget: 150000,
        expectedVersion: 7,
      }),
    ).toThrow(ConflictError);
    expect(latest.dailyBudget).toBe(200000);
  });
  it('같은 ID라도 다른 계정이면 적용하지 않는다', () => {
    expect(() =>
      applyBudget(campaign, {
        accountId: 'agency-B',
        campaignId: 'card-A',
        dailyBudget: 150000,
        expectedVersion: 7,
      }),
    ).toThrow('대상 불일치');
  });
});

describe('시작 정책', () => {
  it('승인된 일시중지 광고를 편집자만 시작할 수 있다', () => {
    expect(canActivate(campaign, true).allowed).toBe(true);
    expect(canActivate(campaign, false).allowed).toBe(false);
  });
  it.each(['PENDING', 'REJECTED'] as const)('%s 심사 상태는 시작 불가다', (review) => {
    expect(canActivate({ ...campaign, review }, true).allowed).toBe(false);
  });
  it.each(['ACTIVE', 'ENDED'] as const)('%s 운영 상태는 시작 불가다', (status) => {
    expect(canActivate({ ...campaign, status }, true).allowed).toBe(false);
  });
});

describe('필터와 계정 구분', () => {
  it('필터 변경으로 1페이지로 이동하며 원본은 바꾸지 않는다', () => {
    expect(changeStatus(filters, 'ACTIVE')).toEqual({ status: 'ACTIVE', page: 1, keyword: '카드' });
    expect(filters.page).toBe(7);
  });
  it('계정과 페이지가 다르면 캐시 key도 다르다', () => {
    expect(campaignKey('A', filters)).not.toEqual(campaignKey('B', filters));
    expect(campaignKey('A', filters)).not.toEqual(campaignKey('A', { ...filters, page: 1 }));
  });
});

describe('일괄 작업 결과', () => {
  it('성공·명시적 거절·결과 불명을 대상별로 보존한다', () => {
    expect(
      summarizeBulk(
        ['A', 'B', 'C'],
        [
          { status: 'fulfilled', value: undefined },
          { status: 'rejected', reason: new ExplicitRejection('권한 없음') },
          { status: 'rejected', reason: new Error('timeout') },
        ],
      ),
    ).toEqual([
      { id: 'A', state: 'success' },
      { id: 'B', state: 'rejected' },
      { id: 'C', state: 'unknown' },
    ]);
  });
  it('대상과 응답 개수가 다르면 성공으로 간주하지 않는다', () => {
    expect(() => summarizeBulk(['A'], [])).toThrow();
  });
});

describe('보고 날짜 경계', () => {
  it('KST 날짜를 UTC 반열린 구간으로 변환한다', () => {
    expect(kstDayRange('2026-09-27')).toEqual({
      from: '2026-09-26T15:00:00.000Z',
      to: '2026-09-27T15:00:00.000Z',
    });
  });
  it('시작 포함, 끝 제외를 지킨다', () => {
    const range = kstDayRange('2026-09-27');
    expect(inRange('2026-09-26T14:59:59.999Z', range)).toBe(false);
    expect(inRange(range.from, range)).toBe(true);
    expect(inRange('2026-09-27T14:59:59.999Z', range)).toBe(true);
    expect(inRange(range.to, range)).toBe(false);
  });
  it.each(['2026-02-30', '2026-13-01', '2026-9-2'])('%s를 자동 보정하지 않고 거절한다', (day) => {
    expect(() => kstDayRange(day)).toThrow();
  });
  it('윤년과 연말 경계를 처리한다', () => {
    expect(kstDayRange('2024-02-29').to).toBe('2024-02-29T15:00:00.000Z');
    expect(kstDayRange('2026-12-31').to).toBe('2026-12-31T15:00:00.000Z');
  });
});

describe('내보내기 조건', () => {
  it('페이지를 제외하고 시작 조건을 고정한다', () => {
    const current = { ...filters, from: '2026-09-26T15:00:00Z', to: '2026-09-27T15:00:00Z' };
    const snapshot = exportSnapshot('A', current);
    current.keyword = '대출';
    expect(snapshot.keyword).toBe('카드');
    expect(snapshot).not.toHaveProperty('page');
    expect(snapshot.accountId).toBe('A');
  });
});
