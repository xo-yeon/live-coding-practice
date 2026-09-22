import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecipientPicker } from '../working/RecipientPicker';

const recipients = [
  { id: 'a', name: '김하나' },
  { id: 'b', name: '이서연' },
];

describe('받는 분 선택 — 공개 테스트', () => {
  it('처음에는 아무도 선택되지 않는다', () => {
    render(<RecipientPicker recipients={recipients} />);
    expect(screen.getByText('선택한 사람: 0명')).toBeInTheDocument();
    expect(screen.getByLabelText('김하나')).not.toBeChecked();
  });
  it('이름으로 목록을 검색한다', () => {
    render(<RecipientPicker recipients={recipients} />);
    fireEvent.change(screen.getByLabelText('이름 검색'), { target: { value: '김' } });
    expect(screen.getByLabelText('김하나')).toBeInTheDocument();
    expect(screen.queryByLabelText('이서연')).not.toBeInTheDocument();
  });
});
