# 05. GitHub Actions와 CircleCI: 자동 실행보다 실패를 막는 경계

## 30초 답변

> CI는 같은 환경에서 설치·린트·타입 검사·테스트·빌드를 재현해 변경을 검증하고, CD는 검증된 산출물을 안전하게 배포하는 과정입니다. GitHub Actions에서는 workflow가 event로 시작되고 job이 runner에서 실행되며 step이 명령이나 action을 수행합니다. job 의존성, 캐시와 아티팩트의 차이, 최소 권한, 배포 environment 승인을 중요하게 봅니다.

## 최소 예제

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

## 꼭 구분할 것

- **workflow**: 이벤트에 반응하는 자동화 전체.
- **job**: 하나의 runner에서 실행되는 step 묶음. 기본적으로 job끼리는 병렬이다.
- **step**: 셸 명령 또는 재사용 가능한 action.
- `needs`: job 실행 순서와 선행 성공 조건을 표현한다.
- **cache**: 다음 실행의 속도를 높이기 위한 재생성 가능한 데이터.
- **artifact**: 빌드 결과, 테스트 보고서처럼 실행 간 전달하거나 보관할 결과물.
- **secret**: 민감한 값. 로그·fork PR·권한 범위를 고려한다.
- **environment**: production 같은 배포 대상에 승인, 브랜치 제한, 전용 secret을 걸 수 있다.

## 실무 안전장치

- PR마다 immutable 설치 후 lint/typecheck/test/build를 실행한다.
- 같은 브랜치의 오래된 실행은 `concurrency`로 취소해 자원과 잘못된 배포를 줄인다.
- `permissions`를 최소화하고 가능한 경우 장기 클라우드 키 대신 짧은 수명의 OIDC 인증을 고려한다.
- 배포 job은 검증 job에 `needs`로 연결하고 production environment 승인을 적용한다.
- 캐시 hit를 성공의 근거로 삼지 않는다. 깨진 캐시는 삭제 후 다시 만들 수 있어야 한다.

## CircleCI와 대응시켜 보기

CircleCI도 `.circleci/config.yml`에서 jobs와 workflows를 구성합니다. GitHub Actions의 runner와 비슷한 실행 환경을 executor로 고르고, cache·workspace·artifact의 목적을 구분합니다. 문법을 모두 외우기보다 “어떤 이벤트가 어떤 검증을 어떤 환경에서 실행하고, 결과를 다음 단계로 어떻게 넘기는가”를 설명하세요.

## 자주 나오는 질문

### Q. 모든 검증을 한 job에 넣을까요, 나눌까요?

한 job은 설치를 한 번만 해 단순하지만 어느 검증이 느린지와 병렬화 이점이 작습니다. 여러 job은 빠른 피드백과 격리가 가능하지만 설치·캐시·아티팩트 전달 비용이 생깁니다. 저장소 규모와 실패 빈도로 선택합니다.

### Q. dependency cache와 `node_modules` artifact는 같은가요?

아닙니다. 캐시는 재생성 가능한 다운로드 비용을 줄이는 최적화이고 hit가 보장되지 않습니다. artifact는 특정 실행에서 생성한 결과를 보관하거나 다른 job으로 넘기는 용도입니다. `setup-node`의 패키지 매니저 캐시는 보통 전역 패키지 데이터 캐시이며 `node_modules` 자체를 캐시하는 것과 다릅니다.

### Q. CI는 성공했는데 배포가 깨질 수 있나요?

가능합니다. 런타임 환경 변수, 권한, DB/API 호환성, 배포 순서, 트래픽 전환은 빌드 테스트와 별개입니다. 동일 산출물 승격, smoke test, 점진 배포와 롤백 절차가 필요합니다.

## 라이브 코딩 체크

- workflow trigger가 PR, main push, 수동 배포 중 무엇인가?
- Node/패키지 매니저 버전과 lockfile 설치가 재현 가능한가?
- 병렬 job 사이에 실제 의존성이 빠졌는가?
- cache와 artifact를 혼동했는가?
- fork PR에서 secret이 필요한 단계를 안전하게 다루는가?
- 배포가 검증 완료와 승인 뒤에만 실행되는가?

## 공식 문서

- [Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- [Dependency caching](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [CircleCI Concepts](https://circleci.com/docs/concepts/)

