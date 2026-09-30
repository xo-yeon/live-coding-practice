# 프론트엔드 기술 스택 통합 교재

사용자가 제공한 Toss Ads 기술 목록을 바탕으로 만든 **면접 대비용 자체 학습 자료**입니다. 실제 기출이나 회사 내부 구현을 설명하는 문서는 아닙니다. 라이브 코딩에서 라이브러리 API를 외우는 것보다, 어떤 상태를 어디에 두고 어떤 실패를 막는지 설명하는 데 초점을 둡니다.

이 교재는 안내와 학습 순서, 01~06의 개념·예제·면접 질문·라이브 코딩 체크를 한 파일에 모았습니다. 전체를 복사해 노션에서 이어서 읽을 수 있습니다. 각 장의 공식 문서 링크는 참고용으로 유지했습니다.

코드 블록은 독립적인 학습 발췌입니다. 생략된 import·타입·API·Provider·theme 등은 해당 프로젝트가 제공한다고 가정하며, 모든 블록을 하나의 실행 파일로 합치는 예제는 아닙니다. 버전과 설정에 따른 차이는 실제 저장소에서 확인합니다.

## 권장 순서와 시간

| 우선순위 | 수업 | 권장 시간 | 여기까지 말할 수 있으면 충분한 것 |
| --- | --- | ---: | --- |
| 1 | TanStack Query | 45분 | 서버 상태의 신선도·캐시·저장 후 동기화 |
| 2 | Jotai | 30분 | 원자 단위 클라이언트 상태와 파생 상태 |
| 3 | Yarn Berry와 pnpm | 35분 | lockfile·엄격한 의존성·워크스페이스·CI 설치 |
| 4 | Vite·esbuild·SWC | 25분 | 개발 서버·번들링·변환·타입 검사의 차이 |
| 5 | GitHub Actions와 CircleCI | 35분 | 검증 파이프라인·캐시·아티팩트·배포 안전장치 |
| 보충 | Next.js와 Emotion | 20분 | 서버/클라이언트 경계와 스타일링 주의점 |

총 3시간 안팎입니다. 시간이 부족하면 01~03과 05만 먼저 보세요. React·TypeScript 기본은 공통 이론, 광고 도메인 적용은 Ads 운영툴 예상 문제에서 이어집니다.

## 공부 방법

각 장에서 다음 네 가지만 반복합니다.

1. 맨 위의 `30초 답변`을 소리 내어 말합니다.
2. 예제 코드에서 잘못된 경계가 무엇인지 찾습니다.
3. 면접 질문에 **선택 → 이유 → 단점 → 검증** 순서로 답합니다.
4. `라이브 코딩 체크`를 보고 낯선 저장소를 훑는 순서를 익힙니다.

버전별 옵션 이름을 전부 외울 필요는 없습니다. 대신 “왜 이 도구를 썼는가”, “다른 선택은 언제 더 나은가”, “도구가 보장하지 않는 것은 무엇인가”를 답할 수 있어야 합니다.

---

## 01. TanStack Query: 서버 상태를 서버 상태답게 다루기

### 30초 답변

> TanStack Query는 API 응답을 전역 변수처럼 저장하는 도구라기보다, 서버 상태의 조회·캐시·신선도·재시도·동기화를 관리하는 도구입니다. 변경 가능한 입력은 query key에 포함하고, 조회 결과를 임의의 로컬 state에 복사하지 않습니다. mutation 뒤에는 서버 응답으로 캐시를 직접 갱신하거나 관련 query를 무효화하며, 낙관적 업데이트는 실패 시 롤백까지 한 동작으로 설계합니다.

### 반드시 구분할 것

- **서버 상태**: 여러 사용자가 바꿀 수 있고 내 화면 밖에 원본이 있다. 신선도와 재조회가 중요하다.
- **클라이언트 상태**: 열린 패널, 선택 행, 작성 중인 필터처럼 현재 UI가 소유한다.
- `staleTime`: 데이터를 언제부터 오래됐다고 판단할지 정한다. 기본값은 `0`이므로 조회 직후에도 stale이다.
- `gcTime`: 사용 중이지 않은 query 결과를 메모리에 얼마나 보관할지 정한다. 신선도 시간이 아니다.
- `isPending`: 최초로 쓸 데이터가 아직 없는 상태에 가깝다.
- `isFetching`: 최초 조회와 백그라운드 재조회를 포함해 현재 요청 중인 상태다.

`stale`은 삭제됐다는 뜻이 아니다. 캐시를 화면에 보여주면서 적절한 시점에 백그라운드 재조회할 수 있다.

### query key는 요청의 입력이다

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

### 저장 후 동기화 선택

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

#### 낙관적 업데이트

빠른 화면 반응이 중요할 때는 보통 `요청 중인 조회 취소 → 이전 값 스냅샷 → 임시 반영 → 실패 시 롤백 → 종료 후 재검증` 순서입니다. 결제·예산처럼 잘못된 성공 표시의 비용이 큰 동작은 낙관적 업데이트가 오히려 부적절할 수 있습니다. 서버의 멱등성이나 동시성 제어도 클라이언트 캐시가 대신 보장하지 못합니다.

### 자주 나오는 질문

#### Q. Redux/Jotai가 있는데 왜 TanStack Query가 필요한가요?

서버 상태에는 캐시 key, 신선도, 중복 요청, 재시도, 포커스 시 재조회, mutation 후 동기화 같은 수명주기가 있습니다. 이를 일반 전역 상태에 직접 구현할 수도 있지만 중복 정책 코드가 커집니다. 반대로 UI 선택 상태까지 Query에 억지로 넣을 이유는 없습니다.

#### Q. `staleTime`을 길게 하면 좋은가요?

요청 수와 화면 반응은 좋아질 수 있지만 외부 변경을 늦게 보여줄 수 있습니다. 광고 예산·심사 상태처럼 최신성이 중요한 값과 거의 바뀌지 않는 코드성 데이터의 값을 다르게 정하고, 저장 후 무효화와 창 포커스 재조회 정책까지 함께 봅니다.

#### Q. mutation 성공 후 무조건 invalidate하면 되나요?

안전한 기본 선택이지만 불필요한 네트워크 요청과 화면 갱신이 생길 수 있습니다. 서버 응답이 권위 있는 최신 데이터를 충분히 준다면 직접 갱신하고, 영향을 받은 목록·집계처럼 계산 범위를 모르면 무효화합니다.

#### Q. Next.js SSR과 함께 쓸 때 무엇을 보나요?

서버에서 미리 조회한 cache를 dehydrate하고 클라이언트에서 hydrate해 같은 데이터를 재사용할 수 있습니다. query key와 직렬화 가능한 데이터, 서버와 브라우저의 QueryClient 수명, 너무 짧은 `staleTime` 때문에 즉시 중복 조회되는지 확인합니다.

### 라이브 코딩 체크

- 요청 결과를 또 다른 `useState`에 복사했는가?
- query key에 계정·필터·페이지 등 모든 변경 입력이 있는가?
- loading, error, empty, background fetching을 같은 상태로 취급하는가?
- 저장 버튼 중복 클릭, 실패, 재시도, 늦은 응답을 어떻게 처리하는가?
- mutation 뒤 상세·목록·집계 중 무엇이 stale해지는가?
- 낙관적 성공 표시가 제품 위험에 맞는가?

### 공식 문서

- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

---

## 02. Jotai: 작고 조합 가능한 클라이언트 상태

### 30초 답변

> Jotai는 상태를 작은 atom으로 만들고 필요한 컴포넌트만 구독하게 하는 상태 관리 도구입니다. 원본 상태는 최소화하고 계산 가능한 값은 derived atom으로 표현합니다. 서버에서 온 목록 자체는 TanStack Query에 두고, 선택된 행이나 패널 상태처럼 UI가 소유하는 상태를 Jotai에 두는 식으로 경계를 나눕니다.

### atom의 네 가지 형태

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

### 좋은 경계와 나쁜 경계

좋은 후보는 여러 먼 컴포넌트가 공유하는 필터, 선택 상태, 임시 UI 흐름입니다. 한 컴포넌트만 쓰는 값은 먼저 지역 `useState`를 고려합니다.

```tsx
// 서버 원본 목록까지 거대한 atom 하나에 복사하지 않는다.
const uiAtom = atom({ rows: [], selectedIds: [], modalOpen: false });

// 변경 이유와 구독 범위가 다른 값은 필요에 따라 나눈다.
const selectedIdsAtom = atom<Set<string>>(new Set());
const isBulkModalOpenAtom = atom(false);
```

무조건 잘게 쪼개는 것도 정답은 아닙니다. 항상 함께 바뀌고 함께 읽는 값은 한 atom이 더 단순할 수 있습니다. 렌더 성능 문제가 실제로 있는지 측정한 뒤 `selectAtom`, `focusAtom`, `splitAtom` 같은 도구를 검토합니다.

### 주의할 점

- 렌더 중 atom을 동적으로 만들면 참조가 매번 달라질 수 있다. 필요하다면 `useMemo`나 `useRef`로 동일성을 유지한다.
- 읽기만 하면 `useAtomValue`, 쓰기만 하면 `useSetAtom`을 사용해 의도를 드러내고 불필요한 구독을 줄일 수 있다.
- `Provider`/store 범위가 달라지면 같은 atom 정의도 서로 다른 값을 가질 수 있다.
- 파생 가능한 값을 별도 atom에 중복 저장하면 동기화 버그가 생긴다.
- async atom도 가능하지만, 서버 캐시의 재시도·무효화·mutation 수명주기가 필요하면 TanStack Query가 더 자연스러운지 비교한다.

### 자주 나오는 질문

#### Q. Context와 무엇이 다른가요?

Context도 전역에 가까운 값을 전달할 수 있습니다. 다만 하나의 큰 Context 값이 자주 바뀌면 넓은 구독 범위를 관리해야 합니다. Jotai는 atom별 의존성과 구독을 조합하기 쉽습니다. 작은 테마 하나라면 Context만으로 충분할 수 있습니다.

#### Q. atom을 작게 나누면 항상 성능이 좋아지나요?

아닙니다. 구독 범위는 줄지만 상태 관계와 갱신 코드가 복잡해질 수 있습니다. 서로 독립적으로 변하고 다른 화면이 구독하는지 먼저 봅니다. 렌더 함수 자체도 가볍고 멱등적이어야 합니다.

#### Q. derived atom의 장점은 무엇인가요?

원본 하나에서 계산하므로 중복 상태의 불일치를 막고, 실제 의존 atom이 바뀔 때만 구독자에게 계산 결과를 전달하는 구조를 만들 수 있습니다.

### 라이브 코딩 체크

- 지역 state로 충분한 값을 전역화했는가?
- 서버 응답을 atom에 다시 복사했는가?
- 원본과 파생값을 둘 다 저장했는가?
- 거대한 객체 atom의 작은 필드 변경이 화면 전체를 다시 그리는가?
- atom을 컴포넌트 렌더마다 새로 만들고 있는가?
- store/Provider 범위가 테스트마다 격리되는가?

### 공식 문서

- [atom](https://jotai.org/docs/core/atom)
- [Performance](https://jotai.org/docs/guides/performance)

---

## 03. Yarn Berry와 pnpm: 설치 도구보다 의존성 규칙

### 30초 답변

> 패키지 매니저는 package.json을 읽어 의존성을 해석하고 lockfile로 정확한 버전을 고정하며 설치와 스크립트를 재현합니다. Yarn Berry는 Plug'n'Play와 workspace 기능이 강점이고, pnpm은 content-addressable store와 링크 기반 구조로 디스크 중복을 줄이면서 선언하지 않은 의존성 접근을 엄격하게 만듭니다. 팀에서는 속도 하나보다 호환성, workspace 운영, CI 재현성을 기준으로 한 도구와 lockfile만 사용합니다.

### 공통 핵심

- `package.json`: 허용할 버전 범위와 스크립트 등 프로젝트 의도를 기록한다.
- lockfile: 해석된 정확한 버전과 의존성 그래프를 고정한다.
- CI에서는 lockfile 변경을 허용하지 않는 설치(`--immutable` 또는 `--frozen-lockfile`)를 사용한다.
- lockfile을 삭제하거나 Yarn과 pnpm의 lockfile을 함께 갱신하지 않는다.
- `dependencies`와 `devDependencies`, `peerDependencies`의 소비 주체를 구분한다.

### Yarn Berry

Yarn 2 이후 계열을 흔히 Berry라고 부릅니다. 기본 설치 전략인 Plug'n'Play(PnP)는 `node_modules` 대신 `.pnp.cjs`의 의존성 맵으로 패키지 위치를 찾습니다.

장점:

- 선언하지 않은 간접 의존성을 우연히 import하는 **ghost dependency**를 빠르게 발견한다.
- 설치 구조가 명확하고 workspace, constraints 등 모노레포 기능을 제공한다.
- PnP와 캐시를 저장소에 포함하는 Zero-Installs 구성도 가능하다.

주의:

- 일부 도구가 `node_modules` 구조를 가정하면 PnP 호환 설정이나 SDK가 필요하다.
- 필요하면 `.yarnrc.yml`의 `nodeLinker: node-modules`를 선택할 수 있다.
- Zero-Installs는 Yarn Berry 자체와 같은 말이 아니며, 네이티브 의존성은 여전히 설치 과정이 필요할 수 있다.

### pnpm

pnpm은 패키지 파일을 content-addressable store에 보관하고 프로젝트의 `node_modules`에 hard link와 symbolic link 구조를 만듭니다. 여러 프로젝트가 같은 패키지 내용을 중복 저장하는 비용을 줄입니다.

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
```

```json
{
  "dependencies": {
    "@company/ui": "workspace:*"
  }
}
```

`workspace:` 프로토콜은 로컬 workspace 패키지임을 명시해 레지스트리의 동명 패키지로 잘못 해석되는 일을 막습니다. `pnpm --filter <package> test`처럼 필요한 패키지만 대상으로 명령을 실행할 수 있습니다.

### 비교 질문에 답하는 법

| 질문 | Yarn Berry | pnpm |
| --- | --- | --- |
| 기본 해석 구조 | PnP 맵, 설정 시 node_modules | store + 링크 기반 node_modules |
| 엄격성 | 선언 의존성을 PnP가 강하게 검사 | 격리된 링크 구조가 유령 의존성을 줄임 |
| 모노레포 | workspaces, constraints, focus | workspace protocol, filter, catalog 등 |
| 선택 시 확인 | 도구의 PnP 호환성 | 심볼릭 링크를 가정하지 못하는 도구 |

“무조건 어느 쪽이 빠르다”보다 현재 저장소의 도구 호환성, 캐시 전략, 배포 환경, 팀 운영 비용을 말하세요.

### 자주 나오는 질문

#### Q. 로컬에서는 되는데 CI에서 의존성을 못 찾는 이유는요?

로컬에 남은 `node_modules`, 전역 설치, 선언하지 않은 간접 의존성, 다른 lockfile/런타임 버전이 흔한 원인입니다. 깨끗한 환경에서 immutable 설치를 재현하고 직접 import한 패키지가 직접 의존성으로 선언됐는지 확인합니다.

#### Q. lockfile 충돌을 package.json만 보고 해결해도 되나요?

아닙니다. 선택한 패키지 매니저로 다시 해석하고 테스트해야 합니다. 텍스트 충돌 표시만 제거하면 그래프의 무결성이 깨질 수 있습니다.

#### Q. peer dependency는 왜 있나요?

플러그인·React 컴포넌트 라이브러리처럼 호스트가 제공해야 할 공통 패키지의 호환 범위를 표현합니다. 라이브러리가 React를 자기 내부에 중복 설치하면 서로 다른 인스턴스 때문에 문제가 날 수 있습니다.

### 라이브 코딩 체크

- `packageManager` 필드와 lockfile로 실제 도구/버전을 확인했는가?
- 코드가 import하는 패키지가 직접 선언됐는가?
- 설치 오류를 무작정 lockfile 삭제로 덮으려 하는가?
- workspace 내부 의존성 방향과 순환을 확인했는가?
- CI와 로컬의 Node 및 패키지 매니저 버전이 같은가?

### 공식 문서

- [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Yarn Cache와 Zero-Installs](https://yarnpkg.com/features/caching)
- [pnpm symlinked node_modules 구조](https://pnpm.io/symlinked-node-modules-structure)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

## 04. Vite·esbuild·SWC: 빠르다는 말보다 역할 구분

### 30초 답변

> Vite는 개발 서버와 프로덕션 빌드 경험을 제공하는 상위 도구이고, esbuild와 SWC는 JavaScript/TypeScript 변환과 최적화에 쓰일 수 있는 저수준 도구입니다. TypeScript 문법을 JavaScript로 변환하는 것과 타입 오류를 검사하는 것은 별개이므로 빠른 변환기를 써도 `tsc --noEmit` 같은 타입 검증 단계가 필요합니다.

### 역할을 분리해 보기

- **개발 서버**: 파일을 요청 시 빠르게 제공하고 HMR로 변경 부분을 반영한다.
- **변환(transpile)**: TypeScript/JSX/최신 문법을 실행 가능한 JavaScript로 바꾼다.
- **번들링**: 모듈 그래프를 따라 배포 파일로 묶고 code splitting, tree shaking 등을 수행한다.
- **타입 검사**: 값과 API 사용이 TypeScript 규칙에 맞는지 검사한다.
- **최소화(minify)**: 의미를 유지하면서 배포 파일 크기를 줄인다.

도구 이름과 역할은 일대일이 아닙니다. 버전과 플러그인에 따라 Vite 내부 구현은 바뀔 수 있으므로 “Vite는 무조건 esbuild로 모든 것을 한다”처럼 답하지 않습니다.

### 자주 나오는 질문

#### Q. 개발 서버가 빠른데 프로덕션 빌드가 필요한 이유는요?

개발은 빠른 시작과 부분 갱신이 목표이고, 배포는 캐시 가능한 파일명·코드 분할·최적화·오래된 브라우저 정책 등 다른 목표가 있습니다. 개발 서버 동작만으로 배포 산출물의 정확성을 보장하지 않습니다.

#### Q. SWC나 esbuild를 쓰면 `tsc`가 필요 없나요?

대부분의 빠른 변환은 타입 표기를 제거할 뿐 타입 의미를 완전히 검사하지 않습니다. 빌드와 별개로 타입 검사를 CI에 둡니다.

#### Q. HMR과 새로고침은 무엇이 다른가요?

HMR은 가능한 모듈만 교체해 개발 상태를 유지합니다. 상태 보존이 오히려 초기화 버그를 숨길 수 있으므로 의심되면 전체 새로고침과 깨끗한 프로덕션 빌드도 확인합니다.

### 라이브 코딩 체크

- `package.json` scripts와 설정 파일로 실제 명령을 먼저 확인한다.
- 개발 성공, 타입 검사 성공, 프로덕션 빌드 성공을 같은 것으로 보지 않는다.
- 환경 변수의 클라이언트 노출 범위와 빌드 시점 치환을 확인한다.
- 동적 import와 chunk 경계를 성능 근거 없이 늘리지 않는다.
- source map, 브라우저 대상, 플러그인 순서가 오류 재현에 영향을 주는지 본다.

### 공식 문서

- [Why Vite](https://vite.dev/guide/why)
- [SWC Getting Started](https://swc.rs/docs/getting-started)
- [esbuild](https://esbuild.github.io/)

---

## 05. GitHub Actions와 CircleCI: 자동 실행보다 실패를 막는 경계

### 30초 답변

> CI는 같은 환경에서 설치·린트·타입 검사·테스트·빌드를 재현해 변경을 검증하고, CD는 검증된 산출물을 안전하게 배포하는 과정입니다. GitHub Actions에서는 workflow가 event로 시작되고 job이 runner에서 실행되며 step이 명령이나 action을 수행합니다. job 의존성, 캐시와 아티팩트의 차이, 최소 권한, 배포 environment 승인을 중요하게 봅니다.

### 최소 예제

```yaml
name: verify
on:
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

실제 저장소에서는 `packageManager`와 지원 Node 버전에 맞춰 고정합니다. third-party action도 코드 실행 권한을 가지므로 신뢰성과 버전 고정 방식을 검토합니다.

### 꼭 구분할 것

- **workflow**: 이벤트에 반응하는 자동화 전체.
- **job**: 하나의 runner에서 실행되는 step 묶음. 기본적으로 job끼리는 병렬이다.
- **step**: 셸 명령 또는 재사용 가능한 action.
- `needs`: job 실행 순서와 선행 성공 조건을 표현한다.
- **cache**: 다음 실행의 속도를 높이기 위한 재생성 가능한 데이터.
- **artifact**: 빌드 결과, 테스트 보고서처럼 실행 간 전달하거나 보관할 결과물.
- **secret**: 민감한 값. 로그·fork PR·권한 범위를 고려한다.
- **environment**: production 같은 배포 대상에 승인, 브랜치 제한, 전용 secret을 걸 수 있다.

### 실무 안전장치

- PR마다 immutable 설치 후 lint/typecheck/test/build를 실행한다.
- 같은 브랜치의 오래된 실행은 `concurrency`로 취소해 자원과 잘못된 배포를 줄인다.
- `permissions`를 최소화하고 가능한 경우 장기 클라우드 키 대신 짧은 수명의 OIDC 인증을 고려한다.
- 배포 job은 검증 job에 `needs`로 연결하고 production environment 승인을 적용한다.
- 캐시 hit를 성공의 근거로 삼지 않는다. 깨진 캐시는 삭제 후 다시 만들 수 있어야 한다.

### CircleCI와 대응시켜 보기

CircleCI도 `.circleci/config.yml`에서 jobs와 workflows를 구성합니다. GitHub Actions의 runner와 비슷한 실행 환경을 executor로 고르고, cache·workspace·artifact의 목적을 구분합니다. 문법을 모두 외우기보다 “어떤 이벤트가 어떤 검증을 어떤 환경에서 실행하고, 결과를 다음 단계로 어떻게 넘기는가”를 설명하세요.

### 자주 나오는 질문

#### Q. 모든 검증을 한 job에 넣을까요, 나눌까요?

한 job은 설치를 한 번만 해 단순하지만 어느 검증이 느린지와 병렬화 이점이 작습니다. 여러 job은 빠른 피드백과 격리가 가능하지만 설치·캐시·아티팩트 전달 비용이 생깁니다. 저장소 규모와 실패 빈도로 선택합니다.

#### Q. dependency cache와 `node_modules` artifact는 같은가요?

아닙니다. 캐시는 재생성 가능한 다운로드 비용을 줄이는 최적화이고 hit가 보장되지 않습니다. artifact는 특정 실행에서 생성한 결과를 보관하거나 다른 job으로 넘기는 용도입니다. `setup-node`의 패키지 매니저 캐시는 보통 전역 패키지 데이터 캐시이며 `node_modules` 자체를 캐시하는 것과 다릅니다.

#### Q. CI는 성공했는데 배포가 깨질 수 있나요?

가능합니다. 런타임 환경 변수, 권한, DB/API 호환성, 배포 순서, 트래픽 전환은 빌드 테스트와 별개입니다. 동일 산출물 승격, smoke test, 점진 배포와 롤백 절차가 필요합니다.

### 라이브 코딩 체크

- workflow trigger가 PR, main push, 수동 배포 중 무엇인가?
- Node/패키지 매니저 버전과 lockfile 설치가 재현 가능한가?
- 병렬 job 사이에 실제 의존성이 빠졌는가?
- cache와 artifact를 혼동했는가?
- fork PR에서 secret이 필요한 단계를 안전하게 다루는가?
- 배포가 검증 완료와 승인 뒤에만 실행되는가?

### 공식 문서

- [Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- [Dependency caching](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [CircleCI Concepts](https://circleci.com/docs/concepts/)

---

## 06. Next.js와 Emotion 빠른 확인

이 장은 우선순위가 낮다는 뜻이 아니라, 기존 React 수업과 겹치는 부분을 줄인 보충 과정입니다.

### Next.js 30초 답변

> Next.js는 React 애플리케이션에 라우팅, 서버 렌더링, 데이터 접근과 배포 구조를 제공하는 프레임워크입니다. 코드를 서버와 브라우저 중 어디서 실행할지, 데이터와 secret을 어디까지 보낼지, 서버 HTML과 첫 클라이언트 렌더가 일치하는지를 먼저 봅니다.

확인할 것:

- Server Component와 Client Component의 경계 및 직렬화 가능한 props
- 브라우저 API나 상호작용 hook이 필요한 컴포넌트의 위치
- 서버 렌더와 첫 클라이언트 렌더가 달라 생기는 hydration mismatch
- 요청별 데이터와 사용자 간 공유 가능한 cache의 구분
- route loading/error/not-found UI와 실패 복구
- TanStack Query를 쓴다면 prefetch/dehydrate/hydrate와 중복 조회 정책

면접 질문: “모든 컴포넌트에 `'use client'`를 붙이면 왜 아쉬운가요?”

답변 골격: 브라우저 번들·hydration 범위가 커지고 서버에서만 처리할 수 있는 데이터 경계의 이점을 잃습니다. 실제 상호작용이 필요한 가장 작은 경계에 두되, 팀 구조와 라이브러리 제약도 고려합니다.

### Emotion 30초 답변

> Emotion은 JavaScript/TypeScript에서 동적 스타일과 theme을 컴포넌트와 함께 구성하는 CSS-in-JS 도구입니다. 편의성뿐 아니라 생성되는 스타일의 안정성, DOM으로 전달되는 props, SSR 시 스타일 주입 순서와 성능을 확인합니다.

```tsx
const Budget = styled.span<{ exceeded: boolean }>(({ theme, exceeded }) => ({
  color: exceeded ? theme.colors.danger : theme.colors.text,
  fontWeight: 600,
}));
```

확인할 것:

- 스타일 전용 prop이 잘못 DOM attribute로 전달되지 않는가?
- 렌더마다 크고 새로운 스타일 객체를 만들 필요가 있는가?
- 디자인 토큰/theme을 무시한 임의 색상과 간격이 늘어나는가?
- SSR에서 style 순서와 hydration이 일치하는가?
- 테스트가 내부 class 이름보다 사용자에게 보이는 상태를 검증하는가?

면접 질문: “CSS Modules 대신 Emotion을 선택할 이유와 비용은요?”

답변 골격: props/theme 기반 동적 스타일과 컴포넌트 근접성이 장점입니다. 반면 런타임 비용, SSR 설정, 디버깅과 도구 종속성이 생길 수 있습니다. 정적 스타일이 대부분이면 CSS Modules 같은 선택이 더 단순할 수 있습니다.

### 공식 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Emotion Introduction](https://emotion.sh/docs/introduction)
