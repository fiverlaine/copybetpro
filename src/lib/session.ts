export type SessionUser = any;

export function getSessionUser(): SessionUser | null {
  const raw = sessionStorage.getItem('session_user');
  return raw ? JSON.parse(raw) : null;
}

export function setSessionUser(user: SessionUser): void {
  sessionStorage.setItem('session_user', JSON.stringify(user));
  window.dispatchEvent(new Event('session_user_changed'));
}

export function clearSessionUser(): void {
  sessionStorage.removeItem('session_user');
  window.dispatchEvent(new Event('session_user_changed'));
}


