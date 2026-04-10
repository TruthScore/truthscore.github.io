import { useState } from "react";
import { format, parseISO } from "date-fns";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// TODO: Replace CHANGELOG_DATA with useQuery fetch from engine backend

interface ChangelogEntry {
  date: string;
  version: string;
  category: "chrome" | "engine" | "both";
  title: string;
  description: string;
  changes: { type: "added" | "changed" | "fixed" | "removed"; text: string }[];
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    date: "2026-04-10",
    version: "v1.0.0",
    category: "both",
    title: "Initial public release",
    description: "TruthScore launches with a Chrome extension, AI consensus engine, and the truthscore.ai website. Scores news articles across 9 journalistic dimensions using a 5-model consensus engine.",
    changes: [
      { type: "added", text: "Chrome Extension (MV3) with one-click article assessment" },
      { type: "added", text: "5-model AI consensus engine (Perplexity, Claude, GPT, Grok, custom HuggingFace)" },
      { type: "added", text: "9 journalistic scoring dimensions with weighted composite score" },
      { type: "added", text: "Device fingerprint-based anonymous trial (10 free assessments)" },
      { type: "added", text: "Three pricing tiers: Free, Dedicated ($3/mo), Expert ($5/mo)" },
      { type: "added", text: "truthscore.ai website with product overview and pricing" },
    ],
  },
];

const TYPE_STYLES: Record<ChangelogEntry["changes"][number]["type"], { dot: string; label: string }> = {
  added:   { dot: "bg-green-500",  label: "Added" },
  changed: { dot: "bg-blue-500",   label: "Changed" },
  fixed:   { dot: "bg-primary",    label: "Fixed" },
  removed: { dot: "bg-red-500",    label: "Removed" },
};

const CATEGORY_LABELS: Record<ChangelogEntry["category"], string> = {
  chrome: "Chrome Extension",
  engine: "AI Engine",
  both:   "Both",
};

type Filter = "all" | "chrome" | "engine";

const Changelog = () => {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = CHANGELOG_DATA.filter(
    (e) => filter === "all" || e.category === filter || e.category === "both"
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Changelog</p>
          <h1 className="text-3xl font-semibold text-foreground">What's new</h1>
          <p className="text-muted-foreground">Updates to the Chrome Extension and AI Engine.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-10 border-b border-border pb-4">
          {(["all", "chrome", "engine"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                filter === f
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : CATEGORY_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-12">
          {filtered.map((entry) => (
            <article key={`${entry.version}-${entry.date}`} className="space-y-4">
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {format(parseISO(entry.date), "MMMM d, yyyy")}
                </span>
                <span className="font-mono text-xs bg-secondary text-foreground px-2 py-0.5 rounded">
                  {entry.version}
                </span>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                  {CATEGORY_LABELS[entry.category]}
                </span>
              </div>

              {/* Title + description */}
              <div className="space-y-1">
                <h2 className="font-semibold text-foreground">{entry.title}</h2>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </div>

              {/* Change list */}
              <ul className="space-y-2">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_STYLES[change.type].dot}`}
                    />
                    <span className="text-foreground">
                      <span className="text-muted-foreground mr-1">{TYPE_STYLES[change.type].label} —</span>
                      {change.text}
                    </span>
                  </li>
                ))}
              </ul>

              <hr className="border-border" />
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Changelog;
