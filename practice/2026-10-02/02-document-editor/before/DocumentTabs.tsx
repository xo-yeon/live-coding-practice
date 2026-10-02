import type { DocumentId, PracticeDocument } from './documentApi';

type Props = {
  documents: PracticeDocument[];
  selectedId: DocumentId;
  onSelect: (id: DocumentId) => void;
};

export function DocumentTabs({ documents, selectedId, onSelect }: Props) {
  return (
    <nav aria-label="문서 선택">
      {documents.map((document) => (
        <button
          key={document.id}
          type="button"
          aria-pressed={document.id === selectedId}
          onClick={() => onSelect(document.id)}
        >
          {document.title}
        </button>
      ))}
    </nav>
  );
}
