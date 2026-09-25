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
  it('체크박스 상태 변경 시 화면에도 바로 반영이 되고 있는지 확인한다.', () => {
    render(<RecipientPicker recipients={recipients} />);
    fireEvent.click(screen.getByLabelText('김하나'));
    expect(screen.getByLabelText('김하나')).toBeChecked();
  });
  it('체크박스 상태 변경 후 검색창에 다른 값을 넣어도 기존 체크된 값은 유지되는지 확인한다.', () => {
    render(<RecipientPicker recipients={recipients} />);
    fireEvent.click(screen.getByLabelText('이서연'));
    fireEvent.change(screen.getByLabelText('이름 검색'), { target: { value: '김하나' } });
    fireEvent.click(screen.getByRole('button', { name: '검색 결과 모두 선택' }));
    expect(screen.getByText('선택한 사람: 2명')).toBeInTheDocument();
  });
});
