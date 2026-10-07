import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentEditor } from '../working/DocumentEditor';
import type { DocumentId } from '../working/documentApi';

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

// 정답 예시: 내부 state 대신 사용자가 보는 초안·오류·저장 결과를 검사한다.
describe('팀 문서 편집기 재현·회귀 테스트 (정답 예시)', () => {
  it('문서를 바꾸면 미저장 초안을 버리고 선택한 문서의 저장 내용을 보여준다', () => {
    render(<DocumentEditor />);
    fireEvent.change(screen.getByRole('textbox', { name: '편집 내용' }), {
      target: { value: '저장하지 않은 안내문' },
    });

    fireEvent.click(screen.getByRole('button', { name: '준비 체크리스트' }));
    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue(
      '장비와 계정을 확인합니다.',
    );
    fireEvent.click(screen.getByRole('button', { name: '팀 안내문' }));
    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue(
      '새 팀원에게 환영 인사를 보냅니다.',
    );
  });

  it('저장 실패 시 오류와 초안을 유지하고 같은 내용으로 재시도한다', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('일시적인 저장 오류'))
      .mockResolvedValueOnce({ id: 'guide', content: '새 안내문' });
    render(<DocumentEditor save={save} />);
    fireEvent.change(screen.getByRole('textbox', { name: '편집 내용' }), {
      target: { value: '새 안내문' },
    });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('일시적인 저장 오류');
    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue('새 안내문');
    expect(screen.queryByText('저장되었습니다.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(screen.getByRole('region', { name: '저장된 내용' })).toHaveTextContent('새 안내문'),
    );
    expect(save).toHaveBeenNthCalledWith(1, 'guide', '새 안내문');
    expect(save).toHaveBeenNthCalledWith(2, 'guide', '새 안내문');
  });

  it('A 저장 중 B로 이동해도 A 결과를 B의 상태나 초안으로 표시하지 않는다', async () => {
    let resolveSave!: (value: { id: DocumentId; content: string }) => void;
    const save = vi.fn(
      () =>
        new Promise<{ id: DocumentId; content: string }>((resolve) => {
          resolveSave = resolve;
        }),
    );
    render(<DocumentEditor save={save} />);
    fireEvent.change(screen.getByRole('textbox', { name: '편집 내용' }), {
      target: { value: '저장할 안내문' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    fireEvent.click(screen.getByRole('button', { name: '준비 체크리스트' }));

    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue(
      '장비와 계정을 확인합니다.',
    );
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    await act(async () => resolveSave({ id: 'guide', content: '저장할 안내문' }));

    expect(screen.queryByText('저장되었습니다.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue(
      '장비와 계정을 확인합니다.',
    );
    fireEvent.click(screen.getByRole('button', { name: '팀 안내문' }));
    expect(screen.getByRole('textbox', { name: '편집 내용' })).toHaveValue('저장할 안내문');
    expect(save).toHaveBeenCalledTimes(1);
  });
});
