import { describe, expect, it } from 'vitest';
import { summarizeTransactions } from '../working/summary';

describe('거래 합계 — 공개 테스트', () => {
  it('완료된 거래 두 건을 합산한다', () => {
    expect(
      summarizeTransactions([
        { id: 'a', amount: 1000, status: 'COMPLETED' },
        { id: 'b', amount: 2000, status: 'COMPLETED' },
      ]),
    ).toEqual({ count: 2, total: 3000 });
  });
  it('빈 목록을 처리한다', () => {
    expect(summarizeTransactions([])).toEqual({ count: 0, total: 0 });
  });
});
