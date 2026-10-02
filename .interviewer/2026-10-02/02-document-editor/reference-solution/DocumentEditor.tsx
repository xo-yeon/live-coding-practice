import { useRef, useState } from 'react';
import { DocumentTabs } from './DocumentTabs';
import { initialDocuments, saveDocument, type DocumentId } from './documentApi';

type Props = { save?: typeof saveDocument };
type Message = { documentId: DocumentId; kind: 'saved' | 'error'; text: string } | null;

export function DocumentEditor({ save = saveDocument }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState<DocumentId>('guide');
  const selectedIdRef = useRef<DocumentId>('guide');
  const savingRef = useRef(false);
  const [savingId, setSavingId] = useState<DocumentId | null>(null);
  const [draft, setDraft] = useState(initialDocuments[0].content);
  const [message, setMessage] = useState<Message>(null);
  const selected = documents.find((document) => document.id === selectedId)!;

  function selectDocument(id: DocumentId) {
    selectedIdRef.current = id;
    setSelectedId(id);
    setDraft(documents.find((document) => document.id === id)!.content);
    setMessage(null);
  }

  async function saveDraft() {
    if (savingRef.current) return;
    const requestId = selectedId;
    const submittedContent = draft;
    savingRef.current = true;
    setSavingId(requestId);
    setMessage(null);
    try {
      const result = await save(requestId, submittedContent);
      setDocuments((current) =>
        current.map((document) =>
          document.id === result.id ? { ...document, content: result.content } : document,
        ),
      );
      if (selectedIdRef.current === requestId) {
        setMessage({ documentId: requestId, kind: 'saved', text: '저장되었습니다.' });
      }
    } catch (reason) {
      if (selectedIdRef.current === requestId) {
        setMessage({
          documentId: requestId,
          kind: 'error',
          text: reason instanceof Error ? reason.message : '저장에 실패했습니다.',
        });
      }
    } finally {
      savingRef.current = false;
      setSavingId(null);
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
          setMessage(null);
        }}
        rows={6}
      />
      <p><button type="button" onClick={() => void saveDraft()} disabled={savingId !== null}>저장</button></p>
      {savingId && <p role="status">저장 중…</p>}
      {message?.documentId === selectedId && message.kind === 'saved' && <p role="status">{message.text}</p>}
      {message?.documentId === selectedId && message.kind === 'error' && <p role="alert">{message.text}</p>}
      <section aria-label="저장된 내용">
        <h3>현재 저장된 내용</h3>
        <p>{selected.content}</p>
      </section>
      <a href="/">문제 목록으로</a>
    </main>
  );
}
