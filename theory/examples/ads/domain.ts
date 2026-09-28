// 자체 제작 Ads 수업의 계약입니다. 실제 토스의 상품·권한 정책이 아닙니다.
export type Metric = {
  campaignId: string;
  impressions: number;
  clicks: number;
  spendWon: number;
};

// 입력은 동일 통화·집계 범위의 검증된 비음수 데이터입니다.
export function aggregateMetrics(rows: readonly Metric[]) {
  const total = rows.reduce(
    (sum, row) => ({
      impressions: sum.impressions + row.impressions,
      clicks: sum.clicks + row.clicks,
      spendWon: sum.spendWon + row.spendWon,
    }),
    { impressions: 0, clicks: 0, spendWon: 0 },
  );
  return {
    ...total,
    ctrPercent: total.impressions === 0 ? null : (total.clicks / total.impressions) * 100,
    cpcWon: total.clicks === 0 ? null : total.spendWon / total.clicks,
  };
}

export type Campaign = {
  id: string;
  accountId: string;
  name: string;
  dailyBudget: number;
  version: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  review: 'PENDING' | 'APPROVED' | 'REJECTED';
};

// 단일 계정의 유일 ID 목록과 성공한 성과 응답을 결합합니다.
export function attachMetrics(campaigns: readonly Campaign[], metrics: readonly Metric[]) {
  const byId = new Map(metrics.map((metric) => [metric.campaignId, metric]));
  return campaigns.map((campaign) => ({ ...campaign, metric: byId.get(campaign.id) ?? null }));
}

export function parseBudget(raw: string): number {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) throw new Error('원 단위 정수를 입력해주세요.');
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < 10000 || value > 10000000) {
    throw new Error('예산 범위를 확인해주세요.');
  }
  return value;
}

export type BudgetCommand = {
  accountId: string;
  campaignId: string;
  dailyBudget: number;
  expectedVersion: number;
};

export class ConflictError extends Error {}

// 서버 판정의 순수 모형입니다. 실제 권한 검사·DB 원자성 구현은 아닙니다.
export function applyBudget(current: Campaign, command: BudgetCommand): Campaign {
  if (current.accountId !== command.accountId || current.id !== command.campaignId) {
    throw new Error('대상 불일치');
  }
  if (current.version !== command.expectedVersion) throw new ConflictError('최신 값 확인 필요');
  const dailyBudget = parseBudget(String(command.dailyBudget));
  return { ...current, dailyBudget, version: current.version + 1 };
}

export function canActivate(campaign: Campaign, canEdit: boolean) {
  if (!canEdit) return { allowed: false, reason: '편집 권한 없음' };
  if (campaign.status === 'ENDED') return { allowed: false, reason: '종료된 광고' };
  if (campaign.status === 'ACTIVE') return { allowed: false, reason: '이미 운영중' };
  if (campaign.review !== 'APPROVED') return { allowed: false, reason: '심사 승인 필요' };
  return { allowed: true, reason: '' };
}

export type Filters = {
  status: 'ALL' | 'ACTIVE' | 'PAUSED';
  page: number;
  keyword: string;
};

export function changeStatus(filters: Filters, status: Filters['status']): Filters {
  return { ...filters, status, page: 1 };
}

export function campaignKey(accountId: string, filters: Filters) {
  return ['campaigns', accountId, { ...filters }] as const;
}

export class ExplicitRejection extends Error {}

export function summarizeBulk(
  ids: readonly string[],
  results: readonly PromiseSettledResult<void>[],
) {
  if (ids.length !== results.length) throw new Error('작업과 응답 수 불일치');
  return ids.map((id, index) => ({
    id,
    state:
      results[index].status === 'fulfilled'
        ? 'success'
        : results[index].reason instanceof ExplicitRejection
          ? 'rejected'
          : 'unknown',
  }));
}

// 학습 계약: 2000~2099년 현대 KST 날짜만 지원. DST 지역에 일반화하지 않습니다.
export function kstDayRange(day: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(day)) throw new Error('지원하지 않는 날짜');
  const start = new Date(`${day}T00:00:00+09:00`).getTime();
  const offset = 9 * 60 * 60 * 1000;
  if (!Number.isFinite(start) || new Date(start + offset).toISOString().slice(0, 10) !== day) {
    throw new Error('잘못된 달력 날짜');
  }
  return {
    from: new Date(start).toISOString(),
    to: new Date(start + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function inRange(iso: string, range: { from: string; to: string }) {
  const time = new Date(iso).getTime();
  return time >= new Date(range.from).getTime() && time < new Date(range.to).getTime();
}

export type ReportFilters = Filters & { from: string; to: string };

export function exportSnapshot(accountId: string, filters: ReportFilters) {
  return {
    accountId,
    from: filters.from,
    to: filters.to,
    status: filters.status,
    keyword: filters.keyword,
  };
}
