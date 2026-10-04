import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PLANS, DEDICATED_OPENS, dedicatedHasOpened } from "@/lib/plans";
import { SUPPORT_EMAIL } from "@/lib/config";
import { authorizeUrl, clearSession, markSignInStarted, consumeAuthRedirect, hasSession, signOut, type Provider } from "@/lib/auth";
import { fetchProfile, isPaid, openPortal, startCheckout, type PlanId, type Profile } from "@/lib/engine";
import { pollForPaidPlan, readCheckoutReturn } from "@/lib/checkout-return";
import { redirectTo } from "@/lib/redirect";

// /account/plan is where the extension's locked cards and daily-limit message send people
// (PLAN_URL in truthscore-chrome-ext-v2 shared/ui/copy.js), and where Stripe Checkout and the
// customer portal return to (engine E#37). Billing lives in the engine; this page signs the
// user in, shows their plan, and asks the engine for a Stripe URL.
//
// Until billing is switched on the engine answers 503 BILLING_DISABLED, and the page keeps
// the "Dedicated opens 7 October" copy (ship design decision 4).

const PLAN_NAMES: Record<PlanId, string> = { free: "Free", dedicated: "Dedicated", expert: "Expert" };
const BILLING_CLOSED_KEY = "truthscore_billing_closed";

const readClosed = () => {
  try {
    return window.sessionStorage.getItem(BILLING_CLOSED_KEY) === "1";
  } catch {
    return false;
  }
};
const rememberClosed = () => {
  try {
    window.sessionStorage.setItem(BILLING_CLOSED_KEY, "1");
  } catch {
    // ignore
  }
};

type Status =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "signed-in"; profile: Profile }
  | { kind: "error"; message: string };

type ReturnNote = "confirming" | "confirmed" | "pending" | "cancelled" | "success-signed-out" | null;

const Plan = () => {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [billingClosed, setBillingClosed] = useState(readClosed);
  const [busy, setBusy] = useState<"checkout" | "portal" | "recheck" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [returnNote, setReturnNote] = useState<ReturnNote>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    const { hash, search, pathname } = window.location;
    const auth = consumeAuthRedirect(hash, search);
    const checkoutReturn = readCheckoutReturn(search);
    // Tokens and one-shot flags out of the address bar (and out of history and screenshots).
    if (hash || checkoutReturn || auth) window.history.replaceState(null, "", pathname);
    if (auth?.kind === "error") setNotice(`Sign-in didn't complete: ${auth.message}`);

    (async () => {
      if (!hasSession()) {
        setStatus({ kind: "signed-out" });
        if (checkoutReturn === "success") setReturnNote("success-signed-out");
        if (checkoutReturn === "cancel") setReturnNote("cancelled");
        return;
      }
      const r = await fetchProfile();
      if (cancelled.current) return;
      if (r.ok === false) {
        if (r.error.status === 401) {
          clearSession();
          setStatus({ kind: "signed-out" });
          setNotice("Your session has ended. Sign in again to see your plan.");
        } else {
          setStatus({ kind: "error", message: r.error.message });
        }
        return;
      }
      setStatus({ kind: "signed-in", profile: r.data });
      if (checkoutReturn === "cancel") setReturnNote("cancelled");
      if (checkoutReturn === "success") {
        if (isPaid(r.data.plan)) {
          setReturnNote("confirmed");
          return;
        }
        setReturnNote("confirming");
        const polled = await pollForPaidPlan(fetchProfile, { isCancelled: () => cancelled.current });
        if (cancelled.current) return;
        if (polled.profile) setStatus({ kind: "signed-in", profile: polled.profile });
        setReturnNote(polled.paid ? "confirmed" : "pending");
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, []);

  const signIn = (provider: Provider) => {
    markSignInStarted();
    redirectTo(authorizeUrl(provider, `${window.location.origin}/account/plan`));
  };

  const doSignOut = async () => {
    await signOut();
    setStatus({ kind: "signed-out" });
    setReturnNote(null);
    setNotice(null);
  };

  const upgrade = useCallback(async () => {
    setBusy("checkout");
    setNotice(null);
    const r = await startCheckout("dedicated");
    if (r.ok === true) {
      redirectTo(r.data.url);
      return; // leave the button busy while the browser navigates away
    }
    setBusy(null);
    const { code, status: httpStatus, message } = r.error;
    if (code === "BILLING_DISABLED") {
      rememberClosed();
      setBillingClosed(true);
      setNotice(`Dedicated isn't on sale yet. It opens ${DEDICATED_OPENS}.`);
    } else if (code === "ALREADY_SUBSCRIBED") {
      const p = await fetchProfile();
      if (p.ok) setStatus({ kind: "signed-in", profile: p.data });
      setNotice("Your account already has a paid plan. Use Manage subscription to change it.");
    } else if (httpStatus === 401) {
      clearSession();
      setStatus({ kind: "signed-out" });
      setNotice("Your session has ended. Sign in again to upgrade.");
    } else {
      setNotice(`Couldn't start checkout. ${message}`);
    }
  }, []);

  const manage = useCallback(async () => {
    setBusy("portal");
    setNotice(null);
    const r = await openPortal();
    if (r.ok === true) {
      redirectTo(r.data.url);
      return;
    }
    setBusy(null);
    const { code, status: httpStatus, message } = r.error;
    if (code === "BILLING_DISABLED") {
      setNotice(`Subscription management isn't available yet. Email ${SUPPORT_EMAIL} and we'll help.`);
    } else if (code === "NO_BILLING_ACCOUNT") {
      setNotice(`This plan isn't billed through Stripe, so there's no subscription to manage here. Email ${SUPPORT_EMAIL} with any questions.`);
    } else if (httpStatus === 401) {
      clearSession();
      setStatus({ kind: "signed-out" });
      setNotice("Your session has ended. Sign in again to manage your subscription.");
    } else {
      setNotice(`Couldn't open subscription management. ${message}`);
    }
  }, []);

  const recheck = async () => {
    setBusy("recheck");
    const r = await fetchProfile();
    setBusy(null);
    if (r.ok === false) {
      setNotice(`Couldn't check your plan. ${r.error.message}`);
      return;
    }
    setStatus({ kind: "signed-in", profile: r.data });
    if (isPaid(r.data.plan)) setReturnNote("confirmed");
  };

  const profile = status.kind === "signed-in" ? status.profile : null;
  const currentPlan = profile?.plan ?? null;
  // Signed-out visitors can't be told whether billing is on (the engine answers per user),
  // so before the opening day they see the date, and after it a prompt to sign in.
  const showOpensCopy = billingClosed || (status.kind !== "signed-in" && !dedicatedHasOpened());

  const heading = profile
    ? `Your plan: ${PLAN_NAMES[profile.plan]}`
    : showOpensCopy
      ? `Dedicated opens ${DEDICATED_OPENS}`
      : "Plans";

  const notifyHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Tell me when Dedicated opens")}`;

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-8 space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Plans</p>
          <h1 className="text-3xl font-semibold text-foreground">{heading}</h1>
          <p className="text-muted-foreground">
            Everything you need to judge an article is free. Dedicated, at $3 a month, shows how every
            model scored it, and what your own reading history says about your news diet.
          </p>
        </div>

        {/* Account */}
        <div className="mb-6 rounded-lg border border-border bg-card p-5" data-testid="account-panel">
          {status.kind === "loading" && <p className="text-sm text-muted-foreground">Checking your account…</p>}

          {status.kind === "error" && (
            <div className="space-y-2">
              <p className="text-sm text-foreground">We couldn't load your plan. {status.message}</p>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          )}

          {status.kind === "signed-out" && (
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Sign in with the account you use in the extension to see your plan
                {showOpensCopy ? "." : " and upgrade."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => signIn("google")}>
                  Continue with Google
                </Button>
                <Button size="sm" variant="outline" onClick={() => signIn("github")}>
                  Continue with GitHub
                </Button>
              </div>
            </div>
          )}

          {profile && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <p className="text-foreground">
                  Signed in{profile.email ? <> as <span className="font-medium">{profile.email}</span></> : null}
                </p>
                <p className="text-muted-foreground">
                  Plan: <span className="text-foreground font-medium">{PLAN_NAMES[profile.plan]}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isPaid(profile.plan) && (
                  <Button size="sm" onClick={manage} disabled={busy !== null}>
                    {busy === "portal" ? "Opening…" : "Manage subscription"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={doSignOut} disabled={busy !== null}>
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Checkout return and action messages */}
        <div aria-live="polite" className="space-y-3 mb-6">
          {returnNote === "confirming" && (
            <Note>Checkout complete. Waiting for Stripe to confirm it with us; this usually takes a few seconds…</Note>
          )}
          {returnNote === "confirmed" && currentPlan && (
            <Note>{PLAN_NAMES[currentPlan]} is active on your account. Thank you for subscribing.</Note>
          )}
          {returnNote === "pending" && (
            <Note>
              <p>
                Checkout complete, but your plan hasn't updated yet. Stripe's confirmation can take a minute to
                reach us. If it still says Free after ten minutes, email{" "}
                <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
              <Button size="sm" variant="outline" className="mt-3" onClick={recheck} disabled={busy !== null}>
                {busy === "recheck" ? "Checking…" : "Check again"}
              </Button>
            </Note>
          )}
          {returnNote === "success-signed-out" && (
            <Note>Checkout complete. Sign in with the account you paid with to see your plan.</Note>
          )}
          {returnNote === "cancelled" && <Note>Checkout cancelled. You haven't been charged.</Note>}
          {notice && <Note>{notice}</Note>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => {
            const planId = plan.name.toLowerCase() as PlanId;
            const isCurrent = currentPlan === planId;
            return (
              <div
                key={plan.name}
                data-testid={`plan-${planId}`}
                className={`bg-card rounded-lg p-6 space-y-5 border ${
                  plan.recommended ? "ring-1 ring-primary border-primary/30" : "border-border"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Your plan
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-2xl text-foreground">
                    {plan.price ?? <span className="text-muted-foreground text-lg">Free</span>}
                    {plan.price && <span className="text-sm text-muted-foreground font-sans font-normal"> / mo</span>}
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.price ? (
                  <DedicatedAction
                    showOpensCopy={showOpensCopy}
                    status={status.kind}
                    currentPlan={currentPlan}
                    busy={busy}
                    onUpgrade={upgrade}
                    notifyHref={notifyHref}
                  />
                ) : status.kind === "signed-in" ? null : (
                  <p className="text-sm text-muted-foreground">You're on this plan when you sign in.</p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          How scores are made: <Link to="/methodology" className="text-primary hover:underline">Methodology</Link>
          {" · "}
          <Link to="/terms" className="text-primary hover:underline">Terms</Link>
          {" · "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

const Note = ({ children }: { children: ReactNode }) => (
  <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground" role="status">
    {children}
  </div>
);

const DedicatedAction = ({
  showOpensCopy,
  status,
  currentPlan,
  busy,
  onUpgrade,
  notifyHref,
}: {
  showOpensCopy: boolean;
  status: Status["kind"];
  currentPlan: PlanId | null;
  busy: string | null;
  onUpgrade: () => void;
  notifyHref: string;
}) => {
  if (currentPlan && currentPlan !== "free") return null; // paid: "Manage subscription" is in the account panel
  if (showOpensCopy) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-foreground font-medium">Opens {DEDICATED_OPENS}.</p>
        <a href={notifyHref} className="text-sm text-primary hover:underline">
          Email me when it opens
        </a>
      </div>
    );
  }
  if (status === "signed-in") {
    return (
      <div className="space-y-2">
        <Button onClick={onUpgrade} disabled={busy !== null} className="w-full">
          {busy === "checkout" ? "Opening checkout…" : "Upgrade to Dedicated"}
        </Button>
        <p className="text-xs text-muted-foreground">
          $3 a month, paid through Stripe. Cancel any time from this page.
        </p>
      </div>
    );
  }
  if (status === "signed-out") {
    return <p className="text-sm text-muted-foreground">Sign in above to upgrade.</p>;
  }
  return null;
};

export default Plan;
