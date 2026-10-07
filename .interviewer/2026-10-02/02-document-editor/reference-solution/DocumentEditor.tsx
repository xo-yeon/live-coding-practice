import { useRef, useState } from 'react';
import { DocumentTabs } from './DocumentTabs';
import { initialDocuments, saveDocument, type DocumentId } from './documentApi';

type Props = { save?: typeof saveDocument };
type Message = { documentId: DocumentId; kind: 'saved' | 'error'; text: string } | null;

export function DocumentEditor({ save = saveDocument }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState<DocumentId>('guide');
  // 정답 수정 1: 비동기 응답 시 현재 보고 있는 문서를 확인한다.
  const selectedIdRef = useRef<DocumentId>('guide');
  const savingRef = useRef(false);
  const draftEditedRef = useRef(false);
  const [savingId, setSavingId] = useState<DocumentId | null>(null);
  const [draft, setDraft] = useState(initialDocuments[0].content);
  const [message, setMessage] = useState<Message>(null);
  const selected = documents.find((document) => document.id === selectedId)!;

  function selectDocument(id: DocumentId) {
    // 정답 수정 2: 문서 전환 시 이전 초안을 버리고 선택한 문서의 저장 내용을 연다.
    selectedIdRef.current = id;
    draftEditedRef.current = false;
    setSelectedId(id);
    setDraft(documents.find((document) => document.id === id)!.content);
    setMessage(null);
  }

  async function saveDraft() {
    // 정답 수정 3: 요청의 문서·내용을 고정하고 중복 저장을 막는다.
    if (savingRef.current) return;
    const requestId = selectedId;
    const submittedContent = draft;
    savingRef.current = true;
    draftEditedRef.current = false;
    setSavingId(requestId);
    setMessage(null);
    try {
      const result = await save(requestId, submittedContent);
      setDocuments((current) =>
        current.map((document) =>
          document.id === result.id ? { ...document, content: result.content } : document,
        ),
      );
      // 정답 수정 4: 다른 문서를 보는 동안 완료된 결과를 현재 문서의 알림으로 표시하지 않는다.
      if (selectedIdRef.current === requestId && !draftEditedRef.current) {
        setDraft(result.content);
        setMessage({ documentId: requestId, kind: 'saved', text: '저장되었습니다.' });
      }
    } catch (reason) {
      // 정답 수정 5: 실패해도 초안을 지우지 않고 오류를 보여 재시도를 허용한다.
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
          draftEditedRef.current = true;
          setDraft(event.target.value);
          setMessage(null);
        }}
        rows={6}
      />
      <p>
        <button type="button" onClick={() => void saveDraft()} disabled={savingId !== null}>
          저장
        </button>
      </p>
      {savingId && <p role="status">저장 중…</p>}
      {message?.documentId === selectedId && message.kind === 'saved' && (
        <p role="status">{message.text}</p>
      )}
      {message?.documentId === selectedId && message.kind === 'error' && (
        <p role="alert">{message.text}</p>
      )}
      <section aria-label="저장된 내용">
        <h3>현재 저장된 내용</h3>
        <p>{selected.content}</p>
      </section>
      <a href="/">문제 목록으로</a>
    </main>
  );
}
