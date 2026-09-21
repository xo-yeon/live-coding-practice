import { delay, http, HttpResponse } from 'msw';

import { campaigns } from './campaigns';

export const handlers = [
  http.get('/api/campaigns', async ({ request }) => {
    await delay(120);
    const keyword = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() ?? '';
    return HttpResponse.json(
      campaigns.filter((campaign) => campaign.name.toLowerCase().includes(keyword)),
    );
  }),
];
