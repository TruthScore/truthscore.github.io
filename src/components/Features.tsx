import { Chrome, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Section 1: How it works ───────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    eyebrow: "01",
    title: "Scored by AI, verified by community",
    body: "Our engine analyses source reputation, factual consistency, and linguistic signals. Community members with Expert plans can submit corrections — improving every score over time.",
    visual: (
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 text-sm">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Score breakdown</p>
        {[["AI analysis", "0.3s"], ["Source lookup", "0.1s"], ["Community review", "ongoing"]].map(([step, time]) => (
          <div key={step} className="flex items-center justify-between">
            <span className="text-foreground">{step}</span>
            <span className="font-mono text-xs text-muted-foreground">{time}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "02",
    title: "Transparency, not censorship",
    body: "TruthScore never hides, blocks, or filters articles. It surfaces information so you can decide for yourself — because informed readers are better than filtered ones.",
    visual: (
      <div className="bg-card border border-border rounded-lg p-5 space-y-2 text-sm">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">What we show</p>
        {["Score + reasoning", "Source track record", "Known bias signals", "Community notes"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "03",
    title: "Works where you already read news",
    body: "The Chrome extension overlays scores directly on articles — no tab switching. The iOS app brings the same experience to mobile Safari and your news reader of choice.",
    visual: (
      <div className="bg-card border border-border rounded-lg p-5 space-y-2 text-sm">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Compatible with</p>
        {["Chrome Extension", "iOS App (Safari)", "Firefox Add-on (coming soon)"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
    ),
  },
];

// ── Section 2: Pricing ────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Free",
    price: null,
    features: ["100 rated articles/mo", "7-day article history", "Basic trends", "Chrome + iOS"],
    recommended: false,
  },
  {
    name: "Dedicated",
    price: "$3",
    features: ["1,000 rated articles/mo", "30-day article history", "Advanced trends", "Chrome + iOS"],
    recommended: true,
  },
  {
    name: "Expert",
    price: "$5",
    features: ["Unlimited articles", "1-year article history", "Advanced trends", "Community feedback"],
    recommended: false,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Features = () => {
  return (
    <>
      {/* Section 1 — How it works */}
      <section id="features">
        {HOW_IT_WORKS.map((item, i) => (
          <div key={item.eyebrow} className="border-t border-border py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
                <div className={`space-y-4 ${i % 2 === 1 ? "lg:[direction:ltr]" : ""}`}>
                  <p className="font-mono text-xs text-muted-foreground">{item.eyebrow}</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
                <div className={`${i % 2 === 1 ? "lg:[direction:ltr]" : ""}`}>
                  {item.visual}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Section 2 — Pricing */}
      <section id="pricing" className="border-t border-border py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 space-y-2">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Pricing</p>
            <h2 className="text-3xl font-semibold text-foreground">Choose your version</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-lg p-6 space-y-6 border ${
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

                <Button
                  variant={plan.recommended ? "default" : "outline"}
                  className={`w-full ${plan.recommended ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  size="sm"
                >
                  Get started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Bottom CTA */}
      <section className="border-t border-border py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Start reading with more confidence.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Chrome className="h-4 w-4" />
              Add to Chrome — Free
            </Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">Also available on iOS</p>
        </div>
      </section>
    </>
  );
};

export default Features;
