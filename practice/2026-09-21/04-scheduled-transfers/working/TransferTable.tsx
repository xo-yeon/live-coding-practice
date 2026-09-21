import type { Transfer } from './types';
import { maskAccount, statusLabel, won } from './format';

interface Props {
  items: Transfer[];
  onSelect: (item: Transfer) => void;
  onCancel: (id: string) => Promise<void>;
}

export function TransferTable({ items, onSelect, onCancel }: Props) {
  if (items.length === 0) return <p>표시할 송금 예약이 없습니다.</p>;

  return (
    <div className="transfer-table-scroll">
      <table>
        <caption>송금 예약 목록</caption>
        <thead>
          <tr>
            <th>받는 분</th>
            <th>송금액</th>
            <th>예약일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <button type="button" onClick={() => onSelect(item)}>
                  {item.recipient}
                </button>
                <small>
                  {item.bank} {maskAccount(item.accountNumber)}
                </small>
              </td>
              <td>{won(item.amount)}</td>
              <td>{item.scheduledDate}</td>
              <td>{statusLabel[item.status]}</td>
              <td>
                <button
                  type="button"
                  disabled={item.status !== 'SCHEDULED'}
                  onClick={() => void onCancel(item.id)}
                >
                  예약 취소
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
