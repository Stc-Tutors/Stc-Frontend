export function saveSession(user, token) {
  localStorage.setItem('token', token);
  localStorage.setItem('exam_user', JSON.stringify(user));
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('exam_user');
  const token = localStorage.getItem('token');
  if (!user || !token) return null;
  return { user: JSON.parse(user), token };
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('exam_user');
}