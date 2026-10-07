import { formatTime, type Session } from './sessions';

type Props = {
  sessions: Session[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function SessionList({ sessions, selectedIds, onToggle }: Props) {
  return (
    <ul aria-label="전체 세션">
      {sessions.map((session) => {
        const selected = selectedIds.includes(session.id);
        return (
          <li key={session.id}>
            <span>
              {session.title} · {formatTime(session.start)}–{formatTime(session.end)}
            </span>{' '}
            <button type="button" onClick={() => onToggle(session.id)}>
              {selected ? '제거' : '추가'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
