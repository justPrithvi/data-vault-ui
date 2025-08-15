'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../lib/axios';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);
    try {
      await api.post('/auth/confirm', { email, code });

      setSuccess('Account confirmed! You can now log in.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000)
      // Redirect to login
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Confirm your account</h2>
        <form className="space-y-5" onSubmit={handleConfirm}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-600">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Enter verification code"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
}
