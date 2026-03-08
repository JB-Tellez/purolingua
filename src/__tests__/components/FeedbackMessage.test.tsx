import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import FeedbackMessage from '@/components/FeedbackMessage';

describe('FeedbackMessage', () => {
  it('renders nothing when state is null', () => {
    const { container } = render(<FeedbackMessage state={null} />);
    expect(container.firstChild).toBeNull();
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
