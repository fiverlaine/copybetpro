export type SessionUser = any;

export function getSessionUser(): SessionUser | null {
  const raw = localStorage.getItem('session_user');
  return raw ? JSON.parse(raw) : null;
}

export function setSessionUser(user: SessionUser): void {
  localStorage.setItem('session_user', JSON.stringify(user));
  window.dispatchEvent(new Event('session_user_changed'));
}

export function clearSessionUser(): void {
  localStorage.removeItem('session_user');
  window.dispatchEvent(new Event('session_user_changed'));
}


