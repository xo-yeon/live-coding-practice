import { useState } from 'react';
import { plans } from './quoteApi';
import { useQuote } from './useQuote';

export function InstallmentQuote() {
  const [months, setMonths] = useState(3);
  const { quote, loading, error } = useQuote(months);
  return (
    <main>
      <header>
        <p>LEVEL 2 · 가상 할부 견적</p>
        <h1>할부 예상 금액 조회</h1>
        <p>결제 예정 금액: 120,000원</p>
      </header>
      <label>
        할부 기간
        <select value={months} onChange={(event) => setMonths(Number(event.target.value))}>
          {plans.map((plan) => <option key={plan} value={plan}>{plan}개월</option>)}
        </select>
      </label>
      {loading ? <p role="status">견적 조회 중…</p> : error ? (
        <p role="alert">{error}</p>
      ) : quote ? (
        <section aria-label="견적 결과">
          <h2>{quote.months}개월 견적</h2>
          <p>월 납부액: {quote.monthlyPayment.toLocaleString('ko-KR')}원</p>
          <p>총 납부액: {quote.totalPayment.toLocaleString('ko-KR')}원</p>
        </section>
      ) : null}
      <p>기간은 조회 중에도 변경할 수 있습니다.</p>
      <a href="/">문제 목록으로</a>
    </main>
  );
}
