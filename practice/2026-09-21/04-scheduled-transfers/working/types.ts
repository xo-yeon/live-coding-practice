export type TransferStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Account {
  id: string;
  name: string;
  availableBalance: number;
  dailyLimit: number;
}

export interface Transfer {
  id: string;
  recipient: string;
  bank: string;
  accountNumber: string;
  amount: number;
  scheduledDate: string;
  status: TransferStatus;
  memo: string;
}

export interface TransferDraft {
  recipient: string;
  bank: string;
  accountNumber: string;
  amount: string;
  scheduledDate: string;
  memo: string;
}

export interface CreateTransfer {
  recipient: string;
  bank: string;
  accountNumber: string;
  amount: number;
  scheduledDate: string;
  memo: string;
}

export interface TransferFilters {
  keyword: string;
  status: 'ALL' | TransferStatus;
}

export interface TransferPage {
  account: Account;
  items: Transfer[];
}
