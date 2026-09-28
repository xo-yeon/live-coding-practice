# 05. 요청 순서·오류·상태: 마지막 응답과 최신 요청

## 계약과 Before

도서 상세를 선택할 수 있고, 요청 중 다른 책으로 이동할 수 있습니다. 현재 선택한 책의 결과만 표시해야 합니다. 아래는 Hook 내부의 단순화된 코드입니다.

```tsx
useEffect(() => {
  setLoading(true);
  loadBook(bookId).then((book) => {
    setBook(book);
    setLoading(false);
  });
}, [bookId]);
```

문법 오류가 없어도 요청의 완료 순서는 보장되지 않습니다.

```text
0ms    A 선택 → A 요청 시작
50ms   B 선택 → B 요청 시작
150ms  B 완료 → B 표시
900ms  A 완료 → A 표시: 선택은 B인데 결과는 A
```

성공 경로만 있고 실패 처리도 없어, 거절된 Promise가 로딩을 끝내지 못할 수 있습니다.

## After: 결과를 적용할 자격 제한

다음은 `loadBook(id): Promise<Book>`이 있고 `Book` 타입에 `id`, `title`이 있는 상황입니다.

```tsx
type LoadState =
  | { status: 'loading'; key: string }
  | { status: 'success'; key: string; book: Book }
  | { status: 'error'; key: string; message: string };

function useBook(bookId: string) {
  const [state, setState] = useState<LoadState>({ status: 'loading', key: bookId });
  useEffect(() => {
    let active = true;
    setState({ status: 'loading', key: bookId });
    loadBook(bookId).then(
      (book) => {
        if (active) setState({ status: 'success', key: bookId, book });
      },
      () => {
        if (active) setState({ status: 'error', key: bookId, message: '조회 실패' });
      },
    );
    return () => {
      active = false;
    };
  }, [bookId]);
  // Effect 실행 전 렌더에서도 이전 책을 새 책의 결과로 표시하지 않음
  return state.key === bookId ? state : { status: 'loading' as const, key: bookId };
}
```

각 Effect 실행은 자신만의 `active`를 가집니다. 선택이 바뀌어 이전 Effect가 정리되면 이전 요청은 완료돼도 상태를 바꾸지 못합니다. 공용 ref 하나를 새 요청에서 다시 true로 바꾸는 방식과 다릅니다. 새 요청 때 결과 상태를 교체하여 이전 오류도 남기지 않습니다.

성공·실패·로딩 중 하나를 표현하는 타입은 `loading=false`, `error=true`, `data` 존재처럼 의도가 불분명한 조합을 줄입니다. 다만 재조회 중 기존 결과를 유지하는 제품이라면 “기존 데이터 + 재조회 상태”를 표현하도록 모델을 바꿔야 합니다.

## 무시와 취소는 다르다

위 코드는 요청 결과를 무시하며 요청 자체를 취소하지 않습니다. `fetch`에 `AbortSignal`을 전달하면 불필요한 작업을 취소하는 데 도움을 줍니다. 클라이언트가 취소했다고 이미 시작된 서버 작업까지 취소됐다는 뜻은 아닙니다.

API가 취소를 지원하지 않거나 처리 단계가 여러 개라면 결과 적용 여부도 관리해야 합니다. debounce는 요청 빈도를 줄일 뿐, 이미 시작한 요청의 역순 완료를 해결하지 않습니다. [Effect에서 데이터 조회와 정리](https://react.dev/reference/react/useEffect)

## 검증

두 Promise를 직접 완료할 수 있게 만든 뒤 B를 먼저 완료하고 A를 나중에 완료합니다. 마지막 결과가 B인지 확인합니다. 오래된 요청의 실패가 최신 성공을 덮지 않는지도 봅니다. 실패 → 다른 책 선택 → 성공 경로를 따로 확인합니다.

## 변형 질문과 해설

**질문:** `finally`에서 무조건 로딩을 false로 바꾸면 안전한가?

**해설:** 오래된 요청의 finally가 최신 요청의 로딩을 끝낼 수 있습니다. 성공뿐 아니라 오류와 완료 처리도 어느 요청에 속하는지 확인해야 합니다.

**면접 답변:** “마지막으로 도착한 응답이 최신 선택의 응답이라는 보장이 없습니다. 선택이 바뀌면 이전 요청의 상태 변경 권한을 제거하고, 역순 완료 테스트로 검증합니다.”

[목차](../README.md) · [다음 수업](06-mutations-and-cache.md)
