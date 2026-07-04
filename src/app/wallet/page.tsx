'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth';

export default function WalletPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push('/exams/login');
      return;
    }
    setSession(s);

    Promise.all([
      api.getWallet(s.user.id),
      api.getAttempts(s.user.id)
    ])
      .then(([walletData, attemptsData]) => {
        setWallet(walletData);
        setAttempts(attemptsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">My Wallet</h1>

      <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Current Balance</p>
          <p className="text-3xl font-bold text-blue-700">{wallet.coin_balance} coins</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => alert('Coin purchasing is coming soon!')}
        >
          Buy More Coins
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Test History</h2>

      {attempts.length === 0 && (
        <p className="text-gray-500">You haven't taken any tests yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {attempts.map((attempt) => (
          <div key={attempt.attempt_id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold capitalize">
                {attempt.scope_type.replace('_', ' ')} test
              </p>
              <p className="text-sm text-gray-500">
                {new Date(attempt.started_at).toLocaleString()} • {attempt.coin_cost} coins spent
              </p>
            </div>
            <div className="text-right">
              {attempt.status === 'submitted' ? (
                <>
                  <p className="font-bold">{attempt.score}/{attempt.total_marks}</p>
                  <a href={`/results/${attempt.attempt_id}`} className="text-sm text-blue-600 underline">
                    View details
                  </a>
                </>
              ) : (
                <span className="text-sm text-orange-600">In progress</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}