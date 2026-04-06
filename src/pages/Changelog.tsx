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
    date: "2026-03-10",
    version: "v2.5.0",
    category: "chrome",
    title: "Side panel & keyboard shortcuts",
    description: "Redesigned the extension interface with a persistent side panel so scores stay visible while you scroll.",
    changes: [
      { type: "added", text: "Persistent side panel showing score while scrolling" },
      { type: "added", text: "Keyboard shortcut Alt+T to toggle the panel" },
      { type: "changed", text: "Score badge now anchored to article headline instead of viewport corner" },
      { type: "fixed", text: "Badge no longer flickers on dynamic SPA article loads (NYT, The Atlantic)" },
    ],
  },
  {
    date: "2026-02-24",
    version: "v1.8.0",
    category: "engine",
    title: "Multilingual scoring support",
    description: "The scoring engine now processes articles in 12 languages with equivalent accuracy to English.",
    changes: [
      { type: "added", text: "Support for FR, DE, ES, PT, IT, NL, PL, SV, NO, DA, FI" },
      { type: "added", text: "Language-specific source reliability databases" },
      { type: "changed", text: "Bias detection model retrained on 40M multilingual samples" },
      { type: "fixed", text: "Encoding errors on right-to-left language previews" },
    ],
  },
  {
    date: "2026-02-06",
    version: "v2.4.3",
    category: "chrome",
    title: "Performance & stability patch",
    description: "Reduced extension memory footprint and fixed a crash on Chromium 121.",
    changes: [
      { type: "fixed", text: "Extension crash on Chromium 121 introduced by Manifest V3 service worker timeout" },
      { type: "fixed", text: "Duplicate score requests on pages with lazy-loaded article bodies" },
      { type: "changed", text: "Background service worker idle timeout increased from 30s to 5 min" },
      { type: "removed", text: "Deprecated v1 popup UI (replaced in v2.4.0)" },
    ],
  },
  {
    date: "2026-01-15",
    version: "v1.7.2",
    category: "engine",
    title: "Source reliability index refresh",
    description: "Updated the source index with Q4 2025 editorial standards audits across 3,200 outlets.",
    changes: [
      { type: "changed", text: "Source reliability index updated — 3,200 outlets re-audited" },
      { type: "added", text: "47 new regional news outlets added to the index" },
      { type: "fixed", text: "Incorrect reliability scores for paywalled outlets that changed domain" },
    ],
  },
  {
    date: "2025-12-18",
    version: "v2.4.0",
    category: "chrome",
    title: "Redesigned popup & Dedicated tier features",
    description: "New popup design with score history chart and trend indicators for Dedicated and Expert plan users.",
    changes: [
      { type: "added", text: "Score history sparkline for the last 30 articles (Dedicated+)" },
      { type: "added", text: "Source trend indicator showing reliability change over 90 days" },
      { type: "changed", text: "Popup rebuilt with new design system (Space Grotesk + JetBrains Mono)" },
      { type: "fixed", text: "OAuth token refresh loop on session expiry" },
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
