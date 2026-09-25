import type { Allocation } from './allocation';

export function AllocationTable({ rows }: { rows: Allocation[] }) {
  return (
    <section aria-label="배분 결과">
      <table>
        <thead><tr><th>목표</th><th>배분 금액</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td><td>{row.amount.toLocaleString('ko-KR')}원</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th>합계</th><td>{rows.reduce((sum, row) => sum + row.amount, 0).toLocaleString('ko-KR')}원</td></tr>
        </tfoot>
      </table>
    </section>
  );
}
