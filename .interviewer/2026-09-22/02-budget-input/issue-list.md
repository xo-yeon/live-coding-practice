# 비공개 문제 목록

정답 공개 전 노출하지 않습니다.

1. setAmount 직후 이전 렌더의 amount로 remaining을 계산하여 표시가 한 입력 늦는다. remaining은 파생 값이라 중복 state 소유권도 원인이다.
2. remaining || budget이 정상 값 0을 기본값으로 바꾼다.
