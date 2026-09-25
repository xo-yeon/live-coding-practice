import { useState } from 'react';

// 처음 사용할 금액은 10,000원입니다.
// 입력을 바꾸면 현재 입력값 기준으로 남은 예산이 즉시 표시되어야 합니다.
// 예산을 모두 쓰면 0원을 표시합니다.
// 이번에는 0~100,000 정수와 빈 입력만 다루며, 빈 입력은 0으로 취급합니다.

export function BudgetInput() {
  const [amount, setAmount] = useState<string>('10000');
  const budget: number = 100000;
  const remaining: number = budget - Number(amount);

  /* [내 작성 코드]
  const onChangeAmount = (value: string) => {
    if (Number(value) > budget) return;

    // 숫자가 아닌 모든 문자(\D) 제거
    setAmount(value.replace(/\D/g, ''));
  };
  */

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
          // [정답 코드]: 단순 이벤트 타겟 값 전달
          onChange={(event) => setAmount(event.target.value)}
          /* [내 작성 코드]
          onChange={(event) => onChangeAmount(event.target.value)}
          */
        />
      </label>
      <p>남은 예산: {remaining}원</p>
    </section>
  );
}
