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
        <p>
          <a href="/practice/basics">Level 1: 짧은 React 코드 연습</a>
        </p>
        <a href="/practice/transfers">60분 연습: 송금 예약 관리 열기</a>
        <p>
          <a href="/practice/installments">Level 2 · 01 할부 예상 금액 조회</a>
        </p>
        <p>
          <a href="/practice/savings">Level 2 · 02 저축 목표별 금액 배분</a>
        </p>
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
