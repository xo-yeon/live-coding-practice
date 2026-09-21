export type RawCampaign = {
  id: string;
  name: string;
  spent: number | string;
  impressions: number | string;
  clicks: number | string;
  conversions: number | string;
  revenue: number | string;
};

export function getCampaignRows(campaigns: RawCampaign[]) {
  return campaigns
    .sort((a, b) => Number(b.spent) - Number(a.spent))
    .map((campaign) => {
      const spent = Number(campaign.spent);
      const impressions = Number(campaign.impressions);
      const clicks = Number(campaign.clicks);
      const conversions = Number(campaign.conversions);
      const revenue = Number(campaign.revenue);

      return {
        id: campaign.id,
        name: campaign.name,
        ctr: `${((clicks / impressions) * 100).toFixed(2)}%`,
        cvr: `${((conversions / clicks) * 100).toFixed(2)}%`,
        cpc: `${Math.round(spent / clicks).toLocaleString('ko-KR')}원`,
        roas: `${((revenue / spent) * 100).toFixed(2)}%`,
      };
    });
}
