import { useEffect, useRef, useState } from 'react';
import { parseSeats } from './seats';

// 한 예약의 편집 세션입니다. 다른 예약으로 이동할 때 부모에서 key를 바꿉니다.
export function useSeatsEditor(
  initialSeats: number,
  saveSeats: (seats: number) => Promise<number>,
) {
  const [confirmed, setConfirmed] = useState(initialSeats);
  const [raw, setRaw] = useState(String(initialSeats));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function changeRaw(value: string) {
    if (lock.current) return;
    setRaw(value);
    setError('');
  }

  async function submit() {
    if (lock.current) return;
    const parsed = parseSeats(raw);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      const saved = await saveSeats(parsed.value);
      if (mounted.current) {
        setConfirmed(saved);
        setRaw(String(saved));
      }
    } catch {
      if (mounted.current) setError('저장하지 못했습니다. 다시 시도해주세요.');
    } finally {
      lock.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return { confirmed, raw, saving, error, changeRaw, submit };
}
