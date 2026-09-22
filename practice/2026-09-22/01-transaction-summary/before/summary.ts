export interface Transaction {
  id: string;
  amount: number;
  status: 'COMPLETED' | 'CANCELLED';
}

export function summarizeTransactions(transactions: Transaction[]) {
  const ordered = transactions.sort((a, b) => b.amount - a.amount);
  return {
    count: ordered.length,
    total: ordered.reduce((sum, item) => sum + item.amount, 0),
  };
}
