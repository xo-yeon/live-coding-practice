# 07. 리팩터링·성능: 무엇을 근거로 바꿀까

리팩터링은 관찰 가능한 동작을 유지하면서 구조를 바꾸는 작업입니다. 잘못된 동작을 바꾸는 버그 수정과 구분하면 변경 이유와 검증 범위가 명확해집니다.

## Before: 정책을 여러 곳에 복제

아래 두 조건은 예약 버튼과 안내문에서 각각 사용한다고 가정합니다.

```ts
const disabled = booking.status !== 'OPEN' || booking.remaining < seats;
const message = booking.status === 'CLOSED' ? '예약 종료' : '예약 가능';
```

좌석이 부족하면 버튼은 꺼지지만 안내는 예약 가능입니다. `PAUSED` 상태를 추가하면 안내 조건이 또 달라집니다. 줄 수보다 같은 정책이 서로 다르게 바뀔 가능성이 문제입니다.

## After: 결정과 표현 분리

```ts
type Booking = { status: 'OPEN' | 'PAUSED' | 'CLOSED'; remaining: number };
type Decision = { allowed: true } | { allowed: false; reason: string };

function canReserve(booking: Booking, seats: number): Decision {
  if (booking.status !== 'OPEN') return { allowed: false, reason: '예약 불가 상태' };
  if (seats > booking.remaining) return { allowed: false, reason: '잔여 좌석 부족' };
  return { allowed: true };
}
```

`seats`는 앞선 입력 검증을 통과한 양의 정수라는 전제입니다. UI는 이 결과로 버튼과 안내를 함께 결정합니다. 정책 변경 지점이 한 곳이 되고 React 없이도 검증할 수 있습니다. 서버도 최종 권한과 잔여 좌석을 검사해야 합니다.

단순 문자열을 반환하는 한 줄 함수까지 모두 나눌 필요는 없습니다. 파일을 나눴을 때 함께 이해해야 하는 정보가 더 흩어지는지도 확인합니다.

## 분리할 경계

| 책임                | 적절한 위치    | 이유                         |
| ------------------- | -------------- | ---------------------------- |
| 입력 표기·수치 계약 | 순수 함수      | UI 없이 경계값 검증          |
| API 통신·응답 검사  | API 모듈       | 외부 데이터와 내부 타입 경계 |
| 요청 중 상태·이벤트 | Hook 또는 화면 | 생명주기와 상태 전이         |
| 라벨·버튼·목록 표현 | 컴포넌트       | 사용자 상호작용과 접근성     |

Hook은 상태 로직을 재사용하지만 호출하는 곳마다 별도의 상태를 만듭니다. 같은 Hook을 두 번 부른다고 자동으로 상태가 공유되지는 않습니다.

## 성능 문제는 증거부터

목록이 느리다고 곧바로 모든 함수에 `useCallback`, 모든 계산에 `useMemo`를 넣지 않습니다. 느린 것이 요청 대기인지, 계산인지, DOM 렌더인지 먼저 확인합니다.

예를 들어 다음 계산은 행마다 전체 배열을 순회합니다.

```ts
const result = items.map((item) => ({
  ...item,
  total: items.reduce((sum, current) => sum + current.amount, 0),
}));
```

개수가 n이면 합계를 대략 n번 계산하여 계산량이 제곱으로 늘어납니다. 합계를 밖에서 한 번 구하면 동작을 유지하며 반복을 줄입니다.

```ts
const total = items.reduce((sum, item) => sum + item.amount, 0);
const result = items.map((item) => ({ ...item, total }));
```

그 다음에도 충분히 느릴 때 측정 결과에 따라 메모이제이션, 목록 가상화, 서버 페이지네이션 등을 검토합니다. `useMemo`는 정확성을 보장하는 장치가 아니며 의존성이 매번 달라지면 재계산합니다.

## 변형 질문과 해설

**질문:** 날짜 포맷이 같다는 이유로 모든 화면을 하나의 거대한 공통 컴포넌트로 묶어도 되는가?

**해설:** 함께 바뀌는 요구사항인지 확인해야 합니다. 우연히 같은 모양이면 향후 예외 props가 늘어날 수 있습니다. 날짜 포맷 함수만 공유하고 화면 구조는 독립적으로 두는 편이 더 단순할 수 있습니다.

**면접 답변:** “버튼과 안내가 같은 정책을 다른 조건으로 판단하고 있어 결정 함수를 추출했습니다. 길이를 줄이기 위한 분리는 아니며, 부족한 좌석과 상태 변경에서 두 UI가 일치하는지 검증하겠습니다.”

[목차](../README.md) · [다음 수업](08-integrated-walkthrough.md)
