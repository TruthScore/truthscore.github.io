// Full-page navigation to Stripe or the OAuth provider. Its own module so tests can mock it.
export function redirectTo(url: string): void {
  window.location.assign(url);
}
