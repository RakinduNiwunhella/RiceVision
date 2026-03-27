import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MapLayersPanel from './MapLayersPanel';

// Mock translation context
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

describe('MapLayersPanel Component', () => {
  const defaultProps = {
    layers: {
      paddyExtent: false,
      showCircles: false,
      showSatellite: false,
      ndvi: false,
      evi: false,
      vv: false,
      vh: false,
      overlayOpacity: 0.75,
    },
    setLayers: vi.fn(),
    districtSelected: true,
  };

  it('toggles a layer when clicked', () => {
    render(<MapLayersPanel {...defaultProps} />);
    
    const toggle = screen.getByText('mapLayerPaddyExtent');
    fireEvent.click(toggle);
    
    expect(defaultProps.setLayers).toHaveBeenCalled();
  });

  it('updates opacity when range slider changes', () => {
    const propsWithActiveLayer = {
      ...defaultProps,
      layers: { ...defaultProps.layers, ndvi: true },
    };
    
    render(<MapLayersPanel {...propsWithActiveLayer} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.5' } });
    
    expect(propsWithActiveLayer.setLayers).toHaveBeenCalled();
  });

  it('shows lock message when no district is selected', () => {
    render(<MapLayersPanel {...defaultProps} districtSelected={false} />);
    
    expect(screen.getByText('Please Select a District to Unlock the Filters')).toBeInTheDocument();
    expect(screen.getByText('lock')).toBeInTheDocument();
  });

  it('layers are blurred and non-interactive when no district is selected', () => {
    const { container } = render(<MapLayersPanel {...defaultProps} districtSelected={false} />);
    const content = container.firstChild.firstChild;
    expect(content).toHaveClass('blur-sm');
    expect(content).toHaveClass('pointer-events-none');
  });
});
