import type { Ticket } from './tickets';

type Props = {
  tickets: Ticket[];
  onToggle: (id: string) => void;
};

export function TicketList({ tickets, onToggle }: Props) {
  if (tickets.length === 0) return <p>일치하는 요청이 없습니다.</p>;

  return (
    <ul aria-label="요청 목록">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <span>
            {ticket.title} · {ticket.status === 'open' ? '진행 중' : '완료'}
          </span>{' '}
          <button type="button" onClick={() => onToggle(ticket.id)}>
            {ticket.status === 'open' ? '완료 처리' : '다시 열기'}
          </button>
        </li>
      ))}
    </ul>
  );
}
