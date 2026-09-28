# 03. 입력·타입·검증: 숫자로 변환되면 유효한가

## 계약과 Before

워크숍 좌석 수는 1~20 정수입니다. 입력은 십진 숫자만 허용하고 앞뒤 공백은 무시합니다. 빈 값, 소수, 지수 표기는 허용하지 않습니다.

```ts
function parseSeats(raw: string) {
  return Number(raw);
}
```

`Number('')`는 0, `Number('1e1')`은 10입니다. 변환 가능한 것과 제품이 허용한 표기는 다릅니다. 입력 요소의 `min`, `max`만으로 함수의 계약을 보장할 수도 없습니다.

## After

```ts
type Result = { ok: true; value: number } | { ok: false; message: string };

function parseSeats(raw: string): Result {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) {
    return { ok: false, message: '좌석 수를 정수로 입력해주세요.' };
  }
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < 1 || value > 20) {
    return { ok: false, message: '1~20석을 입력해주세요.' };
  }
  return { ok: true, value };
}
```

첫 검사는 표기법, 두 번째 검사는 수치 범위입니다. `Result`는 `ok` 값에 따라 사용할 수 있는 필드가 달라집니다. 성공이면 `value`, 실패면 `message`를 사용하도록 타입 검사가 도와줍니다.

```ts
const result = parseSeats('3');
if (result.ok) {
  console.log(result.value * 15000);
} else {
  console.log(result.message);
}
```

정규식은 모든 숫자 입력에 붙이는 만능 해답이 아닙니다. 소수를 허용하는 계약이라면 검증 규칙도 달라져야 합니다. 위 계약에서는 '01'도 1로 인정합니다. 선행 0을 금지하려면 요구사항을 추가해야 합니다.

## TypeScript와 실제 API 응답

```ts
type SeatsResponse = { available: number };
const result = { available: '많음' } as unknown as SeatsResponse;
```

타입 단언은 런타임 데이터 변환이나 검증이 아닙니다. 실제 문자열은 그대로 남습니다. 외부 응답은 `unknown`으로 받고 필요한 필드를 확인합니다.

```ts
function readAvailable(data: unknown): number {
  if (typeof data !== 'object' || data === null || !('available' in data)) {
    throw new Error('잘못된 좌석 응답');
  }
  const value = data.available;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('잘못된 좌석 수');
  }
  return value;
}
```

조건문을 통과한 범위에서 타입이 좁혀지는 것을 narrowing이라고 합니다. 외부 입력과 도메인 로직 사이에서 검사하면 내부 함수들이 매번 같은 검증을 반복하지 않아도 됩니다. [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## 재현·검증표

| 입력                   | 기대      |
| ---------------------- | --------- |
| `'1'`, `'20'`, `' 3 '` | 성공      |
| `''`, `'   '`, `'abc'` | 표기 오류 |
| `'2.5'`, `'1e1'`       | 표기 오류 |
| `'0'`, `'21'`          | 범위 오류 |

## 변형 질문과 해설

**질문:** `<input type="number">`면 검증을 생략해도 되는가?

**해설:** 안 됩니다. UI는 입력을 돕지만 함수 호출이나 서버 요청 경로 전체를 보장하지 않습니다. 서버도 별도로 검증해야 합니다. 프론트 검증은 빠른 피드백, 서버 검증은 최종 데이터 보호를 담당합니다.

**면접 답변:** “문자열 표기와 수치 범위를 분리했습니다. TypeScript 타입은 외부 응답을 검증하지 않으므로 경계에서 실제 값을 확인합니다.”

[목차](../README.md) · [다음 수업](../level-2/04-effects-and-closures.md)
