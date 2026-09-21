import { delay, http, HttpResponse } from 'msw';

import { campaigns } from './campaigns';
import { transferHandlers } from './transfers';

export const handlers = [
  ...transferHandlers,
  http.get('/api/campaigns', async ({ request }) => {
    await delay(120);
    const keyword = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() ?? '';
    return HttpResponse.json(
      campaigns.filter((campaign) => campaign.name.toLowerCase().includes(keyword)),
    );
  }),
];
