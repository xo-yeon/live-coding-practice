# 10. A 광고의 입력 초안이 B 광고에 저장된다

## 요구사항과 Before

광고 상세 편집기를 다른 항목으로 바꾸면 새 항목의 초기값을 보여줍니다. 미저장 변경이 있으면 이동 전에 유지·폐기 여부를 묻는 제품 정책입니다. 재조회 응답은 편집 중 초안을 자동으로 덮지 않습니다.

```tsx
function Editor({ campaign }: Props) {
  const [raw, setRaw] = useState(String(campaign.dailyBudget));
  async function save() {
    await api.saveBudget(campaign.id, Number(raw));
  }
  // 입력 UI 생략
}
```

## 재현과 우선순위

A에서 20만원을 입력한 뒤 같은 Editor 인스턴스에 B props를 전달합니다. useState 초기화는 다시 실행되어 적용되지 않으므로 A 초안과 B ID가 조합될 수 있습니다. 다른 광고에 쓰기가 발생하는 경로이므로 우선 차단합니다.

## After: 편집 세션 경계

```tsx
// 부모에서 미저장 변경 확인을 통과한 뒤 selected를 교체
<Editor key={`${accountId}:${selected.id}`} campaign={selected} />
```

계정과 ID를 key로 세션을 구분합니다. key 변경은 하위 상태를 초기화하므로 미저장 확인은 부모에서 먼저 해야 합니다. 모든 props 변경마다 Effect로 초안을 덮으면 주기적 재조회가 사용자의 타이핑을 지울 수 있습니다.

```ts
// 저장 핸들러에서 값의 소속을 함께 고정하는 발췌
const command = { accountId, campaignId: campaign.id, raw, version: campaign.version };
```

이후 저장 완료 처리는 command가 속한 항목을 갱신합니다. 이미 떠난 편집기에 응답을 표시하지 않습니다. 사용자가 계속 타이핑할 수 있는 정책이라면 제출 초안과 현재 초안의 변경 여부도 비교해야 합니다.

## 검증

A 편집→B 선택 시 폐기 취소와 승인 두 경로를 검사합니다. A 저장 대기 중 B 이동이 허용된다면 늦은 응답이 B에 반영되지 않는지 확인합니다. 같은 A의 서버 재조회에서 초안을 보존하는지 별도로 검사합니다.

## 면접에서 말하기

> “초안의 소유자는 광고 ID입니다. 선택 변경으로 props만 교체되어 다른 광고의 ID와 기존 초안이 섞입니다. 편집 세션을 계정·ID로 구분하고 저장 명령의 대상도 제출 시점에 고정하겠습니다.”

**꼬리질문:** key에 version도 넣으면 안전한가?

**해설:** 재조회로 version이 변할 때마다 초안을 버릴 수 있습니다. 새 항목 선택과 같은 항목의 서버 갱신은 다른 사건이므로 동일한 초기화 정책을 쓰지 않습니다.

[목차](README.md)
