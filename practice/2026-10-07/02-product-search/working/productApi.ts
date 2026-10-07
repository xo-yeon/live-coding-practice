export type Product = { id: string; name: string };
export type SearchResult = { items: Product[]; page: number; totalPages: number };
export type SearchProducts = (query: string, page: number) => Promise<SearchResult>;

const products: Product[] = [
  { id: 'p1', name: 'Desk lamp' },
  { id: 'p2', name: 'Standing desk' },
  { id: 'p3', name: 'Desk organizer' },
  { id: 'p4', name: 'Floor lamp' },
  { id: 'p5', name: 'Clip lamp' },
  { id: 'p6', name: 'Notebook' },
];

// 연습용 서버 계약: 한 페이지에 두 상품을 반환합니다.
export const searchProducts: SearchProducts = async (query, page) => {
  const keyword = query.trim().toLowerCase();
  await new Promise((resolve) => setTimeout(resolve, keyword === 'desk' ? 700 : 150));
  if (keyword === 'offline') throw new Error('검색 서비스를 사용할 수 없습니다.');

  const matching = products.filter((product) => product.name.toLowerCase().includes(keyword));
  const totalPages = Math.max(1, Math.ceil(matching.length / 2));
  return { items: matching.slice((page - 1) * 2, page * 2), page, totalPages };
};
