import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { PLANS, DEDICATED_OPENS } from "@/lib/plans";

// /account/plan is where the extension's locked cards and daily-limit message
// send people (PLAN_URL in truthscore-chrome-ext-v2 shared/ui/copy.js). Until
// Stripe Checkout goes live it states the opening date, per ship design decision 4.
const NOTIFY_EMAIL = "hello@truthscore.ai";

const Plan = () => {
  const notify = `mailto:${NOTIFY_EMAIL}?subject=${encodeURIComponent("Tell me when Dedicated opens")}`;
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-10 space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Plans</p>
          <h1 className="text-3xl font-semibold text-foreground">Dedicated opens {DEDICATED_OPENS}</h1>
          <p className="text-muted-foreground">
            Everything you need to judge an article is free. Dedicated, at $3 a month, shows how every
            model scored it, and what your own reading history says about your news diet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card rounded-lg p-6 space-y-5 border ${
                plan.recommended ? "ring-1 ring-primary border-primary/30" : "border-border"
              }`}
            >
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{plan.name}</p>
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
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">Opens {DEDICATED_OPENS}.</p>
                  <a href={notify} className="text-sm text-primary hover:underline">
                    Email me when it opens
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You're on this plan when you sign in.</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          How scores are made: <Link to="/methodology" className="text-primary hover:underline">Methodology</Link>
          {" · "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Plan;
