import { useState } from 'react';

export function BudgetInput() {
  const [amount, setAmount] = useState('10000');
  const [remaining, setRemaining] = useState(90000);
  const budget = 100000;

  function changeAmount(value: string) {
    setAmount(value);
    setRemaining(budget - Number(amount));
  }

  return (
    <section>
      <h2>생활비 예산</h2>
      <label>
        사용할 금액
        <input
          type="number"
          min="0"
          max={budget}
          value={amount}
          onChange={(event) => changeAmount(event.target.value)}
        />
      </label>
      <p>남은 예산: {remaining || budget}원</p>
    </section>
  );
}
