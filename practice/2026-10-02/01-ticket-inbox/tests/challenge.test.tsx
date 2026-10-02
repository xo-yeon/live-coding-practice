import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TicketInbox } from '../working/TicketInbox';
import { filterTickets, initialTickets } from '../working/tickets';

describe('지원 요청함 기본 동작', () => {
  it('빈 검색어에서는 전체 요청을 반환한다', () => {
    expect(filterTickets(initialTickets, '', 'all')).toHaveLength(4);
  });

  it('제목 검색과 상태 필터로 목록을 좁힌다', () => {
    render(<TicketInbox />);
    fireEvent.change(screen.getByRole('textbox', { name: '제목 검색' }), {
      target: { value: 'Printer' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: '상태' }), {
      target: { value: 'open' },
    });
    expect(screen.getByRole('list', { name: '요청 목록' })).toHaveTextContent('Printer setup');
    expect(screen.queryByText(/Printer jam/)).not.toBeInTheDocument();
  });
});
