const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  signup: (payload) => apiRequest('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  getCountries: () => apiRequest('/api/catalog/countries'),
  getExams: (countryId) => apiRequest(`/api/catalog/exams?country_id=${countryId}`),
  getSubjects: (examId) => apiRequest(`/api/catalog/subjects?exam_id=${examId}`),
  getTopics: (subjectId) => apiRequest(`/api/catalog/topics?subject_id=${subjectId}`),

  startTest: (payload) => apiRequest('/api/tests/start', { method: 'POST', body: JSON.stringify(payload) }),
  submitTest: (payload) => apiRequest('/api/tests/submit', { method: 'POST', body: JSON.stringify(payload) }),

  getWallet: (userId) => apiRequest(`/api/wallet?user_id=${userId}`),
  getAttempts: (userId) => apiRequest(`/api/attempts?user_id=${userId}`),
  getAttemptDetail: (attemptId) => apiRequest(`/api/attempts/${attemptId}`)
};