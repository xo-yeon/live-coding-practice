# Frontend Live Coding Practice

실행은 되지만 품질과 안정성에 문제가 있는 React/TypeScript 코드를 읽고, 사용자 영향을 설명하며, 제한 시간 안에 직접 고치는 연습 저장소입니다. 새 서비스를 만드는 과제보다 기존 코드 이해, 우선순위 판단, 최소 변경, 검증, 말하기에 초점을 둡니다.

## 빠른 시작

Node.js 20 이상과 pnpm이 필요합니다. 이 저장소는 pnpm 9.15.3으로 구성했습니다.

```bash
pnpm install
pnpm run doctor
pnpm dev
```

인터넷을 끈 뒤에도 설치된 `node_modules`만으로 `pnpm dev`, `pnpm test`, `pnpm typecheck`가 되는지 면접 전에 확인하세요. 앱 API는 MSW 목을 사용하므로 실행 중 네트워크 연결이 필요하지 않습니다.

## 두 가지 모드

### Practice Mode

AI가 나쁜 코드와 문제 상황을 만들고 면접관 역할을 합니다. 면접을 시작한 뒤에는 지원자가 요청하지 않은 코드를 수정하거나 답을 먼저 밝히지 않습니다. 원본은 `before`, 지원자가 고칠 코드는 `working`, 공개 테스트는 `tests`에 있습니다. 비공개 문제·채점·개선안은 `.interviewer`에 있으며 **“정답 공개”** 전에는 열거나 AI에게 인용을 요청하지 마세요.

### Interview Mode

AI 없이 VS Code 기본 TypeScript IntelliSense, 파라미터 힌트, 자동 import, ESLint, Prettier, Vitest, 통합 터미널만 사용합니다. 실제 면접 전에는 반드시 회사가 허용하는 도구와 검색 범위를 확인하고, AI가 금지되면 Copilot·Codex 등 모든 AI 확장을 비활성화하세요. 자세한 설정은 [면접 환경 가이드](docs/interview-environment.md)를 따릅니다.

## 연습 흐름

1. `pnpm run doctor`
2. AI에게 “오늘 라이브 코딩 문제 만들어줘”라고 요청
3. 생성된 `working` 폴더를 VS Code에서 열기
4. “오늘 문제로 면접 시작해줘”라고 요청
5. 코드를 읽으며 문제와 우선순위를 말하기
6. 지원자가 직접 코드 수정
7. 필요할 때만 “힌트 1” 요청
8. “면접 종료하고 채점해줘” 요청
9. `review.md` 확인
10. “정답 공개” 후 개선 코드와 비교

새 폴더만 만들려면 다음 명령을 사용합니다.

```bash
pnpm practice:new --title "campaign-filter"
```

현재 로컬 날짜와 다음 순번을 계산해 `practice/YYYY-MM-DD/NN-title`을 만들고 `before`를 `working`으로 복사합니다. `after`는 면접 종료 뒤 사용자가 원할 때만 만듭니다.

## 주요 명령

```bash
pnpm run doctor                   # Node, pnpm, 의존성, 도구, 5173 포트 확인
pnpm interview:check              # 타입 검사 + 전체 테스트 + 린트 + 필수 파일 확인
pnpm dev                          # Vite 개발 서버
pnpm test                         # 전체 테스트 1회
pnpm test:watch                   # 전체 테스트 watch
pnpm vitest practice/2026-09-21/01-ad-metrics/tests  # 특정 문제 watch
pnpm typecheck                    # TypeScript 검사
pnpm lint                         # ESLint 검사
pnpm practice:new --title "문제명" # 날짜별 문제 생성
```

## 구조

```text
practice/YYYY-MM-DD/NN-title/
├─ problem.md      # 공개 상황·요구사항·제한 시간
├─ before/         # AI가 제공한 원본
├─ working/        # 지원자가 직접 수정
├─ tests/          # 공개 테스트
├─ notes.md        # 분석·우선순위·검증 기록
└─ review.md       # 종료 후 평가와 회고

.interviewer/YYYY-MM-DD/NN-title/ # 정답 공개 전 비공개
```

최초 예제는 잘못된 광고 지표, React 캠페인 필터, 비동기 캠페인 검색 세 가지입니다. `.interviewer`는 VS Code 탐색기와 검색에서 기본적으로 숨겨지며 Git에는 포함됩니다.

## 실제 면접 전

`interview.code-workspace`를 VS Code로 열고 별도 `Live Coding` 프로필을 선택하세요. 설정 동기화를 끄고 AI 확장을 모두 비활성화한 뒤 `pnpm interview:check`를 실행합니다. 회사가 별도 저장소나 브라우저 IDE를 주면 이 저장소 설정을 억지로 이식하지 말고, 제공 환경에서 실행·테스트·제출 방식부터 확인하세요. [당일 체크리스트](docs/interview-day-checklist.md)도 함께 사용하세요.

구축 시 실제 실행한 검증과 알려진 제한은 [검증 결과](docs/verification-results.md)에 기록되어 있습니다.

> pnpm에는 같은 이름의 내장 `doctor` 명령이 있어 `pnpm doctor`는 pnpm 자체 진단을 실행합니다. 이 저장소의 면접 환경 진단은 명시적으로 `pnpm run doctor`를 사용합니다.
