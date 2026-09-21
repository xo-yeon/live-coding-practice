import type { Transfer } from './types';
import { maskAccount, statusLabel, won } from './format';

export function TransferDetail({ transfer, onClose }: { transfer: Transfer; onClose: () => void }) {
  return (
    <aside className="transfer-card" aria-label="예약 상세">
      <h2>{transfer.recipient}님 예약 상세</h2>
      <dl>
        <div>
          <dt>송금액</dt>
          <dd>{won(transfer.amount)}</dd>
        </div>
        <div>
          <dt>상태</dt>
          <dd>{statusLabel[transfer.status]}</dd>
        </div>
        <div>
          <dt>받는 계좌</dt>
          <dd>
            {transfer.bank} {maskAccount(transfer.accountNumber)}
          </dd>
        </div>
        <div>
          <dt>예약일</dt>
          <dd>{transfer.scheduledDate}</dd>
        </div>
      </dl>
      <p>메모: {transfer.memo || '없음'}</p>
      <button type="button" onClick={onClose}>
        상세 닫기
      </button>
    </aside>
  );
}
