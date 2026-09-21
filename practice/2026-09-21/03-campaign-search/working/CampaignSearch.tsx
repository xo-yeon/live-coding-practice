import { useEffect, useState } from 'react';

import type { Campaign } from '../../../../src/domain/ads/types';

export function CampaignSearch() {
  const [query, setQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/campaigns?q=${encodeURIComponent(query)}`)
      .then((response) => response.json() as Promise<Campaign[]>)
      .then((data) => setCampaigns(data))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <section>
      <label>
        캠페인 검색
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {loading && <p role="status">검색 중…</p>}
      {!loading && <p>{campaigns.length}개 결과</p>}
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>{campaign.name}</li>
        ))}
      </ul>
    </section>
  );
}
