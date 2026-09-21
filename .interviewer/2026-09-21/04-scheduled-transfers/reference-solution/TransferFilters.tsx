import type { TransferFilters as Filters } from './types';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function TransferFilters({ filters, onChange }: Props) {
  return (
    <div className="transfer-filters">
      <label>
        받는 분 검색
        <input
          value={filters.keyword}
          placeholder="이름을 입력하세요"
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
        />
      </label>
      <label>
        예약 상태
        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as Filters['status'] })
          }
        >
          <option value="ALL">전체</option>
          <option value="SCHEDULED">예약</option>
          <option value="COMPLETED">완료</option>
          <option value="CANCELLED">취소</option>
        </select>
      </label>
    </div>
  );
}
