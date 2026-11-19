import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import ClientOnly from '@/components/ClientOnly';

describe('ClientOnly', () => {
  it('renders nothing in prerendered HTML', () => {
    expect(renderToString(<ClientOnly><p>saved progress</p></ClientOnly>)).toBe('');
  });

  it('renders its children in the browser', () => {
    render(<ClientOnly><p>saved progress</p></ClientOnly>);
    expect(screen.getByText('saved progress')).toBeInTheDocument();
  });
});
