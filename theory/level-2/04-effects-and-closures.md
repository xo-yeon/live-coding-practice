# 04. Effect·클로저·정리: 타이머가 왜 멈춰 보일까

클로저는 함수가 만들어질 때의 주변 변수에 접근할 수 있는 성질입니다. React에서는 각 렌더에서 만든 함수가 그 렌더의 값을 기억한다는 점이 중요합니다.

## Before

아래는 컴포넌트 내부입니다. 목표는 1초마다 초를 증가시키는 것입니다.

```tsx
const [seconds, setSeconds] = useState(0);

useEffect(() => {
  setInterval(() => setSeconds(seconds + 1), 1000);
}, []);
```

초깃값 0을 기억한 콜백이 반복해서 `setSeconds(1)`을 실행합니다. 1초 뒤 1이 되고 다음에도 1입니다. 빈 의존성 배열은 “콜백이 최신 값을 자동으로 읽는다”는 뜻이 아닙니다. 화면을 떠나도 타이머가 해제되지 않는 문제도 있습니다.

## After

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setSeconds((previous) => previous + 1);
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

updater는 이전 값으로 다음 값을 계산하므로 Effect에서 `seconds`를 읽지 않아도 됩니다. 정리 함수는 이 Effect가 만든 타이머를 해제합니다. 타이머를 state로 저장할 필요는 없습니다. 이 예제에서는 Effect의 지역 변수면 충분합니다.

## 의존성을 넣어야 할 때

```tsx
// roomId는 props, connect는 모듈에서 가져온 함수라고 가정
useEffect(() => {
  const connection = connect(roomId);
  connection.open();
  return () => connection.close();
}, [roomId]);
```

채팅방이 바뀌면 기존 연결을 닫고 새 연결을 열어야 하므로 `roomId`가 의존성입니다. 의존성 경고를 지우려는 목적으로 배열을 비우면 잘못된 방에 연결될 수 있습니다. 연결 함수 자체가 props라면 그 함수의 변경도 고려해야 합니다.

개발 중 StrictMode는 Effect의 정리가 올바른지 확인하려고 추가 setup·cleanup을 실행할 수 있습니다. 두 번 보인다는 이유만으로 StrictMode를 제거하기보다, 시작한 일을 정리할 수 있는지 확인합니다. [React useEffect 문서](https://react.dev/reference/react/useEffect)

## Effect가 필요 없는 경우

```tsx
// rows와 keyword가 렌더의 입력일 때
const visible = rows.filter((row) => row.name.includes(keyword));
```

이것은 외부 시스템과의 동기화가 아니라 입력으로부터의 계산입니다. 반면 DOM 이벤트 구독, 타이머, 네트워크 연결은 생명주기와 정리 시점을 고려해야 합니다. 저장 버튼을 눌렀을 때의 요청은 그 이벤트 핸들러에서 시작하는 편이 의도를 드러냅니다.

## ref와 state의 차이

state 변경은 렌더를 요청하고, ref의 `current` 변경은 렌더를 요청하지 않습니다. 화면에 보여줄 값을 ref에만 넣으면 화면이 갱신되지 않습니다. 타이머 ID나 즉시 확인할 실행 잠금처럼 화면 출력과 직접 관계없는 값은 ref가 적절할 수 있습니다. ref 사용 자체가 좋거나 나쁜 것은 아닙니다.

## 검증과 변형

가짜 타이머로 3초를 진행시켜 3이 되는지, unmount 뒤 타이머가 정리되는지 확인합니다. 실제로 3초씩 기다리는 테스트보다 빠르고 일관적입니다.

**질문:** 의존성을 `[seconds]`로 바꾸면 어떤가?

**해설:** 정리를 추가하면 값이 바뀔 때마다 타이머를 다시 만드는 구현도 가능합니다. 하지만 이 요구사항에서는 계속 구독을 다시 만들 이유가 없으므로 updater가 더 직접적입니다. “의존성을 적게 쓰는 것이 좋다”가 아니라 읽어야 하는 값을 줄일 수 있는 구조를 선택한 것입니다.

**면접 답변:** “초기 값을 캡처한 콜백이 같은 값을 반복 설정했습니다. 이전 상태 기반 updater를 사용하고 타이머 생명주기에 맞춰 정리를 추가하겠습니다.”

[목차](../README.md) · [다음 수업](05-async-state.md)
