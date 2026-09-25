import { useEffect, useState } from 'react';
import { fetchQuote, type Quote } from './quoteApi';

export function useQuote(months: number) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchQuote(months)
      .then((result) => {
        setQuote(result);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : '조회 실패');
        setLoading(false);
      });
  }, [months]);

  return { quote, loading, error };
}
