"use client";

// Auth guard is temporarily disabled — all users land directly on the home page.
// Onboarding page is preserved at /onboarding and can be re-enabled by restoring
// the redirect logic here.

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
