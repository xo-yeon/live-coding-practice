export type Quote = { months: number; monthlyPayment: number; totalPayment: number };
export const plans = [3, 6, 12] as const;

// 연습용 서버 계약: 고정 금액 120,000원, 실제 금융상품과 무관합니다.
export async function fetchQuote(months: number): Promise<Quote> {
  const delay = months === 3 ? 900 : 200;
  await new Promise((resolve) => setTimeout(resolve, delay));
  if (months === 12) throw new Error('현재 12개월 견적을 조회할 수 없습니다.');
  const totalPayment = months === 3 ? 123000 : 126000;
  return { months, monthlyPayment: totalPayment / months, totalPayment };
}
