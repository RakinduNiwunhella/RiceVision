import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import FieldMap from './FieldMap';

// --- Mocks ---

jest.mock('../Map/FiltersPanel', () => ({ filters, setFilters }) => (
  <div data-testid="filters-panel">
    <button onClick={() => setFilters({ ...filters, districts: ['Galle'] })}>Add Galle</button>
    <span>{filters.districts.join(', ')}</span>
  </div>
));

jest.mock('../Map/MapLayersPanel', () => ({ layers, setLayers }) => (
  <div data-testid="layers-panel">
    <button onClick={() => setLayers({ ...layers, paddyExtent: true })}>Enable Paddy</button>
    <span>{layers.paddyExtent ? 'PaddyOn' : 'PaddyOff'}</span>
  </div>
));

jest.mock('../Map/RiceMap', () => ({ filters, layers }) => (
  <div data-testid="rice-map">
    Map for {filters.districts.join(', ')} with {layers.paddyExtent ? 'Paddy' : 'NoPaddy'}
  </div>
));

jest.mock('../TutorialTooltip', () => () => <div data-testid="tutorial-tooltip" />);

jest.mock('../../hooks/usePageTutorial', () => ({
  usePageTutorial: () => ({
    currentStep: 0,
    showTutorial: false,
    currentTutorialStep: null,
    hasMoreSteps: false,
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    closeTutorial: jest.fn(),
  })
}));

describe('FieldMap Component', () => {
  it('renders initial setup correctly on desktop', () => {
    render(
      <MemoryRouter>
        <FieldMap />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('rice-map')).toBeInTheDocument();
    expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
    expect(screen.getByTestId('layers-panel')).toBeInTheDocument();
  });

  it('syncs filters when arriving from Alerts page via state', async () => {
    const initialState = { district: 'Ampara', health: 'Healthy' };
    
    render(
      <MemoryRouter initialEntries={[{ pathname: '/field-map', state: initialState }]}>
        <Routes>
          <Route path="/field-map" element={<FieldMap />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // normalizeHealth('Healthy') -> 'Healthy'
      expect(screen.getByText(/Map for Ampara/i)).toBeInTheDocument();
    });
  });

  it('syncs filters from URL search parameters', async () => {
    render(
      <MemoryRouter initialEntries={['/field-map?district=polonnaruwa']}>
        <Routes>
          <Route path="/field-map" element={<FieldMap />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Formatted district should be 'Polonnaruwa'
      expect(screen.getByText(/Map for Polonnaruwa/i)).toBeInTheDocument();
    });
  });

  it('toggles mobile panel and switches tabs correctly', () => {
    // Set window width to trigger mobile if needed, but the component uses CSS classes (lg:hidden)
    // for desktop hiding, and logic for showing the panel.
    render(
      <MemoryRouter>
        <FieldMap />
      </MemoryRouter>
    );

    // Initial state: mobile panel hidden
    expect(screen.queryByText('Filters & Layers')).toBeInTheDocument(); // The button is always there but lg:hidden in CSS
    
    const toggleBtn = screen.getByText('Filters & Layers').closest('button');
    fireEvent.click(toggleBtn);

    // Now mobile panel should be visible
    const filtersTab = screen.getByRole('button', { name: /filter_list filters/i });
    const layersTab = screen.getByRole('button', { name: /layers layers/i }); // Button text is "layers" icon + "Layers" label
    
    expect(filtersTab).toBeInTheDocument();
    expect(layersTab).toBeInTheDocument();

    // Default tab is filters
    expect(screen.getAllByTestId('filters-panel').length).toBeGreaterThan(1); // One desktop, one mobile

    // Switch to layers
    fireEvent.click(layersTab);
    expect(screen.getAllByTestId('layers-panel').length).toBeGreaterThan(1);
  });

  it('allows updating filters and layers', () => {
    render(
      <MemoryRouter>
        <FieldMap />
      </MemoryRouter>
    );

    const addGalleBtn = screen.getByText('Add Galle');
    fireEvent.click(addGalleBtn);
    expect(screen.getByText(/Map for Galle/i)).toBeInTheDocument();

    const enablePaddyBtn = screen.getByText('Enable Paddy');
    fireEvent.click(enablePaddyBtn);
    expect(screen.getByText(/with Paddy/i)).toBeInTheDocument();
  });
});
