import type { CreateTransfer, Transfer, TransferFilters, TransferPage } from './types';

const base = '/api/training/transfers';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const error = (await response.json()) as { message: string };
    throw new Error(error.message);
  }
  return response.json() as Promise<T>;
}

export const transferApi = {
  list(filters: TransferFilters) {
    const search = new URLSearchParams({ keyword: filters.keyword, status: filters.status });
    return request<TransferPage>(`${base}?${search}`);
  },
  create(draft: CreateTransfer) {
    return request<Transfer>(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
  },
  cancel(id: string) {
    return request<Transfer>(`${base}/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
  },
};
