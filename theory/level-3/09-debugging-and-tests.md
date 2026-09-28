# 09. 트러블슈팅·테스트·설명: 추측을 증거로 바꾸기

## 실패를 한 문장으로 고정하기

“저장이 이상해요”보다 “확정 2석에서 4석으로 바꾸고 서버가 실패하면 확정 표시가 4석으로 남는다”가 재현 가능한 설명입니다. 입력, 사건, 기대 결과, 실제 결과를 구분합니다.

```text
입력: 확정 2석, 초안 4석
사건: 저장 요청이 서버 오류로 실패
기대: 확정 2석 유지, 초안 4석 유지, 오류 표시, 재시도 가능
실제: 확정 4석, 로딩 유지
영향: 저장 완료로 오인하며 다음 조작도 막힘
```

## 우선순위는 심각도와 증거로

| 문제                     | 확인된 사실            | 판단                                  |
| ------------------------ | ---------------------- | ------------------------------------- |
| 저장 실패 후 확정값 변경 | 실패 응답마다 재현     | 사용자 오판·복구 불가를 먼저 해결     |
| 중복 요청                | 빠른 호출에서 2회 발생 | 서버에서 추가 효과가 있는지 계약 확인 |
| 숫자 구분자 없음         | 항상 발생              | 기능 오류 이후 가독성 개선            |

재현이 어렵다는 이유로 심각한 문제를 뒤로 보내지 않습니다. 반대로 요청이 두 번 갔다고 반드시 두 번 결제됐다고 단정하지 않습니다. 관찰한 사실, 추정한 영향, 추가로 확인할 계약을 나눕니다.

## 기다리는 대신 완료 시점을 제어하기

고정 시간 `sleep(500)`을 넣으면 환경에 따라 테스트가 흔들립니다. Promise를 수동으로 완료하는 도구를 사용하면 저장 중·성공·실패를 정확히 나눌 수 있습니다.

```ts
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
```

`!`는 Promise 생성자 콜백이 즉시 실행되어 변수가 할당된다는 사실을 TypeScript에 알려주는 부분입니다. 런타임 검증을 추가하는 기호는 아닙니다. 테스트에서 다음처럼 사용합니다. 전체 import와 환경은 [실행 테스트](../examples/lessons.test.tsx)를 참고하세요.

```tsx
const pending = deferred<number>();
const save = vi.fn(() => pending.promise);
render(<SeatsEditor saveSeats={save} />);
fireEvent.change(screen.getByRole('textbox'), { target: { value: '4' } });
fireEvent.click(screen.getByRole('button', { name: '저장' }));

expect(screen.getByText('확정 좌석: 2석')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeDisabled();

await act(async () => {
  pending.reject(new Error('server error'));
});
expect(screen.getByRole('alert')).toBeInTheDocument();
expect(screen.getByText('확정 좌석: 2석')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeEnabled();
```

`act`는 테스트의 상태 변경과 그에 따른 React 갱신을 반영한 다음 검사하도록 돕습니다. 단순히 요청이 시작됐다는 사실과 완료됐다는 사실을 구분해야 합니다.

`getByRole`은 지금 있어야 하는 요소, `queryByRole`은 없을 수 있는 요소, `findByRole`은 나중에 나타날 요소를 기다릴 때 사용합니다. `waitFor`는 콜백의 assertion이 통과할 때까지 재확인합니다. 클릭 같은 변경 동작은 반복 실행되는 `waitFor` 안에 넣지 않습니다. [Testing Library의 비동기 검사](https://testing-library.com/docs/dom-testing-library/api-async/)

## Red → Green을 실제로 확인하기

1. 기대 동작을 나타내는 assertion을 먼저 씁니다.
2. Before 코드에서 실행해 예상한 값 차이로 실패하는지 확인합니다.
3. 원인과 연결된 최소 변경을 적용합니다.
4. 같은 테스트가 통과하는지 확인합니다.
5. 인접한 성공·실패·재시도 경로가 유지되는지 검사합니다.

이 교재의 실행 코드는 이미 After이므로 기본 실행은 통과합니다. Red를 경험하려면 예제 Hook에서 `try` 바로 전에 임시로 `setConfirmed(parsed.value)`를 추가해 실행해보세요. “확정 좌석 2석 유지” assertion이 실패해야 합니다. 실험 후 그 한 줄만 되돌립니다. 기존 `practice` 코드를 고칠 필요는 없습니다.

예상값과 실제값이 다르면 결함을 재현한 것일 수 있지만, import 실패·DOM 선택자 오타·환경 설정 오류라면 아직 제품 동작을 검증하지 못한 것입니다. 모든 빨간 테스트가 좋은 재현 테스트는 아닙니다.

## 환경 문제와 제품 문제 구분

| 증상                        | 먼저 확인할 증거                       | 다음 행동                 |
| --------------------------- | -------------------------------------- | ------------------------- |
| 페이지 모듈 요청이 HTTP 500 | 개발 서버 로그의 transform/import 오류 | 첫 번째 원인 오류 확인    |
| API가 HTTP 500              | Network의 URL·응답과 서버 계약         | 오류 UI·재시도 확인       |
| 요청은 200인데 값이 틀림    | 응답 데이터와 화면 계산                | 변환·상태 적용 과정 추적  |
| 테스트에서만 실패           | mock 초기화·정리·완료 시점             | 테스트 격리와 기다림 확인 |

첫 500을 보면 바로 의존성을 지우고 재설치하지 않습니다. 어떤 URL이 실패하는지와 로그가 무엇을 말하는지부터 봅니다. 재현에 필요한 작은 범위부터 조사합니다.

## 제한 시간에서 마무리하기

한 결함을 재현하고 고쳤다면 그 사실을 짧게 보고합니다. 관련 테스트가 통과한 뒤 타입 검사·린트를 실행하고, 환경 오류가 있으면 코드 오류와 나누어 기록합니다. 모든 테스트 작성이 어려우면 수행한 수동 시나리오와 남은 자동화 항목을 정확히 말합니다.

**설명 예시:** “저장 실패 시 확정값과 로딩이 잘못 남는 경로를 재현했습니다. 성공 응답 이후에만 확정값을 갱신하고 finally에서 잠금을 해제했습니다. 실패 후 재시도까지 검증했으며, 서버의 중복 요청 방지 정책은 이 테스트 범위에 포함되지 않습니다.”

## 변형 질문과 해설

**질문:** mock API를 사용한 테스트가 통과하면 실제 서버 연동도 검증된 것인가?

**해설:** 아닙니다. UI와 저장 함수의 계약을 검증한 것입니다. 실제 URL·HTTP 상태 처리·인증·응답 스키마는 별도 통합 검증이 필요합니다. 검증한 층과 남은 층을 구분하는 것이 중요합니다.

[목차](../README.md)
