import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstallmentQuote } from '../working/InstallmentQuote';
import { fetchQuote } from '../working/quoteApi';
vi.mock('../working/quoteApi', () => ({ plans: [3, 6, 12], fetchQuote: vi.fn() }));
describe('할부 견적 기본 동작', () => {
  it('처음 3개월 견적을 조회하고 표시한다', async () => {
    vi.mocked(fetchQuote).mockResolvedValueOnce({
      months: 3,
      monthlyPayment: 41000,
      totalPayment: 123000,
    });
    render(<InstallmentQuote />);
    expect(screen.getByRole('status')).toHaveTextContent('조회 중');
    expect(await screen.findByRole('heading', { name: '3개월 견적' })).toBeInTheDocument();
    expect(screen.getByText('총 납부액: 123,000원')).toBeInTheDocument();
  });
  it('실패 메시지를 표시한다', async () => {
    vi.mocked(fetchQuote).mockRejectedValueOnce(new Error('서버 응답 실패'));
    render(<InstallmentQuote />);
    expect(await screen.findByRole('alert')).toHaveTextContent('서버 응답 실패');
  });
});
