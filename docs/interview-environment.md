# 실제 면접 개발 환경

## 회사 정책을 먼저 확인

면접 전에 AI 채팅·AI 자동완성, 공식 문서와 검색, 외부 라이브러리, 테스트 수정이 허용되는지 회사에 확인합니다. AI 사용이 금지되면 Codex, GitHub Copilot 등 AI 확장 프로그램을 비활성화하고 기본 IntelliSense만 사용합니다. 이 저장소는 AI 확장을 설치하거나 권장하지 않습니다.

## VS Code `Live Coding` 프로필 만들기

1. 명령 팔레트에서 `Profiles: Create Profile`을 선택합니다.
2. `Empty Profile`로 시작하고 이름을 `Live Coding`으로 정합니다.
3. `interview.code-workspace`를 엽니다.
4. ESLint, Prettier, Vitest Explorer만 설치합니다. TypeScript/JavaScript Language Features는 VS Code 기본 내장 기능을 켭니다.
5. 모든 AI 확장에서 톱니바퀴 → `Disable (Profile)`을 선택합니다. 확장 목록에서 `@enabled`로 검색해 남은 AI 도구가 없는지 확인합니다.

## 설정 동기화 끄기

계정 메뉴 → `Settings Sync is On` → `Turn Off`를 선택하고 확장 및 설정 동기화를 끕니다. 면접 프로필에 개인 확장, 스니펫, 키 설정이 다시 들어오지 않는지 VS Code를 재시작해 확인합니다.

## 기본 IntelliSense 확인

`.ts` 파일에서 `campaign.` 입력 시 프로퍼티 제안, 함수 호출 시 파라미터 힌트, 타입 위에 마우스를 둘 때 타입 정보, 미사용 심볼과 타입 오류 표시, 다른 파일 심볼의 자동 import 제안이 동작하는지 확인합니다. `.vscode/settings.json`은 저장 시 Prettier 포맷만 하며 ESLint 자동 수정과 import 재정렬은 하지 않습니다.

## 면접 전 환경 점검

```bash
pnpm install
pnpm run doctor
pnpm interview:check
pnpm dev
pnpm test:watch
```

터미널 두 개를 열어 하나는 개발 서버, 하나는 테스트 watch에 둡니다. 브라우저에서 `http://localhost:5173`을 열고 캠페인 목 데이터가 보이는지 확인합니다.

오프라인 검사는 의존성을 설치한 상태에서 Wi-Fi를 끄고 `pnpm dev`, `pnpm test`, `pnpm typecheck`를 다시 실행합니다. MSW가 API를 처리하므로 앱 실행에 외부 API가 필요하지 않습니다. 패키지 재설치는 오프라인에서 보장되지 않으므로 `node_modules`와 pnpm store를 면접 직전 지우지 않습니다.

## 별도 저장소나 브라우저 IDE가 제공될 때

회사 제공 환경을 우선합니다. 먼저 README, 런타임 버전, 설치/실행/테스트/제출 명령, 수정 허용 범위를 확인합니다. 브라우저 IDE에서는 로컬 프로필을 적용할 수 없으므로 내장 자동완성과 터미널, 키 바인딩부터 점검합니다. 제공 환경에 임의로 설정 파일이나 의존성을 추가하기 전 면접관에게 허용 여부를 묻습니다.

## 시작 직전 말로 확인할 항목

AI 사용, 공식 문서 검색, 자동완성 범위, 외부 라이브러리, 테스트 수정, 기존 기능 유지, 제한 시간, 실행·제출 방법을 확인합니다. 정책이 불명확하면 추측하지 말고 짧게 질문합니다.
