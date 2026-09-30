# 03. Yarn Berry와 pnpm: 설치 도구보다 의존성 규칙

## 30초 답변

> 패키지 매니저는 package.json을 읽어 의존성을 해석하고 lockfile로 정확한 버전을 고정하며 설치와 스크립트를 재현합니다. Yarn Berry는 Plug'n'Play와 workspace 기능이 강점이고, pnpm은 content-addressable store와 링크 기반 구조로 디스크 중복을 줄이면서 선언하지 않은 의존성 접근을 엄격하게 만듭니다. 팀에서는 속도 하나보다 호환성, workspace 운영, CI 재현성을 기준으로 한 도구와 lockfile만 사용합니다.

## 공통 핵심

- `package.json`: 허용할 버전 범위와 스크립트 등 프로젝트 의도를 기록한다.
- lockfile: 해석된 정확한 버전과 의존성 그래프를 고정한다.
- CI에서는 lockfile 변경을 허용하지 않는 설치(`--immutable` 또는 `--frozen-lockfile`)를 사용한다.
- lockfile을 삭제하거나 Yarn과 pnpm의 lockfile을 함께 갱신하지 않는다.
- `dependencies`와 `devDependencies`, `peerDependencies`의 소비 주체를 구분한다.

## Yarn Berry

Yarn 2 이후 계열을 흔히 Berry라고 부릅니다. 기본 설치 전략인 Plug'n'Play(PnP)는 `node_modules` 대신 `.pnp.cjs`의 의존성 맵으로 패키지 위치를 찾습니다.

장점:

- 선언하지 않은 간접 의존성을 우연히 import하는 **ghost dependency**를 빠르게 발견한다.
- 설치 구조가 명확하고 workspace, constraints 등 모노레포 기능을 제공한다.
- PnP와 캐시를 저장소에 포함하는 Zero-Installs 구성도 가능하다.

주의:

- 일부 도구가 `node_modules` 구조를 가정하면 PnP 호환 설정이나 SDK가 필요하다.
- 필요하면 `.yarnrc.yml`의 `nodeLinker: node-modules`를 선택할 수 있다.
- Zero-Installs는 Yarn Berry 자체와 같은 말이 아니며, 네이티브 의존성은 여전히 설치 과정이 필요할 수 있다.

## pnpm

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

## 비교 질문에 답하는 법

| 질문 | Yarn Berry | pnpm |
| --- | --- | --- |
| 기본 해석 구조 | PnP 맵, 설정 시 node_modules | store + 링크 기반 node_modules |
| 엄격성 | 선언 의존성을 PnP가 강하게 검사 | 격리된 링크 구조가 유령 의존성을 줄임 |
| 모노레포 | workspaces, constraints, focus | workspace protocol, filter, catalog 등 |
| 선택 시 확인 | 도구의 PnP 호환성 | 심볼릭 링크를 가정하지 못하는 도구 |

“무조건 어느 쪽이 빠르다”보다 현재 저장소의 도구 호환성, 캐시 전략, 배포 환경, 팀 운영 비용을 말하세요.

## 자주 나오는 질문

### Q. 로컬에서는 되는데 CI에서 의존성을 못 찾는 이유는요?

로컬에 남은 `node_modules`, 전역 설치, 선언하지 않은 간접 의존성, 다른 lockfile/런타임 버전이 흔한 원인입니다. 깨끗한 환경에서 immutable 설치를 재현하고 직접 import한 패키지가 직접 의존성으로 선언됐는지 확인합니다.

### Q. lockfile 충돌을 package.json만 보고 해결해도 되나요?

아닙니다. 선택한 패키지 매니저로 다시 해석하고 테스트해야 합니다. 텍스트 충돌 표시만 제거하면 그래프의 무결성이 깨질 수 있습니다.

### Q. peer dependency는 왜 있나요?

플러그인·React 컴포넌트 라이브러리처럼 호스트가 제공해야 할 공통 패키지의 호환 범위를 표현합니다. 라이브러리가 React를 자기 내부에 중복 설치하면 서로 다른 인스턴스 때문에 문제가 날 수 있습니다.

## 라이브 코딩 체크

- `packageManager` 필드와 lockfile로 실제 도구/버전을 확인했는가?
- 코드가 import하는 패키지가 직접 선언됐는가?
- 설치 오류를 무작정 lockfile 삭제로 덮으려 하는가?
- workspace 내부 의존성 방향과 순환을 확인했는가?
- CI와 로컬의 Node 및 패키지 매니저 버전이 같은가?

## 공식 문서

- [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Yarn Cache와 Zero-Installs](https://yarnpkg.com/features/caching)
- [pnpm symlinked node_modules 구조](https://pnpm.io/symlinked-node-modules-structure)
- [pnpm Workspaces](https://pnpm.io/workspaces)

