# 구축 검증 결과

- 검증일: 2026-09-21
- 환경: Windows, Node.js 22.17.0, pnpm 9.15.3

| 확인 항목           | 실행 명령 또는 방법                                                   | 결과                                                              |
| ------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 의존성 설치         | `pnpm install`                                                        | 성공                                                              |
| 환경 진단           | `pnpm run doctor`                                                     | Node, pnpm, node_modules, TypeScript, Vitest, 5173 포트 모두 PASS |
| 개발 서버           | `pnpm dev --host 127.0.0.1`                                           | Vite 기동, `/` HTTP 200                                           |
| 오프라인 목 자산    | `/mockServiceWorker.js` 요청                                          | HTTP 200                                                          |
| 프로덕션 빌드       | `pnpm build`                                                          | 성공                                                              |
| VS Code/JSON 설정   | Node `JSON.parse` 검사                                                | `.vscode` 4개 파일과 workspace 파일 모두 성공                     |
| 날짜별 생성         | `pnpm practice:new --title "validation-one"`, 이어서 `validation-two` | 같은 날짜에 04, 05로 증가함을 확인한 뒤 검증용 폴더 제거          |
| 특정 문제 테스트    | `pnpm vitest practice/2026-09-21/03-campaign-search/tests --run`      | 1 파일, 1 테스트 성공                                             |
| 전체 테스트         | `pnpm test`                                                           | 4 파일, 7 테스트 성공                                             |
| 타입 검사           | `pnpm typecheck`                                                      | 성공                                                              |
| 린트                | `pnpm lint`                                                           | 오류 0, 의도된 연습 코드 경고 2                                   |
| 종합 점검           | `pnpm interview:check`                                                | 성공                                                              |
| 비공개 폴더 숨김    | `.vscode/settings.json`, `interview.code-workspace` 검사              | explorer/search 모두 `.interviewer` 제외                          |
| 정답 실행 경로 분리 | `src`, `practice`의 TypeScript import 검색                            | `.interviewer` import 없음                                        |
| 명령 문서 일치      | `package.json` scripts와 README 비교 스크립트                         | 성공                                                              |

## 남은 제한사항

- 운영체제 네트워크를 실제로 끄는 조작은 하지 않았다. 다만 앱 API는 MSW로만 처리되며 설치 후 실행·테스트·타입 검사 과정에서 외부 API를 호출하지 않는다. 면접 전날 Wi-Fi를 끄고 한 번 더 확인한다.
- pnpm은 `doctor`를 내장 명령으로 예약한다. 따라서 `pnpm doctor`는 pnpm 자체 진단이고, 이 저장소에서 구현한 상세 진단은 `pnpm run doctor`로 실행한다.
- 린트 경고 2개는 예제의 의도된 나쁜 코드에 해당한다. ESLint 프로세스는 성공하며, 지원자가 문제를 수정하면 경고도 사라진다.
