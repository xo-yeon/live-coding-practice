# 02. 렌더·상태·파생값: 저장할 값부터 정하기

## 상황과 Before

즐겨찾기 개수와 항목 ID 목록을 함께 보여줍니다. 다음은 컴포넌트 내부 발췌입니다.

```tsx
const [ids, setIds] = useState<string[]>([]);
const [count, setCount] = useState(0);

function add(id: string) {
  setIds([...ids, id]);
  setCount(ids.length);
}
```

처음 추가하면 목록에는 한 개, 개수에는 0이 표시됩니다. `setIds`는 지금 실행 중인 함수의 `ids` 값을 바꾸지 않습니다. 다음 렌더에 사용할 상태 변경을 예약합니다.

## After와 근거

```tsx
const [ids, setIds] = useState<string[]>([]);
const count = ids.length;

function add(id: string) {
  setIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
}
```

개수는 목록에서 계산 가능하므로 따로 동기화하지 않습니다. 추가·삭제·초기화마다 두 상태를 맞출 책임이 사라집니다. updater 함수는 React가 순서대로 처리하는 이전 상태를 받아 다음 상태를 계산합니다. 이 함수 안에서 API 요청 같은 부수 효과를 실행하지 않습니다.

다음 두 호출을 한 이벤트에서 실행하는 경우도 비교해보세요.

```tsx
// 두 호출 모두 같은 렌더의 n을 사용: n이 0이면 결과는 1
setN(n + 1);
setN(n + 1);

// 이전 업데이트 결과를 이어받음: n이 0이면 결과는 2
setN((previous) => previous + 1);
setN((previous) => previous + 1);
```

기억할 것은 “setState는 느리다”보다 “현재 렌더의 값은 그 렌더의 스냅샷이다”입니다. [React의 상태 스냅샷 설명](https://react.dev/learn/state-as-a-snapshot)을 참고하세요.

## 언제 두 상태가 필요한가

편집 중인 제목과 서버에 저장된 제목은 의미가 다릅니다.

```tsx
const [savedTitle, setSavedTitle] = useState('독서 모임');
const [draftTitle, setDraftTitle] = useState('독서 모임');
const isDirty = draftTitle !== savedTitle;
```

두 제목은 취소·저장 동작 때문에 달라질 수 있어 각각 필요합니다. `isDirty`는 두 값의 비교 결과이므로 계산합니다. state가 두 개라는 이유로 나쁜 코드가 되는 것은 아닙니다.

props를 `useState(props.title)`로 복사하면 props가 바뀔 때 자동으로 다시 초기화되지 않습니다. 새 항목을 열면 편집을 초기화할지, 편집 중 초안을 유지할지 먼저 정해야 합니다. `key={item.id}`로 편집기를 바꾸면 새 항목에서 내부 상태 전체를 초기화하는 정책을 표현할 수 있습니다.

## 검증

추가, 같은 ID 다시 추가, 삭제, 전체 초기화마다 화면 개수가 실제 목록 길이와 같은지 확인합니다. 초기 state만 검사하면 동기화 문제를 찾기 어렵습니다.

## 변형 질문과 해설

**질문:** 계산을 `useEffect`에 넣고 결과 state를 갱신하면 안 되는가?

**해설:** 단순 파생값은 렌더에서 계산하면 충분합니다. Effect를 거치면 추가 상태와 갱신 과정이 생깁니다. 외부 시스템과 동기화할 일이 있는지부터 구분합니다. 비용이 크다면 측정 후 메모이제이션을 검토합니다. [불필요한 Effect 줄이기](https://react.dev/learn/you-might-not-need-an-effect)

**면접 답변:** “개수는 독립적으로 편집하는 값이 아니어서 목록에서 계산했습니다. 저장값과 초안처럼 서로 다른 의미를 가진 상태까지 합치지는 않았습니다.”

[목차](../README.md) · [다음 수업](03-input-and-types.md)
