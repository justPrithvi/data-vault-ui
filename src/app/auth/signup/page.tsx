'use client';

import { useState } from 'react';
import api from '../../lib/axios';
import { Eye, EyeOff } from 'lucide-react'; // make sure lucide-react is installed
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userName, setUserName] = useState('');
  const router = useRouter();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/signup', {userName, email, password });
      setSuccess('Signup successful! Redirecting to login...');
      
      // Store token and user data
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        router.push('/screens/dashboard');
      }, 1500);
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl">📦</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DataVault
              </h1>
              <p className="text-slate-600 text-sm">Secure Document Hub</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 space-y-6 rounded-3xl shadow-2xl border-2 border-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-slate-600 mt-2 text-sm">Join us and start managing your documents</p>
          </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
              👤 Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
              📧 Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
              🔒 Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white pr-12"
              placeholder="••••••••"
            />
            <span
              className="absolute right-4 top-[42px] cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">
              🔐 Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white pr-12"
              placeholder="••••••••"
            />
            <span
              className="absolute right-4 top-[42px] cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <p className="text-green-600 text-sm font-medium flex items-center gap-2">
                <span>✓</span>
                {success}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-center text-slate-600">
            Already have an account?{' '}
            <a href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
              Sign in here
            </a>
          </p>
        </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2025 DataVault. All rights reserved.
        </p>
      </div>
    </div>
  );
}
