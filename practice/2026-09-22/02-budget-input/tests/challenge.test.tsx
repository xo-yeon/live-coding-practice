import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BudgetInput } from '../working/BudgetInput';

describe('생활비 예산 — 공개 테스트', () => {
  it('초기 금액과 남은 예산을 표시한다', () => {
    render(<BudgetInput />);
    expect(screen.getByLabelText('사용할 금액')).toHaveValue(10000);
    expect(screen.getByText('남은 예산: 90000원')).toBeInTheDocument();
  });
  it('사용자가 입력한 금액을 입력창에 표시한다', () => {
    render(<BudgetInput />);
    fireEvent.change(screen.getByLabelText('사용할 금액'), { target: { value: '20000' } });
    expect(screen.getByLabelText('사용할 금액')).toHaveValue(20000);
  });
  it('예산을 모두 사용했을 때 0원으로 표시한다', () => {
    render(<BudgetInput />);
    fireEvent.change(screen.getByLabelText('사용할 금액'), { target: { value: '100000' } });
    expect(screen.getByText('남은 예산: 0원')).toBeInTheDocument();
  });
  it('빈 입력은 0으로 취급한다', () => {
    render(<BudgetInput />);
    fireEvent.change(screen.getByLabelText('사용할 금액'), { target: { value: '' } });
    expect(screen.getByText('남은 예산: 100000원')).toBeInTheDocument();
  });
});
