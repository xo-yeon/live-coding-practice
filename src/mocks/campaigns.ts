import type { Campaign } from '../domain/ads/types';

export const campaigns: Campaign[] = [
  {
    id: 'cmp-1',
    name: '신규 고객 캠페인',
    status: 'ACTIVE',
    dailyBudget: 150000,
    spent: 82000,
    impressions: 21000,
    clicks: 630,
    conversions: 41,
    revenue: 410000,
    updatedAt: '2026-09-21T08:30:00+09:00',
  },
  {
    id: 'cmp-2',
    name: '휴면 고객 리타게팅',
    status: 'PAUSED',
    dailyBudget: 90000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    updatedAt: '2026-09-20T17:20:00+09:00',
  },
];
