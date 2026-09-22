import { useState } from 'react';
import { BudgetInput } from '../practice/2026-09-22/02-budget-input/working/BudgetInput';
import { RecipientPicker } from '../practice/2026-09-22/03-recipient-picker/working/RecipientPicker';

const recipients = [
  { id: 'a', name: '김하나' },
  { id: 'b', name: '이서연' },
  { id: 'c', name: '박지훈' },
];

export function BeginnerPractice() {
  const [exercise, setExercise] = useState('02');
  const [attempt, setAttempt] = useState(0);
  return (
    <main>
      <h1>짧은 코드부터 연습하기</h1>
      <p>01 거래 합계는 테스트로 실행합니다. 아래에서는 02와 03의 화면을 조작할 수 있습니다.</p>
      <label>
        연습 문제
        <select value={exercise} onChange={(event) => setExercise(event.target.value)}>
          <option value="02">02 생활비 예산 입력</option>
          <option value="03">03 받는 분 선택</option>
        </select>
      </label>
      <button type="button" onClick={() => setAttempt((value) => value + 1)}>
        처음부터 다시
      </button>
      <article key={exercise + '-' + attempt}>
        {exercise === '02' ? <BudgetInput /> : <RecipientPicker recipients={recipients} />}
      </article>
      <a href="/">환경 확인 화면</a>
    </main>
  );
}
