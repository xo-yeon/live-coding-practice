export type SeatsResult = { ok: true; value: number } | { ok: false; message: string };

export function parseSeats(raw: string): SeatsResult {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) {
    return { ok: false, message: '좌석 수를 정수로 입력해주세요.' };
  }
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < 1 || value > 20) {
    return { ok: false, message: '1~20석을 입력해주세요.' };
  }
  return { ok: true, value };
}

export function calculatePrice(seats: number): number {
  return seats * 15000;
}
