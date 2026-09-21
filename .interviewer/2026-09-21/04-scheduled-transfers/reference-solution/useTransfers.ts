import { useEffect, useRef, useState } from 'react';
import { transferApi } from './api';
import type { Account, Transfer, TransferFilters } from './types';

export function useTransfers(filters: TransferFilters) {
  const [items, setItems] = useState<Transfer[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const requestId = useRef(0);
  const pendingCancel = useRef(new Set<string>());

  useEffect(() => {
    const id = ++requestId.current;
    let active = true;
    setLoading(true);
    setError('');
    transferApi
      .list({ keyword: filters.keyword, status: filters.status })
      .then((result) => {
        if (!active || id !== requestId.current) return;
        setItems(result.items);
        setAccount(result.account);
      })
      .catch((reason: Error) => {
        if (active && id === requestId.current) setError(reason.message);
      })
      .finally(() => {
        if (active && id === requestId.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters.keyword, filters.status, version]);

  async function cancel(id: string) {
    if (pendingCancel.current.has(id)) return;
    pendingCancel.current.add(id);
    setError('');
    try {
      await transferApi.cancel(id);
      requestId.current += 1;
      setVersion((current) => current + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '취소 실패');
    } finally {
      pendingCancel.current.delete(id);
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
