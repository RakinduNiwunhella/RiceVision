import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FiltersPanel from './FiltersPanel';

// Mock translation context
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
  }),
}));

describe('FiltersPanel Component', () => {
  const defaultProps = {
    filters: {
      districts: [],
      health: [],
    },
    setFilters: vi.fn(),
  };

  it('updates search query when typing in district input', () => {
    render(<FiltersPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('mapSearchDistrictPlaceholder');
    fireEvent.change(input, { target: { value: 'Ampara' } });
    
    expect(input.value).toBe('Ampara');
  });

  it('calls setFilters when a district is selected from dropdown', () => {
    render(<FiltersPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('mapSearchDistrictPlaceholder');
    fireEvent.focus(input);
    
    const districtOption = screen.getByText('Ampara');
    fireEvent.click(districtOption);
    
    expect(defaultProps.setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when health status radio is clicked', () => {
    render(<FiltersPanel {...defaultProps} />);
    
    const radio = screen.getByLabelText('healthNormal');
    fireEvent.click(radio);
    
    expect(defaultProps.setFilters).toHaveBeenCalled();
  });

  it('shows clear button when districts are selected', () => {
    const propsWithDistrict = {
      ...defaultProps,
      filters: { ...defaultProps.filters, districts: ['Ampara'] },
    };
    
    render(<FiltersPanel {...propsWithDistrict} />);
    expect(screen.getByText('mapClearBtn')).toBeInTheDocument();
  });
});
