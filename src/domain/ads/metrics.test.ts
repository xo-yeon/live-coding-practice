import { describe, expect, it } from 'vitest';

import { calculateMetrics } from './metrics';
import type { Campaign } from './types';

const base: Campaign = {
  id: '1',
  name: '테스트',
  status: 'ACTIVE',
  dailyBudget: 1000,
  spent: 100,
  impressions: 1000,
  clicks: 10,
  conversions: 2,
  revenue: 400,
  updatedAt: '2026-09-21',
};

describe('calculateMetrics', () => {
  it('광고 지표를 계산한다', () => {
    expect(calculateMetrics(base)).toEqual({ ctr: 1, cvr: 20, cpc: 10, roas: 400 });
  });

  it('분모가 0이면 안전하게 0을 반환한다', () => {
    expect(calculateMetrics({ ...base, spent: 0, impressions: 0, clicks: 0 })).toEqual({
      ctr: 0,
      cvr: 0,
      cpc: 0,
      roas: 0,
    });
  });
});
