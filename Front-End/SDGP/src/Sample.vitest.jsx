import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Vitest Sample Test', () => {
  it('should work correctly with RTL', () => {
    render(<div>Hello Vitest</div>);
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });

  it('verifies that globals are working', () => {
    // expect is global because of globals: true in vite.config.js
    expect(true).toBe(true);
  });
});
