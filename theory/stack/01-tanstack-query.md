# 01. TanStack Query: 서버 상태를 서버 상태답게 다루기

## 30초 답변

> TanStack Query는 API 응답을 전역 변수처럼 저장하는 도구라기보다, 서버 상태의 조회·캐시·신선도·재시도·동기화를 관리하는 도구입니다. 변경 가능한 입력은 query key에 포함하고, 조회 결과를 임의의 로컬 state에 복사하지 않습니다. mutation 뒤에는 서버 응답으로 캐시를 직접 갱신하거나 관련 query를 무효화하며, 낙관적 업데이트는 실패 시 롤백까지 한 동작으로 설계합니다.

## 반드시 구분할 것

- **서버 상태**: 여러 사용자가 바꿀 수 있고 내 화면 밖에 원본이 있다. 신선도와 재조회가 중요하다.
- **클라이언트 상태**: 열린 패널, 선택 행, 작성 중인 필터처럼 현재 UI가 소유한다.
- `staleTime`: 데이터를 언제부터 오래됐다고 판단할지 정한다. 기본값은 `0`이므로 조회 직후에도 stale이다.
- `gcTime`: 사용 중이지 않은 query 결과를 메모리에 얼마나 보관할지 정한다. 신선도 시간이 아니다.
- `isPending`: 최초로 쓸 데이터가 아직 없는 상태에 가깝다.
- `isFetching`: 최초 조회와 백그라운드 재조회를 포함해 현재 요청 중인 상태다.

`stale`은 삭제됐다는 뜻이 아니다. 캐시를 화면에 보여주면서 적절한 시점에 백그라운드 재조회할 수 있다.

## query key는 요청의 입력이다

```tsx
function CampaignTable({ accountId, status }: Props) {
  const campaigns = useQuery({
    queryKey: ['campaigns', accountId, { status }],
    queryFn: ({ signal }) => fetchCampaigns({ accountId, status, signal }),
    staleTime: 30_000,
  });

  // pending, error, empty, data 상태를 구분해 렌더링한다.
}
```

`accountId`나 `status`가 `queryFn` 결과를 바꾸면 key에도 있어야 합니다. 빠지면 다른 계정이나 필터의 결과를 같은 캐시로 오인할 수 있습니다. `AbortSignal`을 실제 요청에 전달하면 더 이상 필요 없는 요청을 취소할 수 있습니다.

서버 응답을 `useEffect`로 `useState`에 복사하면 두 원본이 생깁니다. 사용자가 편집 중인 초안을 별도로 가져야 하는 경우에는 복사 이유와 서버 갱신 시 충돌 정책을 명확히 하세요.

## 저장 후 동기화 선택

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateCampaign,
  onSuccess: (saved) => {
    queryClient.setQueryData(['campaign', saved.id], saved);
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  },
});
```

- 서버가 완전한 최신 객체를 반환하면 `setQueryData`로 상세 캐시를 즉시 갱신할 수 있다.
- 목록의 정렬·집계·권한 계산을 클라이언트가 정확히 재현하기 어렵다면 목록을 무효화해 다시 조회한다.
- `invalidateQueries`는 일치하는 query를 stale로 만들고, 기본적으로 활성 query를 백그라운드 재조회한다.

### 낙관적 업데이트

빠른 화면 반응이 중요할 때는 보통 `요청 중인 조회 취소 → 이전 값 스냅샷 → 임시 반영 → 실패 시 롤백 → 종료 후 재검증` 순서입니다. 결제·예산처럼 잘못된 성공 표시의 비용이 큰 동작은 낙관적 업데이트가 오히려 부적절할 수 있습니다. 서버의 멱등성이나 동시성 제어도 클라이언트 캐시가 대신 보장하지 못합니다.

## 자주 나오는 질문

### Q. Redux/Jotai가 있는데 왜 TanStack Query가 필요한가요?

서버 상태에는 캐시 key, 신선도, 중복 요청, 재시도, 포커스 시 재조회, mutation 후 동기화 같은 수명주기가 있습니다. 이를 일반 전역 상태에 직접 구현할 수도 있지만 중복 정책 코드가 커집니다. 반대로 UI 선택 상태까지 Query에 억지로 넣을 이유는 없습니다.

### Q. `staleTime`을 길게 하면 좋은가요?

요청 수와 화면 반응은 좋아질 수 있지만 외부 변경을 늦게 보여줄 수 있습니다. 광고 예산·심사 상태처럼 최신성이 중요한 값과 거의 바뀌지 않는 코드성 데이터의 값을 다르게 정하고, 저장 후 무효화와 창 포커스 재조회 정책까지 함께 봅니다.

### Q. mutation 성공 후 무조건 invalidate하면 되나요?

안전한 기본 선택이지만 불필요한 네트워크 요청과 화면 갱신이 생길 수 있습니다. 서버 응답이 권위 있는 최신 데이터를 충분히 준다면 직접 갱신하고, 영향을 받은 목록·집계처럼 계산 범위를 모르면 무효화합니다.

### Q. Next.js SSR과 함께 쓸 때 무엇을 보나요?

서버에서 미리 조회한 cache를 dehydrate하고 클라이언트에서 hydrate해 같은 데이터를 재사용할 수 있습니다. query key와 직렬화 가능한 데이터, 서버와 브라우저의 QueryClient 수명, 너무 짧은 `staleTime` 때문에 즉시 중복 조회되는지 확인합니다.

## 라이브 코딩 체크

- 요청 결과를 또 다른 `useState`에 복사했는가?
- query key에 계정·필터·페이지 등 모든 변경 입력이 있는가?
- loading, error, empty, background fetching을 같은 상태로 취급하는가?
- 저장 버튼 중복 클릭, 실패, 재시도, 늦은 응답을 어떻게 처리하는가?
- mutation 뒤 상세·목록·집계 중 무엇이 stale해지는가?
- 낙관적 성공 표시가 제품 위험에 맞는가?

## 공식 문서

- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

