import { useEffect, useState } from 'react';

import type { Campaign } from '../../../../src/domain/ads/types';

export function CampaignSearch() {
  const [query, setQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setStatus('loading');
      try {
        const response = await fetch(`/api/campaigns?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('검색에 실패했습니다.');
        setCampaigns((await response.json()) as Campaign[]);
        setStatus('idle');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      }
    }, 250);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query]);

  return (
    <section>
      <label>캠페인 검색<input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {status === 'loading' && <p role="status">검색 중…</p>}
      {status === 'error' && <p role="alert">검색에 실패했습니다. 다시 시도해주세요.</p>}
      {status === 'idle' && <p>{campaigns.length}개 결과</p>}
      <ul>{campaigns.map((campaign) => <li key={campaign.id}>{campaign.name}</li>)}</ul>
    </section>
  );
}
