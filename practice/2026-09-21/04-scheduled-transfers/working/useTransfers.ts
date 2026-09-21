import { useEffect, useState } from 'react';
import { transferApi } from './api';
import type { Account, Transfer, TransferFilters } from './types';

export function useTransfers(filters: TransferFilters) {
  const [items, setItems] = useState<Transfer[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    transferApi
      .list({ keyword: filters.keyword, status: filters.status })
      .then((result) => {
        setItems(result.items);
        setAccount(result.account);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [filters.keyword, filters.status, version]);

  async function cancel(id: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status: 'CANCELLED' } : item)),
    );
    try {
      await transferApi.cancel(id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '취소 실패');
    }
  }

  return {
    items,
    account,
    loading,
    error,
    cancel,
    refresh: () => setVersion((value) => value + 1),
  };
}
