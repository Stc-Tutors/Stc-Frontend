'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${attemptId}`);
    if (stored) {
      setResult(JSON.parse(stored));
      setLoading(false);
      return;
    }

    api.getAttemptDetail(attemptId)
      .then((detail) => {
        setResult({
          score: detail.score,
          total_marks: detail.total_marks,
          percentage: Math.round((detail.score / detail.total_marks) * 100),
          results: detail.questions.map((q) => ({
            question_id: q.question_id,
            question_text: q.question_text,
            selected_answer: q.selected_answer,
            correct_answer: q.correct_answer,
            is_correct: q.is_correct,
            explanation: q.explanation
          }))
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="p-8">Loading results...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!result) return <div className="p-8">No results found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Test Results</h1>
      <p className="text-xl mb-6">
        Score: <span className="font-bold">{result.score}/{result.total_marks}</span> ({result.percentage}%)
      </p>

      {result.results.map((r, index) => (
        <div
          key={r.question_id}
          className={`mb-4 p-4 border rounded ${r.is_correct ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}
        >
          <p className="font-semibold mb-1">{index + 1}. {r.question_text}</p>
          <p>Your answer: {r.selected_answer ?? 'No answer given'}</p>
          <p>Correct answer: {r.correct_answer}</p>
          {r.explanation && <p className="text-sm text-gray-600 mt-1">Explanation: {r.explanation}</p>}
        </div>
      ))}
    </div>
  );
}