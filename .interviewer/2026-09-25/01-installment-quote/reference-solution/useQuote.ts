import { useEffect, useState } from 'react';
import { fetchQuote, type Quote } from './quoteApi';
export function useQuote(months: number) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setQuote(null);
    fetchQuote(months)
      .then((result) => { if (active) setQuote(result); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : '조회 실패');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [months]);
  return { quote, loading, error };
}
