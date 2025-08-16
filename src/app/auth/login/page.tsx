'use client';

import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
    // <div className="flex min-h-screen items-center justify-center bg-gray-300">
    //   <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
    //     <h2 className="text-2xl font-bold text-center text-gray-800">
    //       Sign in to your account
    //     </h2>
        
    //     <form className="space-y-5" onSubmit={handleSubmit}>
    //       <div>
    //         <label htmlFor="email" className="block text-sm font-medium text-gray-600">
    //           Email address
    //         </label>
    //         <input
    //           id="email"
    //           name="email"
    //           type="email"
    //           required
    //           onChange={(e) => setEmail(e.target.value)}
    //           className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
    //           placeholder="you@example.com"
    //         />
    //       </div>

    //       <div className="relative">
    //         <label htmlFor="password" className="block text-sm font-medium text-gray-600">
    //           Password
    //         </label>
    //         <input
    //           id="password"
    //           name="password"
    //           type={showPassword ? 'text' : 'password'}
    //           required
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 pr-10"
    //           placeholder="••••••••"
    //         />
    //         <span
    //           className="absolute right-3 top-[38px] cursor-pointer"
    //           onClick={() => setShowPassword(!showPassword)}
    //         >
    //           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    //         </span>
    //       </div>

    //       <div className="flex items-center justify-between">
    //         <label className="flex items-center">
    //           <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
    //           <span className="ml-2 text-sm text-gray-600">Remember me</span>
    //         </label>
    //         <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
    //       </div>

    //       {error && <p className="text-red-500 text-sm">{error}</p>}

    //       <button
    //         type="submit"
    //         className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //       >
    //         {
    //           loading ? 'Loggin in...': 'Log in'
    //         }
    //       </button>
    //     </form>

    //     <p className="text-sm text-center text-gray-600">
    //       Don’t have an account?{" "}
    //       <a href="signup" className="text-blue-600 hover:underline">
    //         Sign up
    //       </a>
    //     </p>
    //   </div>
    // </div>

    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-green-400 animate-gradient-x">
      <div className="px-8 py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Hello subhashree, <span className="text-pink-600">I love you 💖</span>
        </h1>
      </div>
    </div>
  );
}
