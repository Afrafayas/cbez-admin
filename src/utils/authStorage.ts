/**
 * Central Authentication & Session Storage Management for MLX Admin Portal
 * Securely stores: token, role, id, name, number, cbez_admin_token, cbez_admin_user
 * Primary storage: sessionStorage (cleared when browser session/tab closes)
 */

export const ADMIN_AUTH_KEYS = {
  TOKEN: 'token',
  ROLE: 'role',
  ID: 'id',
  NAME: 'name',
  NUMBER: 'number',
  CBEZ_TOKEN: 'cbez_admin_token',
  CBEZ_USER: 'cbez_admin_user',
  ACTIVE_TAB: 'cbez_admin_active_tab',
} as const;

const isBrowser = typeof window !== 'undefined';

export function saveAdminAuthSession(token: string, user: any): void {
  if (!isBrowser) return;
  try {
    const role = user?.role || 'admin';
    const id = user?.id ? String(user.id) : '';
    const name = user?.name || '';
    const number = user?.phone || '';
    const userStr = JSON.stringify(user);

    // Save to sessionStorage (Primary)
    sessionStorage.setItem(ADMIN_AUTH_KEYS.TOKEN, token);
    sessionStorage.setItem(ADMIN_AUTH_KEYS.ROLE, role);
    sessionStorage.setItem(ADMIN_AUTH_KEYS.ID, id);
    sessionStorage.setItem(ADMIN_AUTH_KEYS.NAME, name);
    sessionStorage.setItem(ADMIN_AUTH_KEYS.NUMBER, number);
    sessionStorage.setItem(ADMIN_AUTH_KEYS.CBEZ_TOKEN, token);
    sessionStorage.setItem(ADMIN_AUTH_KEYS.CBEZ_USER, userStr);

    // Sync to localStorage (Fallback backup)
    localStorage.setItem(ADMIN_AUTH_KEYS.TOKEN, token);
    localStorage.setItem(ADMIN_AUTH_KEYS.ROLE, role);
    localStorage.setItem(ADMIN_AUTH_KEYS.ID, id);
    localStorage.setItem(ADMIN_AUTH_KEYS.NAME, name);
    localStorage.setItem(ADMIN_AUTH_KEYS.NUMBER, number);
    localStorage.setItem(ADMIN_AUTH_KEYS.CBEZ_TOKEN, token);
    localStorage.setItem(ADMIN_AUTH_KEYS.CBEZ_USER, userStr);
  } catch (err) {
    console.warn('Failed to save admin auth session:', err);
  }
}

export function getAdminToken(): string | null {
  if (!isBrowser) return null;
  return (
    sessionStorage.getItem(ADMIN_AUTH_KEYS.TOKEN) ||
    sessionStorage.getItem(ADMIN_AUTH_KEYS.CBEZ_TOKEN) ||
    localStorage.getItem(ADMIN_AUTH_KEYS.TOKEN) ||
    localStorage.getItem(ADMIN_AUTH_KEYS.CBEZ_TOKEN)
  );
}

export function getAdminUser(): any | null {
  if (!isBrowser) return null;
  try {
    const raw =
      sessionStorage.getItem(ADMIN_AUTH_KEYS.CBEZ_USER) ||
      localStorage.getItem(ADMIN_AUTH_KEYS.CBEZ_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAdminAuthSession(): void {
  if (!isBrowser) return;
  try {
    const keys = [
      ADMIN_AUTH_KEYS.TOKEN,
      ADMIN_AUTH_KEYS.ROLE,
      ADMIN_AUTH_KEYS.ID,
      ADMIN_AUTH_KEYS.NAME,
      ADMIN_AUTH_KEYS.NUMBER,
      ADMIN_AUTH_KEYS.CBEZ_TOKEN,
      ADMIN_AUTH_KEYS.CBEZ_USER,
      ADMIN_AUTH_KEYS.ACTIVE_TAB,
      'cbez_admin_single_view',
    ];
    keys.forEach((k) => {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    });
  } catch (err) {
    console.warn('Failed to clear admin auth session:', err);
  }
}
