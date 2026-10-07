import { useState } from 'react';
import { searchProducts, type SearchProducts } from './productApi';
import { useProducts } from './useProducts';

type Props = { search?: SearchProducts };

export function ProductSearch({ search = searchProducts }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const { result, loading, error } = useProducts(query, page, retry, search);

  return (
    <main>
      <header>
        <p className="eyebrow">LEVEL 2 · 상품 찾기</p>
        <h1>상품 검색</h1>
      </header>
      <label>
        상품명 <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {loading ? (
        <p role="status">검색 중…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((current) => current + 1)}>
            다시 시도
          </button>
        </div>
      ) : result ? (
        <section aria-label="검색 결과">
          {result.items.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <ul aria-label="상품 목록">
              {result.items.map((product) => (
                <li key={product.id}>{product.name}</li>
              ))}
            </ul>
          )}
          <p>
            페이지 {page} / {result.totalPages}
          </p>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            이전
          </button>{' '}
          <button
            type="button"
            disabled={page >= result.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </button>
        </section>
      ) : null}
      <p>
        <a href="/">문제 목록으로</a>
      </p>
    </main>
  );
}
