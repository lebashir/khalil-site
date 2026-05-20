// Single source for the first-visit gate cookie. Set when the visitor
// completes /intro (or clicks ENTER on the placeholder until step 5
// ships the tunnel). Read server-side by app/page.tsx to decide whether
// to redirect to /intro.
//
// 1-day max-age — short enough that returning visitors get the intro
// back on the next day, long enough that casual refreshes don't punish
// the same visit.

export const INTRO_COOKIE_NAME = 'khalil_intro_seen';

// 60 * 60 * 24
export const INTRO_COOKIE_MAX_AGE_SECONDS = 86_400;

// Browser-side setter. Used by the intro page when the user signals
// completion. Path '/' so the same cookie is visible to / and any
// other route that checks it.
export const setIntroSeenCookie = (): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${INTRO_COOKIE_NAME}=1; max-age=${INTRO_COOKIE_MAX_AGE_SECONDS}; path=/; samesite=lax`;
};
