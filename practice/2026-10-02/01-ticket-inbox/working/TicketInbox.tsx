import { useState } from 'react';
import { TicketList } from './TicketList';
import { filterTickets, initialTickets, type StatusFilter } from './tickets';

export function TicketInbox() {
  const [tickets, setTickets] = useState(initialTickets);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  // 정답 수정 1: 표시 목록은 현재 원본·검색어·필터에서 바로 계산한다.
  const visible = filterTickets(tickets, query, status);
  // 정답 수정 2: 상단 통계는 표시 목록이 아니라 전체 원본에서 계산한다.
  const openCount = tickets.filter((ticket) => ticket.status === 'open').length;

  function toggleTicket(id: string) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? { ...ticket, status: ticket.status === 'open' ? 'done' : 'open' }
          : ticket,
      ),
    );
  }

  return (
    <main>
      <header>
        <p className="eyebrow">LEVEL 2 · 요청 관리</p>
        <h1>지원 요청함</h1>
        <p>
          전체 요청 {tickets.length}건 · 진행 중 {openCount}건
        </p>
      </header>
      <label>
        제목 검색 <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>{' '}
      <label>
        상태{' '}
        <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
          <option value="all">전체</option>
          <option value="open">진행 중</option>
          <option value="done">완료</option>
        </select>
      </label>
      <TicketList tickets={visible} onToggle={toggleTicket} />
      <a href="/">문제 목록으로</a>
    </main>
  );
}
