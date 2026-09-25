import { useState } from 'react';

export interface Recipient {
  id: string;
  name: string;
}

export function RecipientPicker({ recipients }: { recipients: Recipient[] }) {
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visible = recipients.filter((item) => item.name.includes(keyword));

  /* [내 작성 코드]
  function toggle(id: string) {
    const index = selectedIds.indexOf(id);

    if (index === -1) selectedIds.push(id);
    else selectedIds.splice(index, 1);

    setSelectedIds([...selectedIds]);
  }

  function allVisibleSelected() {
    const allIds = new Set([...selectedIds, ...visible.map((item) => item.id)]);
    setSelectedIds(Array.from(allIds));
  }
  */

  // [정답 코드]
  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function selectVisible() {
    setSelectedIds((current) => [...new Set([...current, ...visible.map((item) => item.id)])]);
  }

  return (
    <section>
      <h2>받는 분 선택</h2>
      <label>
        이름 검색
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      </label>
      {/* [정답 코드]: selectVisible 연결 (내 작성 코드: allVisibleSelected) */}
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
