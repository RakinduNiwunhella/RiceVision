import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SignupPage from './Signup';
import { supabase } from '../../supabaseClient';

// Mock Dependencies
jest.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}));

// Mock API BaseModel
jest.mock('../../config/apiBase', () => ({
  API_BASE: 'http://localhost:8000',
}));

// Mock navigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock contexts
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key, // Simply return the key as translation for testing
  }),
}));

beforeAll(() => {
  // Mock window.alert to prevent tests from hanging
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('SignupPage Component', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    global.fetch = jest.fn();
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
  };

  it('renders all form fields and submit button', () => {
    renderComponent();

    // Verify key elements exist based on translated keys mapped as text
    expect(screen.getByRole('heading', { level: 2, name: 'createAccount' })).toBeInTheDocument();
    
    // The placeholder values provide a robust way to find inputs
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument(); // Full Name
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument(); // Email
    
    // There are two password placeholders
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    expect(passwordInputs).toHaveLength(2); // Password and Confirm Password

    expect(screen.getByRole('button', { name: 'signUpBtn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continueGoogle/i })).toBeInTheDocument();
  });

  it('valdiates missing fields correctly when submitted empty', async () => {
    renderComponent();
    
    // Submit empty form
    const submitBtn = screen.getByRole('button', { name: 'signUpBtn' });
    
    // Use form validation behavior natively or try submitting
    // We expect HTML5 validation to block it, but let's just make sure
    // the submit handler doesn't call fetch if required fields are missing
    await user.click(submitBtn);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error on invalid email address', async () => {
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    await user.type(emailInput, 'invalid-email');
    
    // The component sets "validEmailAddressError" if invalid
    expect(await screen.findByText('validEmailAddressError')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderComponent();
    
    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    
    await user.type(passwordInput, 'valid123');
    await user.type(confirmInput, 'invalid123');
    
    // It should display 'passwordsNoMatchError'
    expect(await screen.findByText('passwordsNoMatchError')).toBeInTheDocument();
  });

  it('shows error on short password', async () => {
    renderComponent();
    
    const [passwordInput] = screen.getAllByPlaceholderText('••••••••');
    
    await user.type(passwordInput, '123');
    
    expect(await screen.findByText('passwordMinLengthError')).toBeInTheDocument();
  });

  it('successfully submits the form and navigates on success', async () => {
    // Mock successful fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    renderComponent();

    // Fill standard form
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.type(screen.getByPlaceholderText('name@company.com'), 'test@example.com');
    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'password123');

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'signUpBtn' });
    await user.click(submitBtn);

    await waitFor(() => {
      // Fetch should be called correctly
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/signup', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: 'Test User', email: 'test@example.com', password: 'password123' })
      }));
      // LocalStorage updated
      expect(localStorage.getItem('ricevision_tutorial_pages')).toBe('{}');
      // Navigation invoked
      expect(mockedNavigate).toHaveBeenCalledWith('/field-setup', { state: { fromSignup: true } });
    });
  });

  it('shows error alert on bad response from API', async () => {
    // Mock failure fetch
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Custom Backend Error' }),
    });

    renderComponent();

    // Fill standard form
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.type(screen.getByPlaceholderText('name@company.com'), 'test@example.com');
    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'password123');

    await user.click(screen.getByRole('button', { name: 'signUpBtn' }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Custom Backend Error');
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  it('simulates Google Signup correctly', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({ error: null });

    renderComponent();

    const googleBtn = screen.getByRole('button', { name: /continueGoogle/i });
    await user.click(googleBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://app.ricevisionlanka.com/dashboard',
        },
      });
      expect(localStorage.getItem('ricevision_tutorial_pages')).toBe('{}');
    });
  });

  it('alerts on Google Signup error', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({ error: { message: 'OAuth Error' } });

    renderComponent();

    const googleBtn = screen.getByRole('button', { name: /continueGoogle/i });
    await user.click(googleBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('OAuth Error');
    });
  });
});
