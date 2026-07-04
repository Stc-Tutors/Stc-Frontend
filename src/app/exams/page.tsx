'use client';

import { getSession, clearSession } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const STEPS = ['Country', 'Exam', 'Subject', 'Topic'];

export default function ExamsPage() {
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [comboSubjectIds, setComboSubjectIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push('/exams/login');
      return;
    }
    setSession(s);
  }, []);

  useEffect(() => {
    api.getCountries()
      .then(setCountries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedExam?.supports_full_exam && subjects.length > 0) {
      const compulsoryIds = subjects.filter((s) => s.is_compulsory).map((s) => s.id);
      setComboSubjectIds(compulsoryIds);
    }
  }, [subjects, selectedExam]);

  function handleSelectCountry(country) {
    setSelectedCountry(country);
    setSelectedExam(null);
    setSelectedSubject(null);
    setSubjects([]);
    setTopics([]);
    setComboSubjectIds([]);
    api.getExams(country.id).then(setExams).catch((err) => setError(err.message));
  }

  function handleSelectExam(exam) {
    setSelectedExam(exam);
    setSelectedSubject(null);
    setTopics([]);
    setComboSubjectIds([]);
    api.getSubjects(exam.id).then(setSubjects).catch((err) => setError(err.message));
  }

  function handleSelectSubject(subject) {
    setSelectedSubject(subject);
    api.getTopics(subject.id).then(setTopics).catch((err) => setError(err.message));
  }

  function toggleComboSubject(subject) {
    if (subject.is_compulsory) return; // locked, can't toggle off
    setComboSubjectIds((prev) => {
      if (prev.includes(subject.id)) {
        return prev.filter((id) => id !== subject.id);
      }
      const required = selectedExam.subjects_per_full_exam;
      if (prev.length >= required) {
        return prev;
      }
      return [...prev, subject.id];
    });
  }

  async function handleStartTest(scopeType, scopeId, subjectIds = null) {
    setStarting(true);
    try {
      const payload = { user_id: session.user.id, scope_type: scopeType, scope_id: scopeId };
      if (subjectIds) payload.subject_ids = subjectIds;

      const result = await api.startTest(payload);
      sessionStorage.setItem(`attempt_${result.attempt_id}`, JSON.stringify(result));
      router.push(`/test/${result.attempt_id}`);
    } catch (err) {
      alert(err.message);
      setStarting(false);
    }
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  const currentStep = selectedSubject ? 3 : selectedExam ? 2 : selectedCountry ? 1 : 0;
  const requiredCount = selectedExam?.subjects_per_full_exam ?? 0;
  const comboReady = comboSubjectIds.length === requiredCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">STC Exams</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full">
              {session.user.coin_balance ?? 0} coins
            </span>
            <span className="text-sm text-gray-500 hidden sm:inline">{session.user.name}</span>
            <button
              onClick={() => { clearSession(); router.push('/exams/login'); }}
              className="text-sm text-gray-400 hover:text-red-600 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${i < currentStep ? 'bg-blue-600 text-white' :
                      i === currentStep ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                      'bg-gray-200 text-gray-400'}`}
                >
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 ${i <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Country */}
        <Section title="Select your country" visible>
          <ChipGrid>
            {countries.map((country) => (
              <Chip
                key={country.id}
                active={selectedCountry?.id === country.id}
                onClick={() => handleSelectCountry(country)}
              >
                {country.name}
              </Chip>
            ))}
          </ChipGrid>
        </Section>

        {/* Step 2: Exam */}
        <Section title="Select an exam" visible={!!selectedCountry}>
          <ChipGrid>
            {exams.map((exam) => (
              <Chip
                key={exam.id}
                active={selectedExam?.id === exam.id}
                onClick={() => handleSelectExam(exam)}
              >
                {exam.name}
              </Chip>
            ))}
          </ChipGrid>
          {selectedCountry && exams.length === 0 && (
            <EmptyNote>No exams available yet for this country.</EmptyNote>
          )}
        </Section>

        {/* Full-exam combo card */}
        {selectedExam?.supports_full_exam && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Full {selectedExam.name} Mock Exam</h3>
                <p className="text-sm text-gray-500">
                  Simulates the real exam — {requiredCount} subjects in one sitting
                </p>
              </div>
              <span className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                {selectedExam.full_exam_coin_cost} coins
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              {subjects.map((subject) => {
                const isSelected = comboSubjectIds.includes(subject.id);
                const isLocked = subject.is_compulsory;
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleComboSubject(subject)}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition
                      ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}
                      ${isLocked ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                  >
                    {subject.name}
                    {isLocked && <span className="ml-1.5 text-xs opacity-80">(required)</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {comboSubjectIds.length} of {requiredCount} subjects selected
              </p>
              <button
                disabled={!comboReady || starting}
                onClick={() => handleStartTest('full_exam', selectedExam.id, comboSubjectIds)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starting ? 'Starting...' : `Start Full Mock`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: single subject */}
        <Section title="Or practice a single subject" visible={!!selectedExam}>
          <ChipGrid>
            {subjects.map((subject) => (
              <Chip
                key={subject.id}
                active={selectedSubject?.id === subject.id}
                onClick={() => handleSelectSubject(subject)}
              >
                {subject.name}
              </Chip>
            ))}
          </ChipGrid>
          {selectedExam && subjects.length === 0 && (
            <EmptyNote>No subjects available yet for this exam.</EmptyNote>
          )}
        </Section>

        {/* Step 4: topic or full subject */}
        <Section title="Pick a topic, or take the whole subject" visible={!!selectedSubject}>
          <ChipGrid>
            {topics.map((topic) => (
              <button
                key={topic.id}
                disabled={starting}
                onClick={() => handleStartTest('topic', topic.id)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-700 transition disabled:opacity-50"
              >
                {topic.name}
                <span className="ml-1.5 text-xs text-gray-400">2 coins</span>
              </button>
            ))}
          </ChipGrid>
          {selectedSubject && topics.length === 0 && (
            <EmptyNote>No topics available yet for this subject.</EmptyNote>
          )}

          {selectedSubject && (
            <button
              disabled={starting}
              onClick={() => handleStartTest('subject', selectedSubject.id)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm shadow-sm hover:bg-green-700 transition disabled:opacity-50"
            >
              {starting ? 'Starting...' : `Take Full ${selectedSubject.name} Test — 5 coins`}
            </button>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, visible, children }) {
  if (!visible) return null;
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function ChipGrid({ children }) {
  return <div className="flex gap-2 flex-wrap">{children}</div>;
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
        ${active
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}`}
    >
      {children}
    </button>
  );
}

function EmptyNote({ children }) {
  return (
    <p className="text-sm text-gray-400 italic mt-1">{children}</p>
  );
}