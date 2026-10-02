import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentEditor } from '../working/DocumentEditor';

describe('팀 문서 편집기 기본 동작', () => {
  it('처음에는 안내문을 보여준다', () => {
    render(<DocumentEditor />);
    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue(
      '새 팀원에게 환영 인사를 보냅니다.',
    );
  });

  it('저장 성공 후 저장된 내용을 표시한다', async () => {
    const save = vi.fn().mockResolvedValue({ id: 'guide', content: '수정한 안내문' });
    render(<DocumentEditor save={save} />);
    fireEvent.change(screen.getByRole('textbox', { name: '편집 내용' }), {
      target: { value: '수정한 안내문' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(screen.getByRole('region', { name: '저장된 내용' })).toHaveTextContent(
        '수정한 안내문',
      ),
    );
    expect(save).toHaveBeenCalledWith('guide', '수정한 안내문');
  });
});
