# 04. 심사 중인 광고가 운영중으로 바뀐다

## 학습용 요구사항과 Before

심사 상태는 PENDING·APPROVED·REJECTED이고 운영 상태는 PAUSED·ACTIVE·ENDED입니다. 편집 권한이 있고 심사가 승인되었으며 종료되지 않은 광고만 시작할 수 있습니다. 이는 가상 정책입니다.

```ts
const nextStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
await api.setStatus(campaign.id, nextStatus);
```

## 재현과 우선순위

심사 PENDING, 운영 PAUSED를 넣고 토글합니다. UI가 시작 요청을 보내면 정책과 다른 동작입니다. 서버가 거절해도 불필요한 요청과 잘못된 기대를 만듭니다. 서버까지 허용한다면 실제 집행 위험이 있으므로 변경 경로의 안전성을 먼저 확인합니다.

## After

```ts
function canActivate(campaign: Campaign, canEdit: boolean) {
  if (!canEdit) return { allowed: false, reason: '편집 권한 없음' };
  if (campaign.status === 'ENDED') return { allowed: false, reason: '종료된 광고' };
  if (campaign.status === 'ACTIVE') return { allowed: false, reason: '이미 운영중' };
  if (campaign.review !== 'APPROVED') return { allowed: false, reason: '심사 승인 필요' };
  return { allowed: true, reason: '' };
}
```

버튼 disabled와 안내문에 같은 결정 결과를 사용합니다. 시작·중지·종료는 다른 명령입니다. 가능한 상태가 늘어날 때 무조건 반대로 뒤집는 boolean 토글을 피합니다. 서버에서 갱신된 정식 상태를 받아 표시합니다.

이 함수는 UI 정책이며 보안 경계가 아닙니다. 서버도 권한·심사·현재 상태를 검사합니다. 응답 대기 중 다른 운영자가 상태를 바꿀 수 있으므로 서버 거절을 정상적인 복구 경로로 다룹니다.

## 검증

권한 없음, 미승인, 종료, 이미 운영중은 시작 불가입니다. 승인+PAUSED+권한 있음만 허용합니다. 버튼과 이유 문구가 일치하는지, 서버 거절 후 표시가 원상태인지 확인합니다.

## 면접에서 말하기

> “운영 상태와 심사 상태는 별도 축입니다. 단순 토글 대신 시작 가능한 조건을 함수로 모아 버튼과 설명을 일치시키겠습니다. 최종 전환 가능 여부는 서버가 검사하도록 처리하겠습니다.”

**꼬리질문:** 프론트에서 막았으니 권한 검사를 생략할 수 있는가?

**해설:** 없습니다. UI는 우회할 수 있고 서버 상태도 바뀝니다. 프론트 검사는 안내와 조작 편의, 서버 검사는 실제 변경의 허용 여부를 맡습니다.

[목차](README.md)
