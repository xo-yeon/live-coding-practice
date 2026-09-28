# 06. 필터를 바꾸자 결과가 없는 것처럼 보인다

## 요구사항과 Before

서버 페이지네이션 화면입니다. 필터가 바뀌면 1페이지로 이동하고 정렬은 전체 필터 결과에 적용합니다. URL을 공유하면 같은 조건이 열려야 합니다.

```tsx
const [status, setStatus] = useState('ALL');
const [page, setPage] = useState(7);
// 필터 변경 시 page는 그대로
<select onChange={(event) => setStatus(event.target.value)} />;
```

## 재현과 우선순위

전체 7페이지에서 ACTIVE만 검색했더니 결과가 1페이지만 있습니다. API에 page=7을 보내 빈 결과가 나옵니다. 사용자는 운영 중 광고가 없다고 오인할 수 있습니다. 주요 탐색 경로에서 재현된다면 사소한 컴포넌트 분리보다 우선합니다.

## After: 함께 바뀌는 조건을 한 사건으로

```tsx
type Filters = { status: 'ALL' | 'ACTIVE' | 'PAUSED'; page: number };
const [filters, setFilters] = useState<Filters>({ status: 'ALL', page: 1 });
function changeStatus(status: Filters['status']) {
  setFilters((previous) => ({ ...previous, status, page: 1 }));
}
```

필터 변경과 페이지 초기화를 같은 업데이트에서 표현합니다. `useEffect`로 나중에 페이지를 초기화하면 중간 조건으로 불필요한 조회가 나갈 수 있습니다. 삭제로 마지막 페이지가 비는 경우에는 서버 total을 기준으로 유효 페이지를 조정하는 별도 정책이 필요합니다.

URL을 원본으로 사용할 때는 위 state와 URL을 양방향 Effect로 계속 동기화하지 않습니다. 검증한 URL에서 조건을 만들고 이벤트에서 URL을 갱신하는 경로로 단순화합니다.

```ts
const params = new URLSearchParams(location.search);
const raw = Number(params.get('page') ?? '1');
const page = Number.isSafeInteger(raw) && raw >= 1 ? raw : 1;
```

status도 허용값만 받고 그 외에는 ALL로 정규화합니다. 현재 페이지 20개를 브라우저에서 정렬해 전체 정렬인 것처럼 표시하면 안 됩니다. 서버 정렬 파라미터를 보내거나 전체 데이터를 가진 구조여야 합니다.

## 검증

7페이지 → 필터 변경 → page=1로 한 번 조회되는지 확인합니다. URL 새로고침·뒤로가기·잘못된 page에서 같은 규칙을 적용합니다. 동일 비용 값의 순서는 ID 등 보조 키로 고정하여 페이지 경계가 흔들리지 않게 합니다.

## 면접에서 말하기

> “필터와 페이지가 독립적으로 바뀌어 유효하지 않은 조합을 조회합니다. 필터 변경 사건에서 페이지도 함께 초기화하겠습니다. 전체 정렬인지 현재 페이지 정렬인지 API 계약도 확인하겠습니다.”

**꼬리질문:** 전체 선택은 현재 페이지인가, 필터 전체인가?

**해설:** 제품 계약을 물어봐야 합니다. 현재 페이지 ID만 가지고 필터 전체를 선택했다고 표시할 수 없습니다. 작업 대상 범위가 금액·운영 상태 변경의 안전성에 연결됩니다.

[목차](README.md)
