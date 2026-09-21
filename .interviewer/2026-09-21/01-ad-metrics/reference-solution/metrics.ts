import type { RawCampaign } from '../../../../practice/2026-09-21/01-ad-metrics/working/metrics';

const toFiniteNumber = (value: number | string) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const ratio = (numerator: number, denominator: number, multiplier = 1) =>
  denominator === 0 ? 0 : (numerator / denominator) * multiplier;

export function getCampaignRows(campaigns: RawCampaign[]) {
  return [...campaigns]
    .sort((a, b) => toFiniteNumber(b.spent) - toFiniteNumber(a.spent))
    .map((campaign) => {
      const spent = toFiniteNumber(campaign.spent);
      const impressions = toFiniteNumber(campaign.impressions);
      const clicks = toFiniteNumber(campaign.clicks);
      const conversions = toFiniteNumber(campaign.conversions);
      const revenue = toFiniteNumber(campaign.revenue);
      return {
        id: campaign.id,
        name: campaign.name,
        ctr: `${ratio(clicks, impressions, 100).toFixed(2)}%`,
        cvr: `${ratio(conversions, clicks, 100).toFixed(2)}%`,
        cpc: `${Math.round(ratio(spent, clicks)).toLocaleString('ko-KR')}원`,
        roas: `${ratio(revenue, spent, 100).toFixed(2)}%`,
      };
    });
}
