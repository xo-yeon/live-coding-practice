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
  const keyword = query.trim().toLocaleLowerCase();
  return tickets.filter(
    (ticket) =>
      ticket.title.toLocaleLowerCase().includes(keyword) &&
      (status === 'all' || ticket.status === status),
  );
}
