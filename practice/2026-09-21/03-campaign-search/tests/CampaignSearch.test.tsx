import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CampaignSearch } from '../working/CampaignSearch';

describe('CampaignSearch', () => {
  it('입력한 이름에 맞는 캠페인을 표시한다', async () => {
    render(<CampaignSearch />);
    fireEvent.change(screen.getByLabelText('캠페인 검색'), { target: { value: '신규' } });
    await waitFor(() => expect(screen.getByText('신규 고객 캠페인')).toBeInTheDocument());
    expect(screen.queryByText('휴면 고객 리타게팅')).not.toBeInTheDocument();
  });
});
