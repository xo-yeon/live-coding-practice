import { useEffect, useState } from 'react';
import { searchProducts, type SearchProducts, type SearchResult } from './productApi';

export function useProducts(
  query: string,
  page: number,
  retry: number,
  search: SearchProducts = searchProducts,
) {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    search(query, page)
      .then((next) => {
        setResult(next);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : '검색에 실패했습니다.');
        setLoading(false);
      });
  }, [query, page, retry, search]);

  return { result, loading, error };
}
