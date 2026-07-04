'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId;

  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`attempt_${attemptId}`);
    if (stored) {
      setTestData(JSON.parse(stored));
    }
  }, [attemptId]);

  function selectAnswer(questionId, answer) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([question_id, selected_answer]) => ({
        question_id: Number(question_id),
        selected_answer
      }));

      const result = await api.submitTest({ attempt_id: Number(attemptId), answers: answerList });
      sessionStorage.setItem(`result_${attemptId}`, JSON.stringify(result));
      router.push(`/results/${attemptId}`);
    } catch (err) {
      alert(err.message);
      setSubmitting(false);
    }
  }

  if (!testData) return <div className="p-8">Loading test...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Test in Progress</h1>
      <p className="text-gray-600 mb-6">
        {testData.question_count} questions • {testData.coin_spent} coins spent
      </p>

      {testData.questions.map((q, index) => (
        <div key={q.id} className="mb-6 p-4 border rounded">
          <p className="font-semibold mb-3">{index + 1}. {q.question_text}</p>
          <div className="flex flex-col gap-2">
            {q.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${q.id}`}
                  checked={answers[q.id] === option}
                  onChange={() => selectAnswer(q.id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-3 bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Test'}
      </button>
    </div>
  );
}