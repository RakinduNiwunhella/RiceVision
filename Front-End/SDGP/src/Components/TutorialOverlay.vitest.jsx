import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TutorialOverlay from './TutorialOverlay';

describe('TutorialOverlay Component', () => {
  const mockSteps = [
    { title: 'Step 1', ref: { current: document.createElement('div') } },
    { title: 'Step 2', ref: { current: document.createElement('div') } },
  ];

  const defaultProps = {
    visible: true,
    steps: mockSteps,
    currentStep: 0,
    onNext: vi.fn(),
    onBack: vi.fn(),
    onSkip: vi.fn(),
    onFinish: vi.fn(),
  };

  it('renders current step content', () => {
    render(<TutorialOverlay {...defaultProps} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('calls onNext when Next button is clicked', () => {
    render(<TutorialOverlay {...defaultProps} />);
    
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it('shows Finish button on the last step', () => {
    render(<TutorialOverlay {...defaultProps} currentStep={1} />);
    
    expect(screen.getByText('Finish ✓')).toBeInTheDocument();
    const finishBtn = screen.getByText('Finish ✓');
    fireEvent.click(finishBtn);
    expect(defaultProps.onFinish).toHaveBeenCalled();
  });

  it('calls onSkip when X button is clicked', () => {
    render(<TutorialOverlay {...defaultProps} />);
    
    const skipBtn = screen.getByTitle('Skip tutorial');
    fireEvent.click(skipBtn);
    expect(defaultProps.onSkip).toHaveBeenCalled();
  });
});
