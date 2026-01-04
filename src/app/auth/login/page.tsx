'use client';

import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from "react";


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter();
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password); // context handles storing user + token
    } catch (err: any) {
      setError(err.message);
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
              Welcome Back!
            </h2>
            <p className="text-slate-600 mt-2 text-sm">Sign in to access your documents</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                📧 Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white"
                placeholder="you@example.com"
              />
            </div>

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

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-slate-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-center text-slate-600">
              Don't have an account?{" "}
              <a href="signup" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
                Sign up here
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
