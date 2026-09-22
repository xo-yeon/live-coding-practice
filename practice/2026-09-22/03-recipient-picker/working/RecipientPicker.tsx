import { useState } from 'react';

export interface Recipient {
  id: string;
  name: string;
}

export function RecipientPicker({ recipients }: { recipients: Recipient[] }) {
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visible = recipients.filter((item) => item.name.includes(keyword));

  function toggle(id: string) {
    const index = selectedIds.indexOf(id);
    if (index === -1) selectedIds.push(id);
    else selectedIds.splice(index, 1);
    setSelectedIds(selectedIds);
  }

  function selectVisible() {
    setSelectedIds(visible.map((item) => item.id));
  }

  return (
    <section>
      <h2>받는 분 선택</h2>
      <label>
        이름 검색
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      </label>
      <button type="button" onClick={selectVisible}>
        검색 결과 모두 선택
      </button>
      <p>선택한 사람: {selectedIds.length}명</p>
      <ul>
        {visible.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              {item.name}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
