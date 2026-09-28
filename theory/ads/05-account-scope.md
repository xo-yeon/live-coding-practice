# 05. 광고 계정을 바꿨는데 이전 계정 데이터가 보인다

## 요구사항과 Before

대행사 운영자가 가상 광고 계정 A·B를 전환합니다. 목록·상세·선택 ID·변경 요청 모두 현재 계정에 속해야 합니다. 전환 중 이전 계정 정보를 임시로 표시하지 않는 정책입니다.

```tsx
useQuery({
  queryKey: ['campaigns'],
  queryFn: () => api.listCampaigns(accountId),
});
```

## 재현과 우선순위

A의 조회가 끝난 뒤 B로 전환합니다. 같은 key 때문에 A 캐시를 B 화면에 표시하거나 같은 ID의 상세가 섞일 수 있습니다. 단순 시각 오류를 넘어 잘못된 계정 판단·변경으로 이어질 수 있으므로 먼저 격리합니다. 브라우저에 표시된 것만으로 실제 서버의 계정 간 권한 유출까지 단정하지 않습니다.

## After

```tsx
useQuery({
  queryKey: ['campaigns', accountId, normalizedFilters],
  queryFn: () => api.listCampaigns(accountId, normalizedFilters),
  enabled: Boolean(accountId),
});
// 계정 전환 시 초안·선택 ID·지역 UI 상태를 새 세션으로 시작
<CampaignWorkspace key={accountId} accountId={accountId} />;
```

결과에 영향을 주는 계정과 조건을 key에 넣습니다. key는 캐시 구분이고 접근 권한 검사가 아닙니다. 이전 데이터를 placeholder로 유지하는 옵션이 있다면 계정 전환에서도 노출되는지 별도로 확인합니다. 위 예제에서는 그 옵션을 사용하지 않습니다. [TanStack Query key 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)

저장 성공 후에는 클릭 때 묶은 `variables.accountId`, `variables.campaignId`의 캐시를 갱신합니다. 완료 시점의 현재 계정에 응답을 쓰면 안 됩니다. 로그아웃·권한 철회 시 캐시 보관 정책도 별도 결정합니다.

## 검증

A와 B에서 같은 캠페인 ID에 다른 이름을 반환하게 합니다. 계정 전환 뒤 잘못된 이름이 잠깐이라도 보이지 않는지 확인합니다. A의 느린 저장 응답이 B의 캐시를 변경하지 않는지 검사합니다. 서버 통합 테스트에서는 다른 계정 ID를 보낸 요청이 실제로 거절되는지도 확인해야 합니다.

## 면접에서 말하기

> “계정은 캐시와 편집 세션의 경계입니다. key에 계정을 포함하고 전환 시 지역 선택 상태를 초기화하겠습니다. 서버 권한은 별도이며 저장 응답은 제출 당시 계정의 데이터에만 반영하겠습니다.”

**꼬리질문:** 계정을 바꿀 때 모든 캐시를 지우면 되는가?

**해설:** 눈앞의 증상을 줄일 수 있지만 정상적인 캐시 재사용도 없애며 늦은 응답 처리 문제는 남습니다. 우선 데이터 식별과 응답 적용 대상을 정확하게 만들고, 로그아웃 같은 별도 상황의 삭제 정책을 적용합니다.

[목차](README.md)
