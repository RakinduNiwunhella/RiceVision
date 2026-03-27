import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

// Mock translation context
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

// Mock tutorial hooks
vi.mock('../../hooks/usePageTutorial', () => ({
  usePageTutorial: () => ({
    currentStep: 0,
    showTutorial: false,
    currentTutorialStep: null,
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    closeTutorial: vi.fn(),
  }),
}));

describe('Sidebar Component', () => {
  it('renders all navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Use regex to match the translation keys or the translated text
    expect(screen.getAllByText(/myDashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fieldMap/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/alerts/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/myProfile/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/logout/i).length).toBeGreaterThan(0);
  });

  it('highlights the active link', () => {
    render(
      <MemoryRouter initialEntries={['/alerts']}>
        <Sidebar />
      </MemoryRouter>
    );

    // Finding the link specifically
    const alertsLinks = screen.getAllByRole('link');
    const alertsLink = alertsLinks.find(link => link.textContent.includes('alerts'));
    
    expect(alertsLink).toBeDefined();
    expect(alertsLink).toHaveClass('text-white'); // Active style class
  });
});
