import { useState } from 'react';
import type { Transfer, TransferFilters as Filters } from './types';
import { useTransfers } from './useTransfers';
import { won } from './format';
import { TransferFilters } from './TransferFilters';
import { TransferForm } from './TransferForm';
import { TransferTable } from './TransferTable';
import { TransferDetail } from './TransferDetail';
import './transfers.css';

export function TransferPage() {
  const [filters, setFilters] = useState<Filters>({ keyword: '', status: 'ALL' });
  const [selected, setSelected] = useState<Transfer | null>(null);
  const { items, account, loading, error, refresh, cancel } = useTransfers(filters);
  const reservedAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <main className="transfer-page">
      <header>
        <p className="eyebrow">FINTECH · PRACTICE WORKSPACE</p>
        <h1>송금 예약 관리</h1>
        <p>모든 계좌와 거래는 연습용 가상 데이터입니다.</p>
        <a href="/">환경 확인 화면</a>
      </header>
      {account && (
        <section className="transfer-summary" aria-label="계좌 요약">
          <div>
            <span>{account.name} 잔액</span>
            <strong>{won(account.availableBalance)}</strong>
          </div>
          <div>
            <span>건별 한도</span>
            <strong>{won(account.dailyLimit)}</strong>
          </div>
          <div>
            <span>현재 목록의 예약 합계</span>
            <strong>{won(reservedAmount)}</strong>
          </div>
        </section>
      )}
      <div className="transfer-layout">
        <section className="transfer-card" aria-label="송금 관리">
          <h2>예약 내역</h2>
          <TransferFilters filters={filters} onChange={setFilters} />
          <button type="button" onClick={refresh}>
            새로고침
          </button>
          {loading && <p role="status">내역을 불러오는 중…</p>}
          {error && <p role="alert">{error}</p>}
          <TransferTable items={items} onSelect={setSelected} onCancel={cancel} />
          {selected && <TransferDetail transfer={selected} onClose={() => setSelected(null)} />}
        </section>
        {account && <TransferForm account={account} onCreated={refresh} />}
      </div>
    </main>
  );
}
