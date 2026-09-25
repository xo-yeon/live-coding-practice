import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { allocateSavings, initialGoals, validateTotal } from '../working/allocation';
import { SavingsAllocation } from '../working/SavingsAllocation';
describe('저축 배분 기본 동작', () => {
  it('100,000원을 기본 비중으로 배분한다', () => {
    expect(allocateSavings(100000, initialGoals).map((row) => row.amount)).toEqual([
      50000, 30000, 20000,
    ]);
  });
  it('음수는 거부하고 0원은 허용한다', () => {
    expect(validateTotal('-1')).not.toBeNull();
    expect(validateTotal('0')).toBeNull();
  });
  it('버튼을 누르면 결과를 표시한다', () => {
    render(<SavingsAllocation />);
    expect(screen.queryByRole('region', { name: '배분 결과' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '배분 미리보기' }));
    expect(screen.getByRole('region', { name: '배분 결과' })).toHaveTextContent('50,000원');
  });
});
