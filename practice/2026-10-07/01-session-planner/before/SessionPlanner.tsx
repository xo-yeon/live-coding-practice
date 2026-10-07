import { useState } from 'react';
import { SessionList } from './SessionList';
import { canSelectSession, formatTime, sessions } from './sessions';

export function SessionPlanner() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const selectedSessions = sessions
    .filter((session) => selectedIds.includes(session.id))
    .sort((left, right) => left.start - right.start);

  function toggleSession(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      setMessage('');
      return;
    }
    if (!canSelectSession(selectedIds, id)) {
      setMessage('시간이 겹치는 세션은 함께 선택할 수 없습니다.');
      return;
    }
    selectedIds.push(id);
    setSelectedIds(selectedIds);
    setMessage('');
  }

  return (
    <main>
      <header>
        <p className="eyebrow">LEVEL 2 · 워크숍 일정</p>
        <h1>세션 일정 만들기</h1>
        <p>듣고 싶은 세션을 선택해 하루 일정을 만드세요.</p>
      </header>
      <h2>세션 목록</h2>
      <SessionList sessions={sessions} selectedIds={selectedIds} onToggle={toggleSession} />
      {message && <p role="alert">{message}</p>}
      <section aria-label="선택한 일정">
        <h2>선택한 일정 · {selectedSessions.length}개</h2>
        {selectedSessions.length === 0 ? (
          <p>아직 선택한 세션이 없습니다.</p>
        ) : (
          <ol>
            {selectedSessions.map((session) => (
              <li key={session.id}>
                {formatTime(session.start)} {session.title}
              </li>
            ))}
          </ol>
        )}
      </section>
      <a href="/">문제 목록으로</a>
    </main>
  );
}
