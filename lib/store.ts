'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AdminAuthState {
  user: AdminUser | null;
  accessToken: string | null;
  /** Renews `accessToken` without re-prompting for credentials. */
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  /**
   * Set when the session ended on its own rather than by the admin clicking
   * sign out, so the login page can explain the bounce instead of appearing for
   * no reason mid-task.
   */
  sessionExpired: boolean;
  login: (user: AdminUser, token: string, refreshToken: string) => void;
  /** Post-renewal token swap — keeps the session, replaces the credentials. */
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: (options?: { expired?: boolean }) => void;
  clearSessionExpired: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      sessionExpired: false,
      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, sessionExpired: false }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: (options) => {
        // Burn the refresh token server-side so signing out actually ends the
        // session rather than leaving a 30-day credential valid in the DB.
        // Deliberately a bare fetch — importing api.ts here would create a
        // runtime cycle, since api.ts imports this store.
        const token = get().refreshToken;
        if (token) {
          const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005/api';
          void fetch(`${base}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token }),
          }).catch(() => {
            // Signing out locally must succeed even if the API is unreachable.
          });
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpired: options?.expired ?? false,
        });
      },
      clearSessionExpired: () => set({ sessionExpired: false }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'admin-auth-storage',
      // `hasHydrated` and `sessionExpired` describe this page load, not the
      // session: persisting the first fights the rehydrate callback that owns
      // it, and the second would re-show an expiry notice on a later visit.
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Keeps two open dashboard tabs on the same session.
 *
 * Each tab holds its own copy of this store in memory, so when one renews the
 * access token the other keeps using the old refresh token. Rotation only
 * tolerates that for a few seconds, so the stale tab's next renewal is refused
 * and it signs itself out — which looks exactly like the session dying early.
 * Re-reading the persisted state whenever another tab writes it keeps both tabs
 * on the current credentials, and makes signing out in one tab apply to all.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== 'admin-auth-storage') return;
    void useAdminAuth.persist.rehydrate();
  });
}
