import type { Campaign } from './types';

const safeRatio = (numerator: number, denominator: number, multiplier = 1) =>
  denominator === 0 ? 0 : (numerator / denominator) * multiplier;

export const calculateMetrics = (campaign: Campaign) => ({
  ctr: safeRatio(campaign.clicks, campaign.impressions, 100),
  cvr: safeRatio(campaign.conversions, campaign.clicks, 100),
  cpc: safeRatio(campaign.spent, campaign.clicks),
  roas: safeRatio(campaign.revenue, campaign.spent, 100),
});
