import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SessionPlanner } from '../working/SessionPlanner';
import { canSelectSession, sessions } from '../working/sessions';

describe('세션 일정 기본 동작', () => {
  it('아무 세션도 선택하지 않았다면 세션을 선택할 수 있다', () => {
    expect(canSelectSession([], 'ui')).toBe(true);
  });

  it('시작 화면에 네 세션과 빈 일정을 표시한다', () => {
    render(<SessionPlanner />);
    expect(sessions).toHaveLength(4);
    expect(screen.getByRole('list', { name: '전체 세션' }).children).toHaveLength(4);
    expect(screen.getByRole('region', { name: '선택한 일정' })).toHaveTextContent(
      '아직 선택한 세션이 없습니다.',
    );
  });
});
