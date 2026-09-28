import { calculatePrice } from './seats';
import { saveSeats as defaultSave } from './seatsApi';
import { useSeatsEditor } from './useSeatsEditor';

type Props = {
  initialSeats?: number;
  saveSeats?: (seats: number) => Promise<number>;
};

export function SeatsEditor({ initialSeats = 2, saveSeats = defaultSave }: Props) {
  const editor = useSeatsEditor(initialSeats, saveSeats);
  return (
    <section aria-label="워크숍 예약 편집">
      <h1>워크숍 예약</h1>
      <p>확정 좌석: {editor.confirmed}석</p>
      <p>확정 금액: {calculatePrice(editor.confirmed).toLocaleString('ko-KR')}원</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void editor.submit();
        }}
      >
        <label>
          예약할 좌석 수
          <input
            inputMode="numeric"
            value={editor.raw}
            disabled={editor.saving}
            onChange={(event) => editor.changeRaw(event.target.value)}
          />
        </label>
        <button type="submit" disabled={editor.saving}>
          {editor.saving ? '저장 중…' : '저장'}
        </button>
      </form>
      {editor.saving && <p role="status">예약을 저장하고 있습니다.</p>}
      {editor.error && <p role="alert">{editor.error}</p>}
    </section>
  );
}
