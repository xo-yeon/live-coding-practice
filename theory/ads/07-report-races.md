# 07. 보고 기간을 빠르게 바꾸면 오래된 성과가 표시된다

## 요구사항과 Before

보고 기간 A 요청은 800ms, B 요청은 100ms 걸립니다. 현재 선택 기간의 데이터만 표시하며 갱신 실패 시 마지막 성공 결과를 보여주더라도 기준 기간과 실패 사실을 명시해야 합니다.

```tsx
useEffect(() => {
  api.report(period).then(setReport);
}, [period]);
```

## 재현과 우선순위

A 직후 B를 선택하고 B→A 순서로 완료시킵니다. 제목은 B인데 숫자는 A가 되면 보고 해석이 틀어집니다. 색상이나 로딩 애니메이션보다 결과의 소속부터 고칩니다.

## After: 요청 key와 데이터 key를 연결

아래는 queryKey 문자열이 계정·기간·필터를 정규화해 식별하며 `api.report`가 이를 인자로 받는다고 가정한 Hook 발췌입니다.

```tsx
useEffect(() => {
  let active = true;
  setView({ key: queryKey, status: 'loading' });
  api.report(queryKey).then(
    (data) => {
      if (active) setView({ key: queryKey, status: 'success', data });
    },
    () => {
      if (active) setView({ key: queryKey, status: 'error' });
    },
  );
  return () => {
    active = false;
  };
}, [queryKey]);
const visible = view.key === queryKey ? view : { key: queryKey, status: 'loading' };
```

이 작은 수정에서는 기간 변경 시 이전 결과를 숨깁니다. Effect 실행 전 렌더에서도 key가 다른 데이터를 표시하지 않습니다. 공용 boolean ref를 새 요청마다 true로 바꾸면 이전 요청도 다시 자격을 얻을 수 있어, 각 Effect의 지역 변수를 씁니다.

같은 기간 재조회 중 기존 결과를 유지하려면 마지막 성공 데이터와 갱신 상태를 분리합니다. “집계 기준 시각”, “갱신 실패, 이전 결과 표시”를 함께 보여줍니다. 재조회 실패를 0 실적으로 바꾸거나 빈 결과라고 표시하지 않습니다.

## 검증

B 성공 뒤 A 성공, B 성공 뒤 A 실패, 최신 요청 실패, 실패 후 재시도를 검사합니다. 실제 시간을 기다리기보다 수동 완료 가능한 Promise로 순서를 제어합니다. 요청 무시와 취소는 구분하며 취소가 서버 작업까지 되돌린다고 가정하지 않습니다.

## 면접에서 말하기

> “기간 제목과 데이터가 같은 요청에 속한다는 불변식을 먼저 지키겠습니다. 이전 요청의 성공과 실패 모두 화면 변경 권한을 제거하고 역순 응답으로 재현하겠습니다.”

**꼬리질문:** debounce를 넣으면 해결되는가?

**해설:** 요청 수를 줄일 수 있지만 이미 시작된 요청의 순서 문제는 해결하지 않습니다. 응답 적용 대상 식별이 필요합니다.

[목차](README.md)
