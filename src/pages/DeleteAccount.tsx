import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { SUPPORT_EMAIL } from "@/lib/support";
import {
  CONFIRM_WORD, DeleteAccountError, SIGN_IN_AGAIN, deleteAccount, deleteErrorCopy, needsFreshSignIn,
} from "@/lib/account";

// /account/delete is the Google Play "Delete account URL" (and the mobile app's Delete account
// row). It must work without the app installed, so it signs in here and calls the engine's
// DELETE /user/account, which wants a sign-in under 10 minutes old.

const emailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete my TruthScore account")}`;

const Fallback = () => (
  <p className="text-sm text-muted-foreground">
    Can't sign in? Email <a className="underline" href={emailHref}>{SUPPORT_EMAIL}</a> from your
    account's email address and we'll delete it for you within 30 days.
  </p>
);

const DeleteAccount = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ email_sent: boolean } | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (provider: "google" | "github") => {
    setError("");
    try {
      const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
        provider, options: { redirectTo: `${window.location.origin}/account/delete` },
      });
      if (oauthError) setError(`Sign-in couldn't start. Email ${SUPPORT_EMAIL} instead.`);
    } catch {
      setError(`Sign-in couldn't start. Email ${SUPPORT_EMAIL} instead.`);
    }
  };

  const signOut = () => getSupabase().auth.signOut().catch(() => undefined);

  const onDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || !session || typed.trim() !== CONFIRM_WORD) return;
    setPending(true);
    setError("");
    try {
      const r = await deleteAccount(session.access_token);
      // The server-side session is gone with the user; drop the local copy too.
      await signOut();
      setDone(r);
    } catch (err) {
      const code = err instanceof DeleteAccountError ? err.code : undefined;
      setError(deleteErrorCopy(code));
      if (code && SIGN_IN_AGAIN.has(code)) void signOut();
    } finally {
      setPending(false);
    }
  };

  const signInButtons = (
    <div className="flex gap-3">
      <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      <Button variant="outline" onClick={() => signIn("github")}>GitHub</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-xl mx-auto px-6 py-24 space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Account</p>
          <h1 className="text-3xl font-semibold text-foreground">Delete your TruthScore account</h1>
          <p className="text-muted-foreground">
            This deletes the account you use in the TruthScore apps for Android and iOS and the TruthScore
            Chrome extension, all published by TruthScore.ai. You don't need the app installed.
          </p>
        </div>

        <section className="space-y-2" aria-labelledby="del-steps">
          <h2 id="del-steps" className="text-lg font-semibold text-foreground">How to delete it</h2>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Sign in below with the same Google or GitHub account you use in TruthScore.</li>
            <li>Type {CONFIRM_WORD} to confirm, then press Delete my account.</li>
            <li>We delete it straight away and email you to confirm.</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            In the mobile app: open your account (the avatar at the top), then Delete account. It brings you here.
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="del-what">
          <h2 id="del-what" className="text-lg font-semibold text-foreground">What happens to your data</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><span className="text-foreground font-medium">Deleted immediately:</span> your sign-in, profile
              (name, picture, plan) and your scoring history and analytics.</li>
            <li><span className="text-foreground font-medium">Deleted within 30 days:</span> support requests
              you sent us.</li>
            <li><span className="text-foreground font-medium">Kept, not linked to you:</span> article scores, which
              belong to the article rather than to whoever asked, and the anonymous device count of free scores
              (hashed signals only, so a new account can't reset it).</li>
            <li><span className="text-foreground font-medium">Kept where the law requires:</span> payment and tax
              records held by our payment provider, if you ever had a paid plan.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Deletion is permanent and can't be undone. See our <Link className="underline" to="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-6" aria-labelledby="del-form">
          <h2 id="del-form" className="text-lg font-semibold text-foreground">Delete my account</h2>
          {loading ? <p className="text-muted-foreground">Loading…</p>
          : done ? (
            <div role="status" className="space-y-2">
              <p className="text-lg text-foreground">Your account has been deleted.</p>
              <p className="text-muted-foreground">{done.email_sent
                ? "We've emailed you a confirmation."
                : "We couldn't send a confirmation email, but the deletion is complete."}{" "}
                You can uninstall the app and the extension.</p>
            </div>
          ) : !session ? (
            <div className="space-y-4">
              <p>Sign in to confirm it's your account.</p>
              {signInButtons}
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
          ) : needsFreshSignIn(session.access_token) ? (
            <div className="space-y-4">
              <p>You're signed in as {session.user.email}. For your security, sign in again to continue.</p>
              {signInButtons}
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
          ) : (
            <form onSubmit={onDelete} noValidate className="space-y-4">
              <p>
                Signed in as <strong>{session.user.email}</strong>.{" "}
                <button type="button" className="underline text-sm" onClick={() => void signOut()}>Not you? Sign out</button>
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">Type {CONFIRM_WORD} to confirm</Label>
                <Input id="delete-confirm" autoComplete="off" autoCapitalize="characters" spellCheck={false}
                  value={typed} onChange={e => setTyped(e.target.value)} />
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="destructive" disabled={pending || typed.trim() !== CONFIRM_WORD}>
                {pending ? "Deleting…" : "Delete my account"}
              </Button>
            </form>
          )}
          {!done && <Fallback />}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default DeleteAccount;
