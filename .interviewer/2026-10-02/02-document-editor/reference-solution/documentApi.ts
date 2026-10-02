export type DocumentId = 'guide' | 'checklist';

export type PracticeDocument = {
  id: DocumentId;
  title: string;
  content: string;
};

export const initialDocuments: PracticeDocument[] = [
  { id: 'guide', title: '팀 안내문', content: '새 팀원에게 환영 인사를 보냅니다.' },
  { id: 'checklist', title: '준비 체크리스트', content: '장비와 계정을 확인합니다.' },
];

const attempts = new Map<DocumentId, number>();

// 연습용 저장 API: 안내문의 첫 저장만 일시적으로 실패합니다.
export async function saveDocument(id: DocumentId, content: string): Promise<{
  id: DocumentId;
  content: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const attempt = (attempts.get(id) ?? 0) + 1;
  attempts.set(id, attempt);
  if (id === 'guide' && attempt === 1) {
    throw new Error('일시적인 저장 오류가 발생했습니다. 다시 시도해 주세요.');
  }
  return { id, content };
}
