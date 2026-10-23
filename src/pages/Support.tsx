import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SupportResult from "@/components/SupportResult";
import { getSupabase } from "@/lib/supabase";
import { errorId, fieldA11y } from "@/lib/formA11y";
import {
  CATEGORIES, SUPPORT_EMAIL, deviceLabel, submitSupport, supportErrorCopy, validateSupportForm, SupportError,
} from "@/lib/support";

type Field = "category" | "subject" | "description";
const FIELD_ORDER: Field[] = ["category", "subject", "description"];

const FieldError = ({ id, error }: { id: string; error?: string }) =>
  error ? <p id={errorId(id)} className="text-sm text-destructive">{error}</p> : null;

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
  const [error, setError] = useState(""); // form-level: sign-in or server; goes in the persistent alert region
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ticket_id: string; email_sent: boolean } | null>(null);
  const fieldRefs = {
    category: useRef<HTMLButtonElement>(null),
    subject: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
  };
  const resultHeading = useRef<HTMLHeadingElement>(null);

  // Success swaps the form for the result: move focus there (the status region announces it too).
  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);

  const edit = (field: Field, set: (v: string) => void) => (v: string) => {
    set(v);
    setFieldErrors(f => (f[field] ? { ...f, [field]: undefined } : f));
  };

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
    if ("errors" in v) { // (strictNullChecks is off, so `!v.ok` does not narrow)
      setFieldErrors(v.errors);
      setError("");
      const first = FIELD_ORDER.find(f => v.errors[f]);
      if (first) fieldRefs[first].current?.focus();
      return;
    }
    setFieldErrors({});
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
      <main className="max-w-xl mx-auto px-6 py-24 space-y-6">
        <h1 className="text-3xl font-semibold text-foreground">Contact support</h1>
        {/* Live regions stay mounted so screen readers announce text put into them. */}
        <div role="status" aria-live="polite" className="sr-only">
          {result ? `Ticket ${result.ticket_id} created.` : ""}
        </div>
        <div role="alert" className="text-sm text-destructive empty:hidden">{error}</div>
        {loading ? <p className="text-muted-foreground">Loading…</p>
        : !session ? (
          <div className="space-y-4">
            <p>Sign in with the account you use in TruthScore so we can reply to the right address.</p>
            <div className="flex gap-3">
              <Button onClick={() => signIn("google")}>Sign in with Google</Button>
              <Button variant="outline" onClick={() => signIn("github")}>GitHub</Button>
            </div>
            <Fallback />
          </div>
        ) : result ? (
          <SupportResult ref={resultHeading} result={result} onAnother={() => setResult(null)} />
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support-category">Category</Label>
              <Select value={category} onValueChange={edit("category", setCategory)}>
                <SelectTrigger id="support-category" ref={fieldRefs.category} {...fieldA11y("support-category", fieldErrors.category)}>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError id="support-category" error={fieldErrors.category} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input id="support-subject" ref={fieldRefs.subject} maxLength={150} value={subject}
                onChange={e => edit("subject", setSubject)(e.target.value)} {...fieldA11y("support-subject", fieldErrors.subject)} />
              <FieldError id="support-subject" error={fieldErrors.subject} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-description">What happened?</Label>
              <Textarea id="support-description" ref={fieldRefs.description} rows={8} maxLength={5000} value={description}
                onChange={e => edit("description", setDescription)(e.target.value)} {...fieldA11y("support-description", fieldErrors.description)} />
              <FieldError id="support-description" error={fieldErrors.description} />
            </div>
            <p className="text-sm text-muted-foreground">
              Replies go to: {session.user.email}{" "}
              <button type="button" className="underline" onClick={signOut}>Not you? Sign out</button>
            </p>
            <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send"}</Button>
            <Fallback />
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Support;
