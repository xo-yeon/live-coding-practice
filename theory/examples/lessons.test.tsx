import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseSeats, calculatePrice } from './seats';
import { SeatsEditor } from './SeatsEditor';
import { useSeatsEditor } from './useSeatsEditor';

afterEach(cleanup);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('입력 계약', () => {
  it.each(['', '   ', 'abc', '2.5', '1e1', '0', '21'])('%j를 거부한다', (raw) => {
    expect(parseSeats(raw).ok).toBe(false);
  });
  it.each([
    ['1', 1],
    ['20', 20],
    [' 3 ', 3],
  ])('%j를 허용한다', (raw, value) => {
    expect(parseSeats(String(raw))).toEqual({ ok: true, value });
  });
  it('3석은 45,000원이다', () => {
    expect(calculatePrice(3)).toBe(45000);
  });
});

describe('입력에서 서버 확정까지', () => {
  it('잘못된 입력은 요청하지 않고 오류를 표시한다', () => {
    const save = vi.fn<(value: number) => Promise<number>>();
    render(<SeatsEditor saveSeats={save} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByRole('alert')).toHaveTextContent('정수');
    expect(save).not.toHaveBeenCalled();
  });

  it('저장 중 확정값을 유지하고 성공 응답 후 반영한다', async () => {
    const pending = deferred<number>();
    const save = vi.fn(() => pending.promise);
    render(
      <StrictMode>
        <SeatsEditor saveSeats={save} />
      </StrictMode>,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByText('확정 좌석: 2석')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(save).toHaveBeenCalledWith(3);
    await act(async () => {
      pending.resolve(3);
    });
    expect(screen.getByText('확정 좌석: 3석')).toBeInTheDocument();
    expect(screen.getByText('확정 금액: 45,000원')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('실패하면 초안과 확정값을 유지하고 같은 초안으로 재시도한다', async () => {
    const first = deferred<number>();
    const second = deferred<number>();
    const save = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    render(<SeatsEditor saveSeats={save} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await act(async () => {
      first.reject(new Error('offline'));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('다시 시도');
    expect(screen.getByRole('textbox')).toHaveValue('4');
    expect(screen.getByText('확정 좌석: 2석')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await act(async () => {
      second.resolve(4);
    });
    expect(screen.getByText('확정 좌석: 4석')).toBeInTheDocument();
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('같은 렌더의 submit을 두 번 호출해도 요청은 한 번이다', async () => {
    const pending = deferred<number>();
    const save = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useSeatsEditor(2, save));
    act(() => {
      void result.current.submit();
      void result.current.submit();
    });
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve(2);
    });
    expect(result.current.saving).toBe(false);
  });

  it('저장 도중 편집 요청은 받아들이지 않는다', async () => {
    const pending = deferred<number>();
    const { result } = renderHook(() => useSeatsEditor(2, () => pending.promise));
    act(() => {
      void result.current.submit();
      result.current.changeRaw('9');
    });
    expect(result.current.raw).toBe('2');
    await act(async () => {
      pending.resolve(2);
    });
  });
});
