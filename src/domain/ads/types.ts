export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  dailyBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  updatedAt: string;
}
