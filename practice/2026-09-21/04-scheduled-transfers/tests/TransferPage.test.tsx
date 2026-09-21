import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TransferPage } from '../working/TransferPage';

describe('송금 예약 관리 — 공개 동작', () => {
  it('서버의 예약 목록과 계좌 잔액을 표시한다', async () => {
    render(<TransferPage />);
    expect(await screen.findByRole('button', { name: '김하나' })).toBeInTheDocument();
    expect(screen.getByText('2,500,000원')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('받는 분을 선택하면 상세 패널이 열린다', async () => {
    render(<TransferPage />);
    fireEvent.click(await screen.findByRole('button', { name: '김하나' }));
    const panel = screen.getByRole('complementary', { name: '예약 상세' });
    expect(within(panel).getByText('150,000원')).toBeInTheDocument();
    fireEvent.click(within(panel).getByRole('button', { name: '상세 닫기' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('유효한 폼을 제출하면 등록 완료를 알리고 목록을 갱신한다', async () => {
    render(<TransferPage />);
    const form = await screen.findByRole('region', { name: '새 송금 예약' });
    const ui = within(form);
    fireEvent.change(ui.getByLabelText('받는 분'), { target: { value: '홍서윤' } });
    fireEvent.change(ui.getByLabelText('계좌번호'), { target: { value: '1234567890' } });
    fireEvent.change(ui.getByLabelText('송금액'), { target: { value: '50,000' } });
    fireEvent.change(ui.getByLabelText('예약일'), { target: { value: '2026-10-20' } });
    fireEvent.click(ui.getByRole('button', { name: '예약 등록' }));
    expect(await ui.findByText('예약을 등록했습니다.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: '홍서윤' })).toBeInTheDocument());
  });
});
