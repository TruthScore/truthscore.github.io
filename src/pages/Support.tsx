import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabase } from "@/lib/supabase";
import {
  CATEGORIES, SUPPORT_EMAIL, deviceLabel, submitSupport, supportErrorCopy, validateSupportForm, SupportError,
} from "@/lib/support";

const Fallback = () => (
  <p className="text-sm text-muted-foreground">
    Can't sign in or use this form? Email <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
  </p>
);

const Support = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ticket_id: string; email_sent: boolean } | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null)) // show the signed-out view (it carries the email fallback)
      .finally(() => setLoading(false));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (provider: "google" | "github") => {
    setError("");
    try {
      const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
        provider, options: { redirectTo: `${window.location.origin}/support` },
      });
      if (oauthError) setError(`Sign-in couldn't start. Email ${SUPPORT_EMAIL} instead.`);
    } catch {
      setError(`Sign-in couldn't start. Email ${SUPPORT_EMAIL} instead.`);
    }
  };

  const signOut = () => { void getSupabase().auth.signOut(); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || !session) return; // double click → one ticket
    const v = validateSupportForm({ category, subject, description });
    if (!v.ok) { setError(Object.values(v.errors)[0] ?? ""); return; }
    setPending(true);
    setError("");
    try {
      const r = await submitSupport(session.access_token, {
        channel: "Website", ...v.value, client_version: `Web ${__BUILD_SHA__}`, device: deviceLabel(navigator.userAgent),
      });
      setResult(r);
      setSubject(""); setDescription(""); setCategory("");
    } catch (err) {
      const code = err instanceof SupportError ? err.code : undefined;
      setError(supportErrorCopy(code));
      // Dead session: sign out so the sign-in buttons return (the error copy stays visible there).
      if (code === "MISSING_AUTH" || code === "INVALID_TOKEN" || code === "EXPIRED_TOKEN") signOut();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-xl mx-auto px-6 py-24 space-y-6">
        <h1 className="text-3xl font-semibold text-foreground">Contact support</h1>
        {loading ? <p className="text-muted-foreground">Loading…</p>
        : !session ? (
          <div className="space-y-4">
            <p>Sign in with the account you use in TruthScore so we can reply to the right address.</p>
            <div className="flex gap-3">
              <Button onClick={() => signIn("google")}>Sign in with Google</Button>
              <Button variant="outline" onClick={() => signIn("github")}>GitHub</Button>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Fallback />
          </div>
        ) : result ? (
          <div role="status" className="space-y-3">
            <p className="text-lg">Ticket <strong>{result.ticket_id}</strong> created.</p>
            <p>{result.email_sent
              ? "We've emailed you a copy — reply to it to add details."
              : "We couldn't email you a copy. Note the ticket number; we'll reply to your account email."}</p>
            <Button variant="outline" onClick={() => setResult(null)}>Send another</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="support-category"><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input id="support-subject" maxLength={150} value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-description">What happened?</Label>
              <Textarea id="support-description" rows={8} maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <p className="text-sm text-muted-foreground">
              Replies go to: {session.user.email}{" "}
              <button type="button" className="underline" onClick={signOut}>Not you? Sign out</button>
            </p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send"}</Button>
            <Fallback />
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Support;
