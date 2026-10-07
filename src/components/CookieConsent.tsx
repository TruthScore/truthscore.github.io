import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, OPEN_CONSENT_EVENT, type Consent } from "@/lib/consent";

const CookieConsent = () => {
  const [open, setOpen] = useState(() => getConsent() === null);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (value: Consent) => {
    setConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-lg border border-border bg-background/95 backdrop-blur-sm p-4 shadow-lg"
    >
      <p className="text-sm text-muted-foreground">
        We'd like to use Google Analytics cookies to understand how people find and use this site.
        No advertising, and nothing is set unless you accept.{" "}
        <Link to="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => choose("denied")}>
          Decline
        </Button>
        <Button size="sm" onClick={() => choose("granted")}>
          Accept
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
