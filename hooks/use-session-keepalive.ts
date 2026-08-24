'use client';

import { useEffect } from 'react';
import { renewSession } from '@/lib/api';
import { useAdminAuth } from '@/lib/store';

/** Renew this far ahead of expiry, so no request ever carries a dead token. */
const RENEW_SKEW_MS = 5 * 60_000;
/** How long to wait before trying again when the API couldn't be reached. */
const RETRY_MS = 30_000;

/** Milliseconds until this token expires, or null if it can't be read. */
function msUntilExpiry(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    // JWTs are base64url; atob needs plain base64.
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json).exp;
    return typeof exp === 'number' ? exp * 1000 - Date.now() : null;
  } catch {
    return null;
  }
}

/**
 * Keeps the dashboard session alive ahead of expiry instead of waiting for a
 * request to fail.
 *
 * Renewal used to happen only in reaction to a 401, which works but means the
 * hour mark always lands on a real request — and if that moment coincides with
 * the API restarting, or a laptop waking with the network not yet up, the admin
 * gets bounced. Refreshing early, on wake, and on reconnect means the token is
 * replaced while nothing is depending on it.
 *
 * A failure to reach the API is deliberately not treated as the end of the
 * session; it just schedules another attempt.
 */
export function useSessionKeepalive() {
  const accessToken = useAdminAuth((s) => s.accessToken);
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const renew = async () => {
      if (cancelled) return;

      const outcome = await renewSession();
      if (cancelled) return;

      if (outcome === 'expired') {
        // The refresh token itself is dead — 30 days idle, or revoked. Nothing
        // to do but hand them back to the login page, which explains why.
        useAdminAuth.getState().logout({ expired: true });
        return;
      }

      // 'renewed' replaces `accessToken` in the store, which re-runs this effect
      // and schedules the next renewal off the new expiry. Only the unreachable
      // case has to arrange its own retry.
      if (outcome === 'unavailable') timer = setTimeout(renew, RETRY_MS);
    };

    const schedule = () => {
      clearTimeout(timer);
      const remaining = msUntilExpiry(accessToken);

      // An unreadable token is not worth guessing about — the reactive 401 path
      // in `send()` still covers it.
      if (remaining === null) return;

      timer = setTimeout(renew, Math.max(0, remaining - RENEW_SKEW_MS));
    };

    // A timer does not run while a laptop is asleep or a tab is discarded, so
    // coming back is its own trigger — otherwise the scheduled renewal fires
    // late, after the token has already expired.
    const onWake = () => {
      const remaining = msUntilExpiry(accessToken);
      if (remaining !== null && remaining <= RENEW_SKEW_MS) void renew();
      else schedule();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') onWake();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onWake);
    window.addEventListener('online', onWake);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onWake);
      window.removeEventListener('online', onWake);
    };
  }, [accessToken, isAuthenticated]);
}
