import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TutorialTooltip from './TutorialTooltip';

describe('TutorialTooltip Component', () => {
  const defaultProps = {
    visible: true,
    title: 'Welcome',
    action: 'Click something',
    outcome: 'Success occurs',
    step: 0,
    totalSteps: 3,
    onDismiss: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
  };

  it('renders content when visible', () => {
    render(<TutorialTooltip {...defaultProps} />);
    
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Click something')).toBeInTheDocument();
    expect(screen.getByText('Success occurs')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    render(<TutorialTooltip {...defaultProps} />);
    
    const nextBtn = screen.getByRole('button', { name: /next step/i });
    fireEvent.click(nextBtn);
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it('shows "Done" on the last step', () => {
    render(<TutorialTooltip {...defaultProps} step={2} />);
    
    expect(screen.getByText('Done')).toBeInTheDocument();
    const doneBtn = screen.getByText('Done');
    fireEvent.click(doneBtn);
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(<TutorialTooltip {...defaultProps} visible={false} />);
    expect(container.firstChild).toBeNull();
  });
});
