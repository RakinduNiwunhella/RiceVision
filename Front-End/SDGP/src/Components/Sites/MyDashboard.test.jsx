import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// --- Global Mocks (Must be before any imports that use them) ---

// Mock Environment
if (!global.import) {
  global.import = { meta: { env: { DEV: true, VITE_SUPABASE_URL: 'http://localhost', VITE_SUPABASE_ANON_KEY: 'fake' } } };
}

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock API layer entirely to avoid execution of supabaseClient.js
jest.mock('../../api/api', () => ({
  fetchHealthSummary: jest.fn(),
  fetchYield: jest.fn(),
  fetchBestDistricts: jest.fn(),
  fetchDistrictYields: jest.fn(),
  fetchDistrictHealth: jest.fn(),
  fetchStageDistribution: jest.fn(),
}));

// Mock translation utils
jest.mock('../../utils/locationTranslations', () => ({
  translateDistrictName: (name) => name,
}));
jest.mock('../../utils/agriTranslations', () => ({
  translateStageCategory: (name) => `Translated-${name}`,
  translateDisasterType: (name) => name,
}));

// Import component after mocks are set
import MyDashboard from './MyDashboard';
import * as api from '../../api/api';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Bug: () => <div data-testid="bug-icon" />,
}));

// Mock Contexts
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key,
  }),
}));

// Mock Hooks
jest.mock('../../hooks/usePageTutorial', () => ({
  usePageTutorial: () => ({
    currentStep: 0,
    showTutorial: false,
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    closeTutorial: jest.fn(),
  }),
}));

// Mock Components
jest.mock('../OnboardingTour', () => () => <div data-testid="onboarding-tour" />);
jest.mock('../TutorialOverlay', () => () => <div data-testid="tutorial-overlay" />);

// Data Mocks
const mockHealthSummary = { normal_pct: 80, mild_stress_pct: 15, severe_stress_pct: 5 };
const mockYieldForecast = { total_yield_kgs: 2500000, season: 'Maha' };
const mockBestDistricts = [{ District: 'Ampara', total_yield_kg_ha: 5000 }];
const mockDistrictYieldData = [{ districtname: 'Ampara', totalyield_kg: 5000000, predictedyield_kg_ha: 5000 }];
const mockDistrictHealth = [{ district: 'Ampara', normal_pct: 90 }];
const mockStageDistribution = [{ stage_name: 'Vegetative', stage_count: 100 }];

describe('MyDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.fetchHealthSummary.mockResolvedValue(mockHealthSummary);
    api.fetchYield.mockResolvedValue(mockYieldForecast);
    api.fetchBestDistricts.mockResolvedValue(mockBestDistricts);
    api.fetchDistrictYields.mockResolvedValue(mockDistrictYieldData);
    api.fetchDistrictHealth.mockResolvedValue(mockDistrictHealth);
    api.fetchStageDistribution.mockResolvedValue(mockStageDistribution);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MyDashboard />
      </BrowserRouter>
    );
  };

  it('renders dashboard headers correctly', () => {
    renderComponent();
    expect(screen.getByText('welcomeTitle')).toBeInTheDocument();
  });

  it('fetches and displays KPI data correctly', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('2.50M')).toBeInTheDocument();
    });
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders district yield tables with correct values', async () => {
    renderComponent();
    await waitFor(() => {
      // Use getAllByText for Ampara since it appears in multiple places
      expect(screen.getAllByText('Ampara').length).toBeGreaterThan(0);
    });

    // Check MT values (5M kg / 1000 = 5,000 MT)
    // Appear multiple times (list and table)
    expect(screen.getAllByText('5,000').length).toBeGreaterThan(0);
  });

  it('renders stage distribution chart and breakdown', async () => {
    renderComponent();
    await waitFor(() => {
      // Total fields tracked (100 in vegetative)
      expect(screen.getByText('100')).toBeInTheDocument();
      // Translated label
      expect(screen.getByText('Translated-Vegetative')).toBeInTheDocument();
    });
  });
});
