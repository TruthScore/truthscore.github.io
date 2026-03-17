import { useEffect, useRef, useState } from "react";
import { Chrome, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO: Replace with live API call
const SCORE_COUNT = 847_293;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, duration: number) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.round(easeOutCubic(progress) * target));
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const Hero = () => {
  const { count, ref } = useCountUp(SCORE_COUNT, 2000);

  return (
    <section className="pt-32 pb-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column — text */}
          <div className="space-y-8 animate-fade-up">
            {/* Eyebrow */}
            <p className="font-mono text-xs tracking-widest text-primary uppercase">
              AI-POWERED NEWS SCORING
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-foreground">
              Food comes with a nutrition label. Wouldn't it be great if news did too?
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              TruthScore gives every article a credibility score — built by AI, refined by community, readable in seconds.
            </p>

            {/* Score counter */}
            <div ref={ref} className="space-y-1">
              <p className="font-mono text-4xl font-semibold text-foreground tabular-nums">
                {count.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">news items scored</p>
              <hr className="w-10 border-t-2 border-primary mt-2" />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Chrome className="h-4 w-4" />
                Add to Chrome — Free
              </Button>
              <Button variant="ghost" className="gap-2 text-foreground">
                <Smartphone className="h-4 w-4" />
                Get iOS App
              </Button>
            </div>
          </div>

          {/* Right column — mock score card */}
          <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-5 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              {/* Article meta */}
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Reuters</p>
                <p className="text-sm font-medium text-foreground leading-snug">
                  Central banks signal coordinated rate pause amid inflation data revision
                </p>
                <p className="text-xs text-muted-foreground">Jane Holloway · 14 min read</p>
              </div>

              <hr className="border-border" />

              {/* Main score */}
              <div className="flex items-end gap-4">
                <span className="font-mono text-5xl font-semibold text-foreground leading-none">82</span>
                <div className="flex-1 space-y-1.5 pb-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Credibility score</span>
                    <span>82 / 100</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="space-y-3">
                {[
                  { label: "Source reliability", value: 88 },
                  { label: "Factual accuracy", value: 79 },
                  { label: "Bias detection", value: 74 },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-foreground">{value}</span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Caption */}
              <p className="font-mono text-xs text-muted-foreground pt-1">
                Updated 2 min ago — via Chrome Extension
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
