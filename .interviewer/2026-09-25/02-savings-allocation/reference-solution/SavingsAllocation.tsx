import { useState, type FormEvent } from 'react';
import { allocateSavings, initialGoals, validateTotal, type Allocation } from './allocation';
import { AllocationTable } from './AllocationTable';

export function SavingsAllocation() {
  const [raw, setRaw] = useState('100000');
  const [goals, setGoals] = useState(initialGoals);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Allocation[] | null>(null);

  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateTotal(raw);
    if (message) {
      setError(message);
      setRows(null);
      return;
    }
    setError('');
    setRows(allocateSavings(Number(raw), goals));
  }

  return (
    <main>
      <header>
        <p>LEVEL 2 · 가상 저축 계획</p>
        <h1>저축 목표별 금액 배분</h1>
        <p>목표의 비중에 맞춰 이번 달 저축액을 나눠봅니다.</p>
      </header>
      <form onSubmit={preview} noValidate>
        <label>
          저축할 금액
          <input value={raw} onChange={(event) => { setRaw(event.target.value); setRows(null); setError(''); }} inputMode="decimal" />
        </label>
        <fieldset>
          <legend>목표별 비중 (1~100)</legend>
          {goals.map((goal) => (
            <label key={goal.id}>
              {goal.name}
              <input type="number" min="1" max="100" value={goal.weight}
                onChange={(event) => {
                  const weight = Number(event.target.value);
                  if (!Number.isInteger(weight) || weight < 1 || weight > 100) return;
                  setRows(null);
                  setError('');
                  setGoals(goals.map((item) => item.id === goal.id ? { ...item, weight } : item));
                }} />
            </label>
          ))}
        </fieldset>
        <button type="submit">배분 미리보기</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {rows && <AllocationTable rows={rows} />}
      <p>실제 이체는 실행되지 않습니다.</p>
      <a href="/">문제 목록으로</a>
    </main>
  );
}
