import { fireEvent, render, screen, within } from '@testing-library/react';
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

// 정답 예시: 공개 요구사항을 사용자에게 보이는 결과로 재현한다.
describe('지원 요청함 재현·회귀 테스트 (정답 예시)', () => {
  it('검색어의 앞뒤 공백과 대소문자를 무시한다', () => {
    // 준비: 제목에 Printer가 들어간 요청이 두 건 있다.
    // 행동: 소문자 검색어를 공백과 함께 입력한다.
    const titles = filterTickets(initialTickets, '  printer  ', 'all').map(
      (ticket) => ticket.title,
    );
    // 기대: 두 요청 모두 검색된다.
    expect(titles).toEqual(['Printer setup', 'Printer jam']);
  });

  it('검색·필터를 바꿔도 상단 건수는 전체 목록 기준이다', () => {
    render(<TicketInbox />);
    fireEvent.change(screen.getByRole('textbox', { name: '제목 검색' }), {
      target: { value: 'Printer' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: '상태' }), {
      target: { value: 'done' },
    });

    expect(screen.getByText('전체 요청 4건 · 진행 중 2건')).toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: '요청 목록' })).getByText(/Printer jam/),
    ).toBeInTheDocument();
  });

  it('진행 중 요청을 완료하면 현재 필터에서 빠지고 전체 건수가 갱신된다', () => {
    render(<TicketInbox />);
    fireEvent.change(screen.getByRole('combobox', { name: '상태' }), {
      target: { value: 'open' },
    });

    const list = screen.getByRole('list', { name: '요청 목록' });
    const row = within(list)
      .getByText(/Printer setup/)
      .closest('li');
    expect(row).not.toBeNull();
    fireEvent.click(within(row!).getByRole('button', { name: '완료 처리' }));

    expect(within(list).queryByText(/Printer setup/)).not.toBeInTheDocument();
    expect(screen.getByText('전체 요청 4건 · 진행 중 1건')).toBeInTheDocument();
  });

  it('완료 요청을 다시 열면 현재 필터에서 빠지고 빈 결과를 안내한다', () => {
    render(<TicketInbox />);
    fireEvent.change(screen.getByRole('textbox', { name: '제목 검색' }), {
      target: { value: 'Access request' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: '상태' }), {
      target: { value: 'done' },
    });
    fireEvent.click(screen.getByRole('button', { name: '다시 열기' }));

    expect(screen.getByText('일치하는 요청이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('전체 요청 4건 · 진행 중 3건')).toBeInTheDocument();
  });
});
