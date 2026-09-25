export interface Transaction {
  id: string;
  amount: number;
  status: 'COMPLETED' | 'CANCELLED';
}

export function summarizeTransactions(transactions: Transaction[]) {
  // 완료된 거래만 건수와 합계에 포함합니다. 빈 목록은 둘 다 0입니다.
  // 호출 전후 입력 배열의 내용과 순서는 그대로여야 합니다.
  // 금액은 0 이상의 정수라고 가정합니다.

  /* [내 작성 코드]
  const ordered = transactions.filter((item) => item.status === 'COMPLETED');

  return {
    count: ordered.length,
    total: ordered.reduce((sum, item) => sum + item.amount, 0),
  };
  */

  // [정답 코드]
  const completed = transactions.filter((item) => item.status === 'COMPLETED');
  return {
    count: completed.length,
    total: completed.reduce((sum, item) => sum + item.amount, 0),
  };
}
