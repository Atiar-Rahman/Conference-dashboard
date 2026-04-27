export const AUTH_STORAGE_KEY = "conference_admin_auth";

export function readStoredAuth() {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth) {
  if (!auth) {
    clearStoredAuth();
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event("conference_admin_auth_updated"));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("conference_admin_auth_updated"));
}

