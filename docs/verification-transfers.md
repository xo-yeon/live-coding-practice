# 송금 예약 관리 과제 검증

2026-09-21, 이동된 저장소 C:/source/live-coding-practice에서 확인했습니다.

- 폴더 이동 후 깨진 의존성 연결은 pnpm install --frozen-lockfile --force로 복구했습니다.
- pnpm test: 01~03 제거 후 2개 파일, 5개 테스트 통과.
- pnpm build: TypeScript 검사와 Vite 빌드 통과.
- pnpm typecheck: 01~03 제거 후 통과.
- pnpm lint: 01~03 제거 후 오류 0, 연습 코드 경고 1. 현재 과제의 의도된 동작은 그대로 유지했습니다.
- 신규 working 파일 10개와 before 파일 10개의 SHA256 일치를 확인했습니다.
- 정답 코드는 .interviewer에만 두고 화면은 working/TransferPage.tsx를 사용합니다.

공개 테스트는 정상 목록 조회, 상세 열기/닫기, 유효한 신규 예약 등록을 검증합니다.
숨은 결함까지 통과한다는 뜻은 아닙니다. 후보자가 요구사항을 검토하고 회귀 테스트를 추가하는 것이 과제입니다.
