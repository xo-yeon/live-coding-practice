export type Ticket = {
  id: string;
  title: string;
  status: 'open' | 'done';
};

export type StatusFilter = 'all' | Ticket['status'];

export const initialTickets: Ticket[] = [
  { id: 't1', title: 'Printer setup', status: 'open' },
  { id: 't2', title: 'Login reset', status: 'open' },
  { id: 't3', title: 'Printer jam', status: 'done' },
  { id: 't4', title: 'Access request', status: 'done' },
];

export function filterTickets(tickets: Ticket[], query: string, status: StatusFilter): Ticket[] {
  // 정답 수정 3: 검색어와 제목을 같은 방식으로 정규화해 대소문자를 무시한다.
  const keyword = query.trim().toLowerCase();
  return tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(keyword) &&
      (status === 'all' || ticket.status === status),
  );
}
