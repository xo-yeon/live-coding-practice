# 01. 값·참조·불변성: 정렬이 왜 다른 화면을 바꿀까

## 상황과 Before

상품 목록을 가격순으로 표시하되 부모가 가진 원래 순서는 유지해야 합니다. 아래 함수는 TypeScript 문법상 정상입니다.

```ts
type Product = { id: string; price: number };

function sortedProducts(products: Product[]) {
  return products.sort((a, b) => a.price - b.price);
}
```

## 재현과 원인

```ts
const original = [
  { id: 'A', price: 200 },
  { id: 'B', price: 100 },
];
const sorted = sortedProducts(original);
console.log(original[0].id); // B: 원본 순서까지 바뀜
console.log(sorted === original); // true: 같은 배열
```

배열을 함수 인자로 전달하면 배열 전체가 복사되는 것이 아닙니다. 같은 배열 객체를 가리키는 값을 전달합니다. `sort`는 그 배열 자체의 순서를 변경합니다. 다른 화면이 같은 배열을 사용하면 그 화면의 입력도 영향을 받습니다.

## After와 근거

```ts
function sortedProducts(products: readonly Product[]): Product[] {
  return [...products].sort((a, b) => a.price - b.price);
}
```

새 배열을 만든 다음 그 복사본을 정렬합니다. `readonly`는 이 함수가 입력 배열을 변경하지 않도록 타입 검사로 돕습니다. 런타임 객체를 얼리거나 내부 객체까지 복제하는 기능은 아닙니다.

이번 계약은 순서만 바꾸므로 얕은 복사로 충분합니다. 그러나 아래 코드는 여전히 원본 상품을 변경합니다.

```ts
const copied = [...original];
copied[0].price = 999; // 상품 객체는 원본과 공유됨
```

특정 상품의 가격을 바꾸려면 그 상품 객체도 새로 만듭니다.

```ts
const updated = original.map((item) => (item.id === 'A' ? { ...item, price: 999 } : item));
```

변경하지 않은 상품까지 깊은 복사할 필요는 없습니다. 변경 경로에 있는 배열과 객체만 새로 만들면 됩니다.

## React 목록의 정체성

정렬 가능한 목록에서 `key={index}`를 쓰면 “같은 위치”가 “같은 상품”인 것처럼 취급될 수 있습니다. 행 안에 입력 상태가 있으면 정렬 후 다른 상품에 입력값이 붙는 문제가 생길 수 있습니다.

```tsx
// items와 Row가 존재하는 부모 컴포넌트의 발췌
items.map((item) => <Row key={item.id} item={item} />);
```

ID는 해당 목록에서 유일하고 렌더 사이에 안정적이어야 합니다. 매번 난수를 만드는 key는 매번 다른 항목이 되어 상태를 초기화할 수 있습니다. 반대로 항목 ID를 key로 써도 잘못된 데이터 갱신 로직까지 고쳐지지는 않습니다.

## 검증

정렬 결과 `[B, A]`와 원본 `[A, B]`를 둘 다 검사합니다. 화면에서는 A행에 값을 입력한 뒤 정렬하고, 그 값이 여전히 A행에 있는지 확인합니다. 정렬 결과만 맞는 테스트는 원본 변경을 놓칩니다.

## 변형 질문과 해설

**질문:** 지역 변수로 방금 만든 배열에 `push`하면 무조건 나쁜가?

**해설:** 아닙니다. 외부에서 공유하지 않는 새 배열을 조립하는 것은 괜찮습니다. React state나 props처럼 다른 코드가 의존하는 값을 직접 변경하는지 확인해야 합니다.

**면접 답변:** “결과는 맞지만 원본 배열도 변경됩니다. 호출부가 원래 순서를 유지해야 하므로 배열만 복사해 정렬하고, 원본 보존까지 검증하겠습니다.”

[목차](../README.md) · [다음 수업](02-state-and-render.md)
