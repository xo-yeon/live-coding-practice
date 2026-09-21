import { describe, expect, it } from 'vitest';

import { getCampaignRows, type RawCampaign } from '../working/metrics';

const campaigns: RawCampaign[] = [
  {
    id: 'a',
    name: '브랜드',
    spent: 100,
    impressions: 1000,
    clicks: 20,
    conversions: 2,
    revenue: 400,
  },
  {
    id: 'b',
    name: '전환',
    spent: '250',
    impressions: '2000',
    clicks: '50',
    conversions: '5',
    revenue: '1000',
  },
];

describe('getCampaignRows', () => {
  it('지출이 큰 캠페인부터 표시한다', () => {
    expect(getCampaignRows([...campaigns]).map((row) => row.id)).toEqual(['b', 'a']);
  });

  it('정상 데이터의 지표를 표시한다', () => {
    expect(getCampaignRows([campaigns[0]])[0]).toMatchObject({
      ctr: '2.00%',
      cvr: '10.00%',
      cpc: '5원',
      roas: '400.00%',
    });
  });
});
