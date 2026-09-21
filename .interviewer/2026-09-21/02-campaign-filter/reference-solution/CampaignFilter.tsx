import { useState } from 'react';

import type { Campaign, CampaignStatus } from '../../../../src/domain/ads/types';

type Filter = CampaignStatus | 'ALL';

export function CampaignFilter({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sortByName, setSortByName] = useState(false);
  const filtered = initialCampaigns.filter((campaign) => filter === 'ALL' || campaign.status === filter);
  const visible = sortByName ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered;
  const totalSpent = visible.reduce((sum, campaign) => sum + campaign.spent, 0);

  return (
    <section>
      <label>상태<select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
        <option value="ALL">전체</option><option value="ACTIVE">운영 중</option><option value="PAUSED">일시 중지</option>
      </select></label>
      <button type="button" onClick={() => setSortByName(true)}>이름순 정렬</button>
      <p>현재 지출 합계: {totalSpent.toLocaleString('ko-KR')}원</p>
      <ul>{visible.map((campaign) => <li key={campaign.id}>{campaign.name} · {campaign.status}</li>)}</ul>
    </section>
  );
}
