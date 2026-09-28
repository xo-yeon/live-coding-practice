# 06. 저장·실패·서버 상태: 무엇을 확정된 사실로 보여줄까

## 상황과 Before

워크숍 예약 좌석을 바꿉니다. 저장 성공 전에는 기존 확정 좌석 수를 유지하고, 실패하면 입력 초안은 남겨 사용자가 재시도할 수 있게 합니다.

```tsx
async function save() {
  setConfirmed(draft);
  await saveSeats(draft);
}
```

서버가 거절해도 확정값이 바뀌어 있습니다. 이 계약에서는 저장 결과를 확인한 뒤 확정값을 바꿔야 합니다. 초안을 남길지 초기화할지는 제품 선택이며 실패하면 무조건 입력을 지우는 것이 정답은 아닙니다.

## After: 역할별 상태

`draft`는 검증된 숫자, `saveSeats`는 서버가 확정한 숫자를 반환한다고 가정합니다. 입력은 저장 중 비활성화합니다.

```tsx
const [saving, setSaving] = useState(false);
const [error, setError] = useState('');
const lock = useRef(false);

async function save() {
  if (lock.current) return;
  lock.current = true;
  setSaving(true);
  setError('');
  try {
    const saved = await saveSeats(draft);
    setConfirmed(saved);
    setDraft(saved);
  } catch {
    setError('저장하지 못했습니다. 다시 시도해주세요.');
  } finally {
    lock.current = false;
    setSaving(false);
  }
}
```

`saving`은 버튼과 안내 문구를 갱신합니다. `lock`은 같은 핸들러가 렌더 전에 다시 호출돼도 즉시 중복 진입을 막습니다. 사용자 클릭만 고려한 단순 UI에서는 disabled만으로 충분한 경우도 있습니다. 두 값이 필요한 이유는 보호하려는 호출 경로가 다르기 때문입니다.

이 잠금은 브라우저 한 컴포넌트 안의 중복 진입만 막습니다. 다른 탭·네트워크 재전송·여러 기기의 중복 처리는 서버의 멱등성 키나 버전 검사 등 별도 계약이 필요합니다. 멱등성은 같은 작업을 반복해도 추가 효과가 생기지 않게 하는 성질입니다.

## 낙관적 업데이트의 비용

서버 응답 전에 화면을 바꾸는 낙관적 업데이트는 사용자 반응성을 높일 수 있습니다. 대신 이전 값 보관, 실패 시 복구, 동시 수정 충돌 처리가 필요합니다. 첫 요청 실패 후 전체 목록을 과거 스냅샷으로 되돌리면 두 번째 요청의 성공까지 지울 수 있습니다. 작은 저장 폼에서는 응답 후 반영이 더 단순한 선택일 수 있습니다.

## 조회 캐시는 무엇으로 구분하는가

캐시는 이전 조회 결과를 재사용하기 위한 저장소입니다. 결과를 바꾸는 입력이 다르면 캐시도 구분해야 합니다. TanStack Query v5를 사용하는 컴포넌트의 발췌입니다.

```tsx
// Before: 행사와 페이지가 바뀌어도 같은 캐시 주소
useQuery({ queryKey: ['attendees'], queryFn: () => fetchAttendees(eventId, page) });

// After
useQuery({
  queryKey: ['attendees', eventId, page],
  queryFn: () => fetchAttendees(eventId, page),
});
```

query key는 데이터의 주소와 같습니다. API 결과에 영향을 주는 조건을 포함합니다. 저장 후에는 관련 목록·상세 캐시를 갱신하거나 무효화하여 재조회해야 합니다. 모든 캐시를 지우는 방식은 불필요한 요청을 늘릴 수 있습니다. [공식 query key 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)

## 검증과 변형

요청을 완료하지 않은 동안 확정값 유지와 입력·버튼 잠금을 검사합니다. 실패 후 초안 유지, 잠금 해제, 재시도 성공을 확인합니다. 저장 API 호출 횟수도 중복 요청 금지라는 외부 계약을 확인할 때는 의미 있는 검증입니다.

**질문:** 실패 후 무조건 원래 입력값으로 되돌려야 하는가?

**해설:** 아닙니다. 확정 데이터와 초안을 구분해야 합니다. 이 수업에서는 확정 데이터만 유지하고 초안은 남깁니다. 취소 버튼이라면 초안까지 원복하는 정책을 선택할 수 있습니다.

**면접 답변:** “확정 좌석 수는 서버 성공 후 변경하고 초안은 실패 시 유지했습니다. UI 잠금과 서버 중복 처리의 보장 범위도 구분했습니다.”

[목차](../README.md) · [다음 수업](../level-3/07-refactoring-and-performance.md)
