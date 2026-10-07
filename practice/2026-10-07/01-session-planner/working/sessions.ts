export type Session = {
  id: string;
  title: string;
  start: number;
  end: number;
};

// 시간은 자정부터 지난 분으로 표현합니다. end 시각에는 세션이 끝납니다.
export const sessions: Session[] = [
  { id: 'ui', title: 'UI 설계', start: 9 * 60, end: 10 * 60 },
  { id: 'testing', title: '테스트 실습', start: 10 * 60, end: 11 * 60 },
  { id: 'state', title: '상태 모델링', start: 9 * 60 + 30, end: 10 * 60 + 30 },
  { id: 'async', title: '비동기 흐름', start: 11 * 60, end: 12 * 60 },
];

export function formatTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function canSelectSession(
  selectedIds: string[],
  candidateId: string,
  allSessions: Session[] = sessions,
): boolean {
  const candidate = allSessions.find((session) => session.id === candidateId);
  if (!candidate) return false;
  return selectedIds.every((id) => {
    const selected = allSessions.find((session) => session.id === id);
    return !selected || candidate.end < selected.start || candidate.start > selected.end;
  });
}
