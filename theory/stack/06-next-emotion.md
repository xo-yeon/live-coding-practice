# 06. Next.js와 Emotion 빠른 확인

이 문서는 우선순위가 낮다는 뜻이 아니라, 기존 React 수업과 겹치는 부분을 줄인 보충 과정입니다.

## Next.js 30초 답변

> Next.js는 React 애플리케이션에 라우팅, 서버 렌더링, 데이터 접근과 배포 구조를 제공하는 프레임워크입니다. 코드를 서버와 브라우저 중 어디서 실행할지, 데이터와 secret을 어디까지 보낼지, 서버 HTML과 첫 클라이언트 렌더가 일치하는지를 먼저 봅니다.

확인할 것:

- Server Component와 Client Component의 경계 및 직렬화 가능한 props
- 브라우저 API나 상호작용 hook이 필요한 컴포넌트의 위치
- 서버 렌더와 첫 클라이언트 렌더가 달라 생기는 hydration mismatch
- 요청별 데이터와 사용자 간 공유 가능한 cache의 구분
- route loading/error/not-found UI와 실패 복구
- TanStack Query를 쓴다면 prefetch/dehydrate/hydrate와 중복 조회 정책

면접 질문: “모든 컴포넌트에 `'use client'`를 붙이면 왜 아쉬운가요?”

답변 골격: 브라우저 번들·hydration 범위가 커지고 서버에서만 처리할 수 있는 데이터 경계의 이점을 잃습니다. 실제 상호작용이 필요한 가장 작은 경계에 두되, 팀 구조와 라이브러리 제약도 고려합니다.

## Emotion 30초 답변

> Emotion은 JavaScript/TypeScript에서 동적 스타일과 theme을 컴포넌트와 함께 구성하는 CSS-in-JS 도구입니다. 편의성뿐 아니라 생성되는 스타일의 안정성, DOM으로 전달되는 props, SSR 시 스타일 주입 순서와 성능을 확인합니다.

```tsx
const Budget = styled.span<{ exceeded: boolean }>(({ theme, exceeded }) => ({
  color: exceeded ? theme.colors.danger : theme.colors.text,
  fontWeight: 600,
}));
```

확인할 것:

- 스타일 전용 prop이 잘못 DOM attribute로 전달되지 않는가?
- 렌더마다 크고 새로운 스타일 객체를 만들 필요가 있는가?
- 디자인 토큰/theme을 무시한 임의 색상과 간격이 늘어나는가?
- SSR에서 style 순서와 hydration이 일치하는가?
- 테스트가 내부 class 이름보다 사용자에게 보이는 상태를 검증하는가?

면접 질문: “CSS Modules 대신 Emotion을 선택할 이유와 비용은요?”

답변 골격: props/theme 기반 동적 스타일과 컴포넌트 근접성이 장점입니다. 반면 런타임 비용, SSR 설정, 디버깅과 도구 종속성이 생길 수 있습니다. 정적 스타일이 대부분이면 CSS Modules 같은 선택이 더 단순할 수 있습니다.

## 공식 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Emotion Introduction](https://emotion.sh/docs/introduction)

