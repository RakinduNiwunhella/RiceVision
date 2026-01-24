import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from "react-router-dom";
import { FaSun, FaMoon, FaUserPlus } from 'react-icons/fa'; 

export default function SignupPage() {
    const [theme, setTheme] = useState('dark');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation States
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLengthError, setPasswordLengthError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const root = window.document.documentElement;
        theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    }, [theme]);

    // Validation Logic
    const validateEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !regex.test(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const validatePasswords = (pass, confirm) => {
        if (pass.length > 0 && pass.length < 6) {
            setPasswordLengthError('Password must be at least 6 characters');
        } else {
            setPasswordLengthError('');
        }

        if (confirm && pass !== confirm) {
            setPasswordError('Passwords do not match');
        } else {
            setPasswordError('');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Final check before calling Supabase
        if (emailError || passwordError || passwordLengthError) return;
        
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName } 
            }
        });

        if (error) {
            alert(error.message);
        } else {
            alert('Signup successful! Please check your email for a confirmation link.');
            navigate("/"); 
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen transition-colors duration-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            
            {/* Theme Toggle */}
            <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="fixed top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:rotate-12 transition-all shadow-md z-50"
            >
                {theme === 'dark' ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-indigo-600 text-xl" />}
            </button>

            {/* Left Side: Form */}
            <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 md:px-24 lg:px-32">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center mb-8 space-x-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/40">
                            <FaUserPlus size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight italic">TECHBASE</span>
                    </div>

                    <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Join us to start managing your data today.</p>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Full Name</label>
                            <input 
                                type="text" required placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        {/* Email with validation */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Email Address</label>
                            <input 
                                type="email" required placeholder="name@company.com"
                                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/50 outline-none transition-all focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'}`}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    validateEmail(e.target.value);
                                }}
                            />
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>

                        {/* Passwords with validation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold mb-1 block">Password</label>
                                <input 
                                    type="password" required placeholder="••••••••"
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/50 outline-none transition-all focus:ring-2 ${passwordLengthError ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'}`}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        validatePasswords(e.target.value, confirmPassword);
                                    }}
                                />
                                {passwordLengthError && <p className="text-xs text-red-500 mt-1">{passwordLengthError}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1 block">Confirm</label>
                                <input 
                                    type="password" required placeholder="••••••••"
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900/50 outline-none transition-all focus:ring-2 ${passwordError ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'}`}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        validatePasswords(password, e.target.value);
                                    }}
                                />
                                {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.97] disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Free Account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/" className="text-indigo-500 hover:text-indigo-400 font-bold underline-offset-4 hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Clear Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img 
                    src="/paddy_signup.png" 
                    alt="Paddy Field" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>
        </div>
    );
}