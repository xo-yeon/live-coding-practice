# 08. 일괄 중지 중 일부만 실패했는데 전체 성공으로 표시한다

## 요구사항과 Before

같은 계정의 광고 A·B·C를 중지합니다. 각각 독립적인 서버 작업입니다. A·C는 중지되고 B는 명시적으로 거절될 수 있습니다. 성공한 대상은 재시도하지 않습니다.

```ts
await Promise.all(selectedIds.map((id) => api.pause(id)));
setSelectedIds([]);
showToast('모두 중지했습니다.');
```

## 재현과 우선순위

B만 거절시키면 Promise.all이 reject하지만 A·C 작업은 자동으로 취소되지 않습니다. catch에서 “모두 실패”라고 표시하고 전체 재시도해도 사실과 다릅니다. 중지를 요청한 광고가 계속 운영될 수 있어 결과를 정확히 알리는 일을 우선합니다.

## After

```ts
const ids = [...selectedIds]; // 클릭 시 작업 대상을 고정
const results = await Promise.allSettled(ids.map((id) => api.pause(id)));
const outcomes = results.map((result, index) => ({
  id: ids[index],
  state:
    result.status === 'fulfilled'
      ? 'success'
      : isExplicitRejection(result.reason)
        ? 'rejected'
        : 'unknown',
}));
```

API가 HTTP 비정상 응답을 throw하고 성공 응답을 확인한다는 계약입니다. fetch는 HTTP 500만으로 Promise를 reject하지 않으므로 API 계층이 상태를 검사해야 합니다. `allSettled`는 결과를 모을 뿐 동시 요청 수를 제한하지 않습니다.

결과 UI에는 성공 2건, 거절 1건처럼 사실을 표시합니다. 네트워크 끊김은 서버에서 성공했는지 모를 수 있으므로 결과 불명으로 두고 재조회합니다. 실패 항목 재시도도 작업이 멱등적인지 확인해야 합니다. “중지 상태로 설정”과 “현재 상태 반전”은 재시도의 효과가 다릅니다.

## 검증

일부 성공·전부 성공·명시적 거절·결과 불명을 나눕니다. 작업 시작 후 선택이 바뀌어도 ID와 결과 매칭이 유지돼야 합니다. 성공한 항목은 실패 재시도에 포함하지 않습니다. 수천 개 대상은 서버 bulk API 또는 동시 실행 제한을 고려합니다.

## 면접에서 말하기

> “일괄 작업은 부분 성공이 가능합니다. 제출 대상 ID를 고정하고 개별 결과를 수집하겠습니다. 타임아웃은 확정 실패와 구분해 재조회하고, 성공한 대상까지 무조건 재시도하지 않겠습니다.”

**꼬리질문:** allSettled로 바꾸면 일괄 작업이 원자적이 되는가?

**해설:** 아닙니다. 전체 성공 또는 전체 취소가 필요하면 서버 트랜잭션이나 별도 작업 계약이 필요합니다. 프론트 Promise 조합으로 되돌림을 보장할 수 없습니다.

[목차](README.md)
