import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Campaign } from '../../../../src/domain/ads/types';
import { CampaignFilter } from '../working/CampaignFilter';

const makeCampaign = (
  id: string,
  name: string,
  status: Campaign['status'],
  spent: number,
): Campaign => ({
  id,
  name,
  status,
  spent,
  dailyBudget: 1000,
  impressions: 100,
  clicks: 10,
  conversions: 1,
  revenue: 200,
  updatedAt: '2026-09-21',
});

const campaigns = [
  makeCampaign('2', '주말 캠페인', 'PAUSED', 200),
  makeCampaign('1', '가을 캠페인', 'ACTIVE', 100),
];

describe('CampaignFilter', () => {
  it('캠페인을 렌더링한다', () => {
    render(<CampaignFilter initialCampaigns={campaigns} />);
    expect(screen.getByText(/가을 캠페인/)).toBeInTheDocument();
    expect(screen.getByText(/주말 캠페인/)).toBeInTheDocument();
  });

  it('상태로 캠페인을 필터링한다', async () => {
    render(<CampaignFilter initialCampaigns={campaigns} />);
    fireEvent.change(screen.getByLabelText('상태'), { target: { value: 'ACTIVE' } });
    await waitFor(() => expect(screen.queryByText(/주말 캠페인/)).not.toBeInTheDocument());
    expect(screen.getByText(/가을 캠페인/)).toBeInTheDocument();
  });
});
