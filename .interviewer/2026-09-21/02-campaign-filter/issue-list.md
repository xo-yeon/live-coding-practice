# 비공개 문제 목록

정답 공개 전에는 공개·요약·인용하지 않는다.

1. `filteredCampaigns`는 기존 상태에서 계산 가능한 파생 상태인데 Effect로 동기화해 중간 불일치와 불필요한 렌더가 생긴다.
2. `sort`로 React state 배열을 직접 변경한다.
3. 배열 index를 key로 사용해 정렬 시 항목 identity가 깨질 수 있다.
4. 합계가 필터 결과가 아니라 전체 campaigns를 사용해 제품 요구와 다르다.
5. props 변경 시 `campaigns` state가 새 initialCampaigns와 동기화되지 않는 소유권 문제가 있다. 로컬 편집이 필요 없다면 state 자체가 불필요하다.
