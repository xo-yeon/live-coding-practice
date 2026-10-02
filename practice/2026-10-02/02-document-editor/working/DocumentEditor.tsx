import { useState } from 'react';
import { DocumentTabs } from './DocumentTabs';
import { initialDocuments, saveDocument, type DocumentId } from './documentApi';

type Props = { save?: typeof saveDocument };

export function DocumentEditor({ save = saveDocument }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState<DocumentId>('guide');
  const [draft, setDraft] = useState(initialDocuments[0].content);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const selected = documents.find((document) => document.id === selectedId)!;

  function selectDocument(id: DocumentId) {
    setSelectedId(id);
    setStatus('idle');
  }

  async function saveDraft() {
    setStatus('saving');
    try {
      const result = await save(selectedId, draft);
      setDocuments((current) =>
        current.map((document) =>
          document.id === result.id ? { ...document, content: result.content } : document,
        ),
      );
      setStatus('saved');
    } catch {
      setDraft(selected.content);
      setStatus('saved');
    }
  }

  return (
    <main>
      <header>
        <p className="eyebrow">LEVEL 2 · 문서 편집</p>
        <h1>팀 문서 편집기</h1>
      </header>
      <DocumentTabs documents={documents} selectedId={selectedId} onSelect={selectDocument} />
      <h2>{selected.title}</h2>
      <label htmlFor="document-content">편집 내용</label>
      <textarea
        id="document-content"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setStatus('idle');
        }}
        rows={6}
      />
      <p>
        <button type="button" onClick={() => void saveDraft()} disabled={status === 'saving'}>
          저장
        </button>
      </p>
      {status === 'saving' && <p role="status">저장 중…</p>}
      {status === 'saved' && <p role="status">저장되었습니다.</p>}
      <section aria-label="저장된 내용">
        <h3>현재 저장된 내용</h3>
        <p>{selected.content}</p>
      </section>
      <a href="/">문제 목록으로</a>
    </main>
  );
}
