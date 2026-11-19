import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import FeedbackMessage from '@/components/FeedbackMessage';

describe('FeedbackMessage', () => {
  // Screen readers announce changes to a live region that already exists; one
  // inserted together with its text is often not read out.
  it('keeps an empty status region on the page when state is null', () => {
    render(<FeedbackMessage state={null} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('changes the text of the same region when a message appears and clears', () => {
    const { rerender } = render(<FeedbackMessage state={null} />);
    const region = screen.getByRole('status');
    rerender(<FeedbackMessage state="correct" />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent('correct');
    rerender(<FeedbackMessage state={null} />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toBeEmptyDOMElement();
  });

  it('renders correct text when state is correct', () => {
    render(<FeedbackMessage state="correct" />);
    expect(screen.getByText('correct')).toBeInTheDocument();
  });

  it('renders incorrect text when state is incorrect', () => {
    render(<FeedbackMessage state="incorrect" />);
    expect(screen.getByText('incorrect')).toBeInTheDocument();
  });

  it('renders heard text when state is heard', () => {
    render(<FeedbackMessage state="heard" />);
    expect(screen.getByText('heard')).toBeInTheDocument();
  });

  it('renders notRecognized text when state is notRecognized', () => {
    render(<FeedbackMessage state="notRecognized" />);
    expect(screen.getByText('notRecognized')).toBeInTheDocument();
  });
});
