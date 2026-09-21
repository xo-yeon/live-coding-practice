import { useQuery } from '@tanstack/react-query';

import type { Campaign } from './domain/ads/types';
import { formatWon } from './shared/format';

async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch('/api/campaigns');
  if (!response.ok) throw new Error('캠페인을 불러오지 못했습니다.');
  return response.json() as Promise<Campaign[]>;
}

export function App() {
  const {
    data = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

  return (
    <main>
      <header>
        <p className="eyebrow">FRONTEND LIVE CODING</p>
        <h1>광고 캠페인 운영 현황</h1>
        <p>이 화면은 실행 환경 확인용입니다. 실제 연습 코드는 practice 폴더에서 수정하세요.</p>
      </header>
      {isPending && <p role="status">캠페인을 불러오는 중…</p>}
      {error && <p role="alert">{error.message}</p>}
      <section className="campaign-grid" aria-label="캠페인 목록">
        {data.map((campaign) => (
          <article key={campaign.id}>
            <span className={`status status-${campaign.status.toLowerCase()}`}>
              {campaign.status}
            </span>
            <h2>{campaign.name}</h2>
            <dl>
              <div>
                <dt>일 예산</dt>
                <dd>{formatWon(campaign.dailyBudget)}</dd>
              </div>
              <div>
                <dt>오늘 지출</dt>
                <dd>{formatWon(campaign.spent)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}
