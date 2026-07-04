'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ExamsPage() {
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.getCountries()
      .then(setCountries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSelectCountry(country) {
    setSelectedCountry(country);
    setSelectedExam(null);
    setSelectedSubject(null);
    setSubjects([]);
    setTopics([]);
    api.getExams(country.id).then(setExams).catch((err) => setError(err.message));
  }

  function handleSelectExam(exam) {
    setSelectedExam(exam);
    setSelectedSubject(null);
    setTopics([]);
    api.getSubjects(exam.id).then(setSubjects).catch((err) => setError(err.message));
  }

  function handleSelectSubject(subject) {
    setSelectedSubject(subject);
    api.getTopics(subject.id).then(setTopics).catch((err) => setError(err.message));
  }

  async function handleStartTest(scopeType, scopeId) {
    setStarting(true);
    try {
      const result = await api.startTest({
        user_id: 1, // temporary — will come from real login later
        scope_type: scopeType,
        scope_id: scopeId
      });
      sessionStorage.setItem(`attempt_${result.attempt_id}`, JSON.stringify(result));
      router.push(`/test/${result.attempt_id}`);
    } catch (err) {
      alert(err.message);
      setStarting(false);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Choose Your Exam</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">1. Select Country</h2>
        <div className="flex gap-2 flex-wrap">
          {countries.map((country) => (
            <button
              key={country.id}
              onClick={() => handleSelectCountry(country)}
              className={`px-4 py-2 rounded border ${selectedCountry?.id === country.id ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              {country.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCountry && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">2. Select Exam</h2>
          <div className="flex gap-2 flex-wrap">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => handleSelectExam(exam)}
                className={`px-4 py-2 rounded border ${selectedExam?.id === exam.id ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                {exam.name}
              </button>
            ))}
            {exams.length === 0 && <p className="text-gray-500">No exams yet for this country.</p>}
          </div>
        </div>
      )}

      {selectedExam && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">3. Select Subject</h2>
          <div className="flex gap-2 flex-wrap">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSelectSubject(subject)}
                className={`px-4 py-2 rounded border ${selectedSubject?.id === subject.id ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                {subject.name}
              </button>
            ))}
            {subjects.length === 0 && <p className="text-gray-500">No subjects yet for this exam.</p>}
          </div>
          {selectedExam.supports_full_exam && (
            <p className="text-sm text-green-700 mt-2">
              This exam also supports a full combined test ({selectedExam.subjects_per_full_exam} subjects, {selectedExam.full_exam_coin_cost} coins).
            </p>
          )}
        </div>
      )}

      {selectedSubject && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">4. Select Topic (or take the full subject)</h2>
          <div className="flex gap-2 flex-wrap">
            {topics.map((topic) => (
              <button
                key={topic.id}
                disabled={starting}
                onClick={() => handleStartTest('topic', topic.id)}
                className="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
              >
                {topic.name} (2 coins)
              </button>
            ))}
            {topics.length === 0 && <p className="text-gray-500">No topics yet for this subject.</p>}
          </div>

          <button
            disabled={starting}
            onClick={() => handleStartTest('subject', selectedSubject.id)}
            className="mt-3 px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            Take Full {selectedSubject.name} Subject Test (5 coins)
          </button>
        </div>
      )}
    </div>
  );
}