import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import SignupPage from "./Signup";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

// --- Mocks ---

// Router mock
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Supabase mock
jest.mock("../../supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}));

// ✅ IMPORTANT: Fix import.meta issue
jest.mock("../../config/apiBase", () => ({
  API_BASE: "http://localhost:5000",
}));

// Context mocks
jest.mock("../../context/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

jest.mock("../../context/LanguageContext", () => ({
  useLanguage: jest.fn(),
}));

// Global mocks
global.fetch = jest.fn();
global.alert = jest.fn();

// LocalStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// --- Tests ---

describe("SignupPage Component", () => {
  const mockNavigate = jest.fn();
  const mockToggleTheme = jest.fn();
  const mockT = (key) => key;

  beforeEach(() => {
    jest.clearAllMocks();

    useTheme.mockReturnValue({
      isDark: false,
      toggleTheme: mockToggleTheme,
    });

    useLanguage.mockReturnValue({ t: mockT });

    useNavigate.mockReturnValue(mockNavigate);
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
  };

  // -----------------------------

  it("renders all form fields and buttons", () => {
    setup();

    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByLabelText(/emailAddress/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0);

    expect(screen.getByRole("button", { name: /signUpBtn/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continueGoogle/i })).toBeInTheDocument();
  });

  // -----------------------------

  it("validates email format", async () => {
    setup();

    const emailInput = screen.getByLabelText(/emailAddress/i);

    await userEvent.type(emailInput, "invalid-email");
    expect(screen.getByText(/validEmailAddressError/i)).toBeInTheDocument();

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "test@example.com");

    expect(screen.queryByText(/validEmailAddressError/i)).not.toBeInTheDocument();
  });

  // -----------------------------

  it("validates password length", async () => {
    setup();

    const passwordInput = screen.getAllByLabelText(/password/i)[0];

    await userEvent.type(passwordInput, "123");
    expect(screen.getByText(/passwordMinLengthError/i)).toBeInTheDocument();

    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "123456");

    expect(screen.queryByText(/passwordMinLengthError/i)).not.toBeInTheDocument();
  });

  // -----------------------------

  it("validates password match", async () => {
    setup();

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");

    await userEvent.type(passwordInputs[0], "password123");
    await userEvent.type(passwordInputs[1], "different");

    expect(screen.getByText(/passwordsNoMatchError/i)).toBeInTheDocument();

    await userEvent.clear(passwordInputs[1]);
    await userEvent.type(passwordInputs[1], "password123");

    expect(screen.queryByText(/passwordsNoMatchError/i)).not.toBeInTheDocument();
  });

  // -----------------------------

  it("handles successful signup", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "123" } }),
    });

    setup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/fullName/i), "John Doe");
    await user.type(screen.getByLabelText(/emailAddress/i), "test@example.com");

    const passwords = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwords[0], "password123");
    await user.type(passwords[1], "password123");

    await user.click(screen.getByRole("button", { name: /signUpBtn/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(localStorage.getItem("ricevision_tutorial_pages")).toBe("{}");

    expect(mockNavigate).toHaveBeenCalledWith("/field-setup", {
      state: { fromSignup: true },
    });
  });

  // -----------------------------

  it("shows error alert on failed signup", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "User already exists" }),
    });

    setup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/fullName/i), "John Doe");
    await user.type(screen.getByLabelText(/emailAddress/i), "test@example.com");

    const passwords = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwords[0], "password123");
    await user.type(passwords[1], "password123");

    await user.click(screen.getByRole("button", { name: /signUpBtn/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("User already exists");
    });
  });

  // -----------------------------

  it("triggers Google OAuth signup", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({ error: null });

    setup();

    await userEvent.click(screen.getByRole("button", { name: /continueGoogle/i }));

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://app.ricevisionlanka.com/dashboard",
      },
    });

    expect(localStorage.getItem("ricevision_tutorial_pages")).toBe("{}");
  });

  // -----------------------------

  it("toggles theme", async () => {
    setup();

    const buttons = screen.getAllByRole("button");
    const themeBtn = buttons[0];

    await userEvent.click(themeBtn);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});