# 03. 두 운영자가 수정한 예산이 서로 덮인다

## 요구사항과 Before

가상 캠페인의 일 예산은 10,000~10,000,000원 정수입니다. 응답에는 `version`이 있으며 서버는 오래된 version의 수정을 409로 거절합니다. 실패 시 초안을 유지하고 확정값은 바꾸지 않습니다.

```ts
setCampaign({ ...campaign, dailyBudget: Number(raw) });
await api.updateBudget(campaign.id, { dailyBudget: Number(raw) });
```

## 재현과 우선순위

나와 동료가 version 7을 엽니다. 동료가 20만원으로 바꿔 version 8이 됩니다. 내가 오래된 화면에서 15만원을 저장하면 동료 변경을 덮을 수 있습니다. 이 문제의 영향은 광고 집행 조건의 잘못된 변경이며, 가독성 리팩터링보다 우선입니다. 실제 추가 과금 발생 여부까지 확인 없이 단정하지 않습니다.

## After: 제출한 값을 고정하고 충돌 구분

아래는 저장 핸들러의 발췌입니다. `parseBudget`은 위 금액 계약을 검사하고 `api.updateBudget`은 비정상 HTTP 상태를 분류하여 throw한다고 가정합니다.

```ts
const command = {
  accountId,
  campaignId: campaign.id,
  dailyBudget: parseBudget(raw),
  expectedVersion: campaign.version,
};
try {
  const saved = await api.updateBudget(command);
  setCampaign(saved);
  setRaw(String(saved.dailyBudget));
} catch (error) {
  if (isConflict(error)) {
    setError('다른 변경이 있습니다. 최신 예산을 확인한 후 다시 저장해주세요.');
  } else {
    setError('저장에 실패했습니다. 입력값은 유지됩니다.');
  }
}
```

계정·ID·금액·version을 제출 시점 값으로 묶습니다. 수정 성공에 사용한 command의 계정/ID에 해당하는 캐시만 갱신합니다. 저장 중 계정·항목 변경을 막거나 편집기를 분리하는 정책도 필요합니다.

409에서 최신 version으로 바꿔 자동 재시도하면 충돌 보호를 무력화할 수 있습니다. 최신 상태를 보여주고 사용자가 자신의 의도를 다시 확인하게 합니다. version은 프론트에서 비교만 하는 값이 아니라 서버가 저장과 함께 원자적으로 검사해야 합니다.

## 검증

정상 저장, 범위 오류, 저장 거절, 409 각각을 검사합니다. version 8 상태에 version 7 명령은 거절되어야 합니다. 409 후 초안은 유지되고 자동 재요청되지 않아야 합니다. 저장 중 중복 진입은 앞선 공통 이론의 잠금 방식을 사용합니다.

## 면접에서 말하기

> “예산 변경은 서버 확정 전 반영하지 않겠습니다. 여러 운영자의 편집을 고려해 읽은 version을 함께 보내고, 충돌은 일반 통신 실패와 구분하겠습니다. 서버의 원자적 검사 없이 프론트만으로 덮어쓰기를 막을 수는 없습니다.”

**꼬리질문:** 요청이 타임아웃이면 저장 실패인가?

**해설:** 결과를 모르는 상태일 수 있습니다. 서버에서 이미 저장됐을 수도 있으므로 재조회하거나 작업 식별자로 확인합니다. 재전송 정책은 멱등성 계약과 함께 정합니다.

[목차](README.md)
