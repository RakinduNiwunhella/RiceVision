import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Signin from './Signin';
import { supabase } from '../../supabaseClient';

// --- Mocks ---

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

const mockToggleTheme = jest.fn();
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: mockToggleTheme,
  }),
}));

jest.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}));

// The env is now handled by babel-plugin-transform-vite-meta-env in most cases, 
// but we keep a fallback for explicit property access if needed.
if (!global.import) {
  global.import = { meta: { env: { DEV: true, VITE_SUPABASE_URL: 'http://localhost', VITE_SUPABASE_ANON_KEY: 'fake' } } };
}

describe('Signin Component', () => {
  let user;

  beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    global.fetch = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Signin />
      </BrowserRouter>
    );
  };

  it('renders the login form correctly', () => {
    renderComponent();
    
    expect(screen.getByText('welcomeBack')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'signInBtn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continueGoogle/i })).toBeInTheDocument();
  });

  it('shows required validation on empty submission', async () => {
    renderComponent();
    
    const submitBtn = screen.getByRole('button', { name: 'signInBtn' });
    
    // Clicking submit on an empty form should leave inputs invalid natively
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    // HTML5 strict validation won't fire onClick if fields are empty, but we can verify required attr
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('shows error message on invalid credentials', async () => {
    renderComponent();
    
    // Mock the fetch rejection
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Incorrect email or password' }),
    });

    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: 'signInBtn' });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'badpass');
    await user.click(submitBtn);

    // Should indicate the form is loading (button changes text) implicitly within cycle,
    // then render error box
    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'wrong@example.com', password: 'badpass' }),
      })
    );
  });

  it('navigates to dashboard and saves token on successful login', async () => {
    renderComponent();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'fake-jwt-token' }),
    });

    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: 'signInBtn' });

    await user.type(emailInput, 'valid@example.com');
    await user.type(passwordInput, 'correctpass');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'fake-jwt-token');
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('initiates Google OAuth authentication', async () => {
    renderComponent();
    
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({ data: {}, error: null });

    const googleBtn = screen.getByRole('button', { name: /continueGoogle/i });
    await user.click(googleBtn);

    expect(localStorage.setItem).toHaveBeenCalledWith('ricevision_tutorial_pages', '{}');
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/dashboard'
      }
    });
  });

  it('opens forgot password modal and submits reset request', async () => {
    renderComponent();
    
    // Open forgot password modal
    const forgotBtn = screen.getByRole('button', { name: 'forgotPassword' });
    await user.click(forgotBtn);

    const modalTitle = screen.getByText('resetPassword');
    expect(modalTitle).toBeInTheDocument();

    const resetEmailInput = screen.getByPlaceholderText('emailAddress');
    const sendBtn = screen.getByRole('button', { name: 'sendResetLink' });

    // Type email and submit successfully
    await user.type(resetEmailInput, 'forgot@example.com');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await user.click(sendBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reset-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'forgot@example.com' }),
        })
      );
      expect(screen.getByText('resetEmailSent')).toBeInTheDocument();
    });
  });
});
