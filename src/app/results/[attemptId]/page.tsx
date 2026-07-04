'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId;
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${attemptId}`);
    if (stored) setResult(JSON.parse(stored));
  }, [attemptId]);

  if (!result) return <div className="p-8">Loading results...</div>;

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