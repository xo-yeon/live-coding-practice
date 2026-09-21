import { useEffect, useState } from 'react';

import type { Campaign, CampaignStatus } from '../../../../src/domain/ads/types';

type Filter = CampaignStatus | 'ALL';

export function CampaignFilter({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [filteredCampaigns, setFilteredCampaigns] = useState(initialCampaigns);

  useEffect(() => {
    setFilteredCampaigns(
      filter === 'ALL' ? campaigns : campaigns.filter((campaign) => campaign.status === filter),
    );
  }, [filter, campaigns]);

  const sortByName = () => {
    campaigns.sort((a, b) => a.name.localeCompare(b.name));
    setCampaigns([...campaigns]);
  };

  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);

  return (
    <section>
      <label>
        상태
        <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
          <option value="ALL">전체</option>
          <option value="ACTIVE">운영 중</option>
          <option value="PAUSED">일시 중지</option>
        </select>
      </label>
      <button type="button" onClick={sortByName}>
        이름순 정렬
      </button>
      <p>현재 지출 합계: {totalSpent.toLocaleString('ko-KR')}원</p>
      <ul>
        {filteredCampaigns.map((campaign, index) => (
          <li key={index}>
            {campaign.name} · {campaign.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
