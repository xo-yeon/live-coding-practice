import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductSearch } from '../working/ProductSearch';
import { searchProducts } from '../working/productApi';

describe('상품 검색 기본 동작', () => {
  it('연습용 API는 한 페이지에 두 상품을 반환한다', async () => {
    const result = await searchProducts('', 1);
    expect(result.items).toHaveLength(2);
    expect(result.totalPages).toBe(3);
  });

  it('첫 검색 결과를 화면에 표시한다', async () => {
    const search = vi.fn().mockResolvedValue({
      items: [{ id: 'p1', name: 'Desk lamp' }],
      page: 1,
      totalPages: 1,
    });
    render(<ProductSearch search={search} />);
    expect(await screen.findByRole('list', { name: '상품 목록' })).toHaveTextContent('Desk lamp');
    expect(search).toHaveBeenCalledWith('', 1);
  });
});
