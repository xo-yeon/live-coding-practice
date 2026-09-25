export type Goal = { id: string; name: string; weight: number };
export type Allocation = { id: string; name: string; amount: number };
export const initialGoals: Goal[] = [
  { id: 'trip', name: '여행', weight: 50 },
  { id: 'emergency', name: '비상금', weight: 30 },
  { id: 'learning', name: '교육', weight: 20 },
];

export function allocateSavings(total: number, goals: Goal[]): Allocation[] {
  const weightSum = goals.reduce((sum, goal) => sum + goal.weight, 0);
  const rows = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    amount: Math.floor(total * goal.weight / weightSum),
  }));
  const remainder = total - rows.reduce((sum, row) => sum + row.amount, 0);
  return rows.map((row, index) => ({ ...row, amount: row.amount + (index < remainder ? 1 : 0) }));
}

export function validateTotal(raw: string): string | null {
  const value = Number(raw);
  if (raw.trim() === '' || !Number.isInteger(value) || value < 0 || value > 1000000) {
    return '0부터 1,000,000까지의 정수 금액을 입력해주세요.';
  }
  return null;
}
