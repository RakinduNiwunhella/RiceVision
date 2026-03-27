import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Alerts from './Alerts';

// --- Mocks ---

import { apiFetch } from '../../api/apiFetch';
import { updateAlertStatus } from '../../api/api';

jest.mock('../../api/apiFetch', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('../../api/api', () => ({
  updateAlertStatus: jest.fn(),
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const mockT = (key) => key;
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: mockT,
  }),
}));

jest.mock('../../utils/agriTranslations', () => ({
  translateDisasterType: (val) => val,
  translateStageCategory: (val) => val,
  translateHealthCategory: (val) => val,
}));

jest.mock('../../utils/locationTranslations', () => ({
  translateDistrictName: (val) => val,
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => {
        const { initial, animate, exit, transition, ...validProps } = props;
        return <div ref={ref} {...validProps}>{children}</div>;
      }),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

jest.mock('../../hooks/usePageTutorial', () => ({
  usePageTutorial: () => ({
    currentStep: 0,
    showTutorial: false,
    currentTutorialStep: null,
    hasMoreSteps: false,
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    closeTutorial: jest.fn(),
  }),
}));

// --- Test Suite ---

describe('Alerts Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    localStorage.clear();

    apiFetch.mockImplementation(async (url) => {
      if (url === '/api/alerts/status-counts') {
        return { ok: true, json: async () => ({ Open: 5, Resolved: 10 }) };
      }
      if (url === '/api/alerts/disasters') {
        return {
          ok: true,
          json: async () => [
            {
              id: 101,
              disaster_type: 'Flood',
              stage: 'Vegetative',
              health: 'Poor',
              status: 'Open',
              district: 'Colombo',
              timestamp: '2026-01-01T00:00:00Z',
            }
          ]
        };
      }
      if (url === '/api/alerts/pest-risk') {
        return {
          ok: true,
          json: async () => [
            {
              district: 'Kandy',
              risky_pixels: 50,
              status: 'Open',
            }
          ]
        };
      }
      if (url === '/api/alerts/past') {
        return {
          ok: true,
          json: async () => [
            {
              id: 202,
              is_pest: false,
              disaster_type: 'Drought',
              status: 'Resolved',
              district: 'Galle',
              timestamp: '2026-01-01T00:00:00Z',
              note: 'Fixed irrigation',
            }
          ]
        };
      }
      return { ok: true, json: async () => [] };
    });

    updateAlertStatus.mockResolvedValue({});
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Alerts />
      </BrowserRouter>
    );
  };

  it('renders tab headers, counts, and fetches disaster alerts by default', async () => {
    renderComponent();

    // Verify Tab Headers
    expect(screen.getByText('pestRisks')).toBeInTheDocument();
    expect(screen.getByText('disasters')).toBeInTheDocument();
    expect(screen.getByText('pastAlerts')).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      // It should display exactly '5' for Open count, and '10' for Resolved
      const openCount = screen.getByText('5');
      const resolvedCount = screen.getByText('10');
      expect(openCount).toBeInTheDocument();
      expect(resolvedCount).toBeInTheDocument();

      // Check for the mapped disaster alert "Flood alertRiskLabel"
      expect(screen.getByText('Flood alertRiskLabel')).toBeInTheDocument();
      expect(screen.getByText('alertStage: Vegetative | alertHealth: Poor')).toBeInTheDocument();
    });
  });

  it('allows switching between tabs', async () => {
    renderComponent();

    // Wait for initial disasters
    await waitFor(() => screen.getByText('Flood alertRiskLabel'));

    // Switch to Pest tab
    const pestTab = screen.getByText('pestRisks');
    await user.click(pestTab);

    // Should fetch and show pests
    await waitFor(() => {
      // The text format uses Kandy : 50 alertRisksSuffix
      expect(screen.getByText(/Kandy/)).toBeInTheDocument();
      expect(screen.getByText(/alertMultiplePestRisks/)).toBeInTheDocument();
    });

    // Switch to Past Alerts
    const pastTab = screen.getByText('pastAlerts');
    await user.click(pastTab);

    await waitFor(() => {
      expect(screen.getByText('Drought alertRiskLabel')).toBeInTheDocument();
      expect(screen.getByText('noteLabel: Fixed irrigation')).toBeInTheDocument();
    });
  });

  it('resolves an alert successfully with optimistic updates', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Flood alertRiskLabel')).toBeInTheDocument();
    });

    // Click Resolve
    const resolveBtn = screen.getByRole('button', { name: 'resolveBtn' });
    await user.click(resolveBtn);

    // Modal appears
    await waitFor(() => {
      expect(screen.getByText('resolveAlertTitle')).toBeInTheDocument();
    });

    // Enter note
    const noteInput = screen.getByPlaceholderText('resolutionNotePlaceholder');
    await user.type(noteInput, 'Deploying sandbags');

    // Confirm
    const confirmBtn = screen.getByRole('button', { name: 'confirmBtn' });
    await user.click(confirmBtn);

    // Optimistic Update Checks
    await waitFor(() => {
      // 2. Open counts decrement to 4, Resolved counts increment to 11
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
      
      // 1. Alert is removed from UI immediately
      expect(screen.queryByText('Flood alertRiskLabel')).not.toBeInTheDocument();

      // 3. API was called with the note
      expect(updateAlertStatus).toHaveBeenCalledWith(101, 'Resolved', 'normal', 'Deploying sandbags');
    });
  });

  it('ignores an alert using optimistic UI updates', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Flood alertRiskLabel')).toBeInTheDocument();
    });

    // Click Ignore
    const ignoreBtn = screen.getByRole('button', { name: 'ignoreBtn' });
    await user.click(ignoreBtn);

    // Verify it disappears from DOM since it's an optimistic update immediately filtering it out
    await waitFor(() => {
      // Counts for Open decrease to 4
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.queryByText('Flood alertRiskLabel')).not.toBeInTheDocument();
      expect(updateAlertStatus).toHaveBeenCalledWith(101, 'Ignored', 'normal', null);
    });
  });
});
