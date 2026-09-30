# 02. Jotai: 작고 조합 가능한 클라이언트 상태

## 30초 답변

> Jotai는 상태를 작은 atom으로 만들고 필요한 컴포넌트만 구독하게 하는 상태 관리 도구입니다. 원본 상태는 최소화하고 계산 가능한 값은 derived atom으로 표현합니다. 서버에서 온 목록 자체는 TanStack Query에 두고, 선택된 행이나 패널 상태처럼 UI가 소유하는 상태를 Jotai에 두는 식으로 경계를 나눕니다.

## atom의 네 가지 형태

```tsx
const selectedIdsAtom = atom<Set<string>>(new Set()); // primitive

const selectedCountAtom = atom((get) => get(selectedIdsAtom).size); // read-only

const clearSelectionAtom = atom(null, (_get, set) => {
  set(selectedIdsAtom, new Set());
}); // write-only action

const allSelectedAtom = atom(
  (get) => get(selectedIdsAtom).size > 0,
  (_get, set, ids: string[]) => set(selectedIdsAtom, new Set(ids)),
); // read-write
```

atom은 값 자체가 아니라 **값을 찾는 설정 객체**이고 실제 값은 store에 있습니다. 읽기 함수의 `get`은 의존성을 추적하므로 `selectedIdsAtom`이 바뀌면 `selectedCountAtom`도 다시 계산됩니다.

## 좋은 경계와 나쁜 경계

좋은 후보는 여러 먼 컴포넌트가 공유하는 필터, 선택 상태, 임시 UI 흐름입니다. 한 컴포넌트만 쓰는 값은 먼저 지역 `useState`를 고려합니다.

```tsx
// 서버 원본 목록까지 거대한 atom 하나에 복사하지 않는다.
const uiAtom = atom({ rows: [], selectedIds: [], modalOpen: false });

// 변경 이유와 구독 범위가 다른 값은 필요에 따라 나눈다.
const selectedIdsAtom = atom<Set<string>>(new Set());
const isBulkModalOpenAtom = atom(false);
```

무조건 잘게 쪼개는 것도 정답은 아닙니다. 항상 함께 바뀌고 함께 읽는 값은 한 atom이 더 단순할 수 있습니다. 렌더 성능 문제가 실제로 있는지 측정한 뒤 `selectAtom`, `focusAtom`, `splitAtom` 같은 도구를 검토합니다.

## 주의할 점

- 렌더 중 atom을 동적으로 만들면 참조가 매번 달라질 수 있다. 필요하다면 `useMemo`나 `useRef`로 동일성을 유지한다.
- 읽기만 하면 `useAtomValue`, 쓰기만 하면 `useSetAtom`을 사용해 의도를 드러내고 불필요한 구독을 줄일 수 있다.
- `Provider`/store 범위가 달라지면 같은 atom 정의도 서로 다른 값을 가질 수 있다.
- 파생 가능한 값을 별도 atom에 중복 저장하면 동기화 버그가 생긴다.
- async atom도 가능하지만, 서버 캐시의 재시도·무효화·mutation 수명주기가 필요하면 TanStack Query가 더 자연스러운지 비교한다.

## 자주 나오는 질문

### Q. Context와 무엇이 다른가요?

Context도 전역에 가까운 값을 전달할 수 있습니다. 다만 하나의 큰 Context 값이 자주 바뀌면 넓은 구독 범위를 관리해야 합니다. Jotai는 atom별 의존성과 구독을 조합하기 쉽습니다. 작은 테마 하나라면 Context만으로 충분할 수 있습니다.

### Q. atom을 작게 나누면 항상 성능이 좋아지나요?

아닙니다. 구독 범위는 줄지만 상태 관계와 갱신 코드가 복잡해질 수 있습니다. 서로 독립적으로 변하고 다른 화면이 구독하는지 먼저 봅니다. 렌더 함수 자체도 가볍고 멱등적이어야 합니다.

### Q. derived atom의 장점은 무엇인가요?

원본 하나에서 계산하므로 중복 상태의 불일치를 막고, 실제 의존 atom이 바뀔 때만 구독자에게 계산 결과를 전달하는 구조를 만들 수 있습니다.

## 라이브 코딩 체크

- 지역 state로 충분한 값을 전역화했는가?
- 서버 응답을 atom에 다시 복사했는가?
- 원본과 파생값을 둘 다 저장했는가?
- 거대한 객체 atom의 작은 필드 변경이 화면 전체를 다시 그리는가?
- atom을 컴포넌트 렌더마다 새로 만들고 있는가?
- store/Provider 범위가 테스트마다 격리되는가?

## 공식 문서

- [atom](https://jotai.org/docs/core/atom)
- [Performance](https://jotai.org/docs/guides/performance)

