import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const SampleComponent = () => {
  return (
    <div>
      <h1>Sample Component</h1>
      <p>This is a test component to verify Jest works with Vite, ESM, and React.</p>
    </div>
  );
};

describe('SampleComponent', () => {
  it('should render the component correctly', () => {
    render(<SampleComponent />);
    
    // Verify the heading exists
    const headingElement = screen.getByRole('heading', { level: 1, name: /sample component/i });
    expect(headingElement).toBeInTheDocument();
    
    // Verify paragraph exists
    const paragraphElement = screen.getByText(/verify jest works with vite/i);
    expect(paragraphElement).toBeInTheDocument();
  });
});
