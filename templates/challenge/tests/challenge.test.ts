import { describe, expect, it } from 'vitest';

import { challenge } from '../working/challenge';

describe('challenge', () => {
  it('기본 동작을 확인한다', () => {
    expect(challenge([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
