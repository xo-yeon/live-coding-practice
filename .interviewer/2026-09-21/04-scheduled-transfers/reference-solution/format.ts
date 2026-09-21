import type { TransferStatus } from './types';

export const won = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;

export const statusLabel: Record<TransferStatus, string> = {
  SCHEDULED: '예약',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export const maskAccount = (account: string) =>
  account.length < 5 ? '****' : `${account.slice(0, 3)}-****-${account.slice(-2)}`;
