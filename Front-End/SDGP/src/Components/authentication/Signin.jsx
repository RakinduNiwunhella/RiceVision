import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from "react-router-dom";
import { FaSun, FaMoon, FaLock } from 'react-icons/fa'; 

export default function LoginPage() {
    const [theme, setTheme] = useState('dark');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const root = window.document.documentElement;
        theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    }, [theme]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error){
            alert(error.message);
        } else {
            navigate("/app/dashboard");
        }
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

            {/* Left Side: Form Container */}
            <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 md:px-24 lg:px-32">
                <div className="w-full max-w-md mx-auto">
                    
                    {/* Logo */}
                    <div className="flex items-center mb-10 space-x-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/40">
                            <FaLock size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight italic">TECHBASE</span>
                    </div>

                    <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10">Please enter your details to access your dashboard.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Email Address</label>
                            <input 
                                type="email" 
                                required
                                placeholder="name@company.com"
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold">Password</label>
                                <a href="#" className="text-sm text-indigo-500 hover:text-indigo-400 font-medium">Forgot?</a>
                            </div>
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pb-2">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer" />
                            <label htmlFor="remember" className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer">Keep me logged in</label>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.97]"
                        >
                            Sign In to Account
                        </button>
                    </form>

                    {/* MOVED: Sign up link is now inside the max-w-md container */}
                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-500 hover:text-indigo-400 font-bold underline-offset-4 hover:underline">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Decorative Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img 
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070" 
                    alt="Abstract Tech" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[2px]"></div>
            </div>
        </div>
    );
}