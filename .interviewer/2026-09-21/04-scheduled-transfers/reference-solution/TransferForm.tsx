import { useRef, useState } from 'react';
import { transferApi } from './api';
import type { Account, TransferDraft } from './types';

const emptyDraft: TransferDraft = {
  recipient: '',
  bank: '샘플은행',
  accountNumber: '',
  amount: '',
  scheduledDate: '',
  memo: '',
};

export function TransferForm({ account, onCreated }: { account: Account; onCreated: () => void }) {
  const [draft, setDraft] = useState<TransferDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const [message, setMessage] = useState('');

  function update<K extends keyof TransferDraft>(field: K, value: TransferDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    if (inFlight.current) return;
    const raw = draft.amount.trim();
    if (!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)$/.test(raw)) {
      setMessage('정수 원화 금액을 입력해주세요.');
      return;
    }
    const amount = Number(raw.replaceAll(',', ''));
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount > account.availableBalance ||
      amount > account.dailyLimit
    ) {
      setMessage('잔액과 한도 내의 금액을 입력해주세요.');
      return;
    }
    inFlight.current = true;
    setSaving(true);
    setMessage('');
    try {
      await transferApi.create({ ...draft, amount });
      setMessage('예약을 등록했습니다.');
      setDraft(emptyDraft);
      onCreated();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : '등록 실패');
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="transfer-card" aria-label="새 송금 예약">
      <h2>송금 예약하기</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label>
          받는 분
          <input
            required
            value={draft.recipient}
            onChange={(event) => update('recipient', event.target.value)}
          />
        </label>
        <label>
          은행
          <select value={draft.bank} onChange={(event) => update('bank', event.target.value)}>
            <option>샘플은행</option>
            <option>연습은행</option>
          </select>
        </label>
        <label>
          계좌번호
          <input
            required
            value={draft.accountNumber}
            onChange={(event) => update('accountNumber', event.target.value)}
          />
        </label>
        <label>
          송금액
          <input
            required
            inputMode="decimal"
            placeholder="예: 50,000"
            value={draft.amount}
            onChange={(event) => update('amount', event.target.value)}
          />
        </label>
        <label>
          예약일
          <input
            required
            type="date"
            value={draft.scheduledDate}
            onChange={(event) => update('scheduledDate', event.target.value)}
          />
        </label>
        <label>
          메모
          <input
            maxLength={80}
            value={draft.memo}
            onChange={(event) => update('memo', event.target.value)}
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? '등록 중…' : '예약 등록'}
        </button>
        {message && <p role="status">{message}</p>}
      </form>
    </section>
  );
}
