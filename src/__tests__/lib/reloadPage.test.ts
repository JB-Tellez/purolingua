import { describe, it, expect, vi } from 'vitest';
import { reloadPage } from '@/lib/reloadPage';

describe('reloadPage', () => {
  it('calls reload() on the given location', () => {
    const location = { reload: vi.fn() };
    reloadPage(location);
    expect(location.reload).toHaveBeenCalledTimes(1);
  });
});
