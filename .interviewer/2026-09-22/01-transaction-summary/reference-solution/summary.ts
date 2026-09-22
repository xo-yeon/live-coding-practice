export interface Transaction {
  id: string;
  amount: number;
  status: 'COMPLETED' | 'CANCELLED';
}

export function summarizeTransactions(transactions: Transaction[]) {
  const completed = transactions.filter((item) => item.status === 'COMPLETED');
  return {
    count: completed.length,
    total: completed.reduce((sum, item) => sum + item.amount, 0),
  };
}
