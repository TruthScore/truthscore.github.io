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
    date: "2026-10-19",
    version: "v1.7.0",
    category: "both",
    title: "Delete your account",
    description: "You can now delete your TruthScore account yourself, from the website.",
    changes: [
      { type: "added", text: "truthscore.ai/account/delete: sign in and delete your account and your scoring history. For your security, it asks you to sign in again if your last sign-in was more than 10 minutes ago" },
    ],
  },
  {
    date: "2026-10-10",
    version: "v1.6.0",
    category: "chrome",
    title: "The spider chart is the result",
    description: "Extension 1.0.2 puts the score in the middle of the spider chart and lets you open any dimension to see why it scored the way it did.",
    changes: [
      { type: "changed", text: "The score now sits in the centre of the spider chart, which replaces the score ring and the bar chart. The nine dimensions have short, readable headings, and each dot is coloured by its score band" },
      { type: "added", text: "Tap a dimension to see its score, the range the AI council gave it and the full explanation" },
      { type: "changed", text: "Opening a past assessment from History now shows the full result: summaries, the council breakdown and where the models agreed. It never uses up a free assessment" },
      { type: "changed", text: "The note showing how many free assessments you have left now appears whenever 4 to 9 remain" },
      { type: "fixed", text: "If your free assessments ran out partway through a session, the popup now shows the sign-up screen instead of an error code" },
    ],
  },
  {
    date: "2026-10-05",
    version: "v1.5.0",
    category: "both",
    title: "Chrome Web Store release",
    description: "The extension's first Chrome Web Store release, with a welcome tour, a working History tab and support from inside the popup.",
    changes: [
      { type: "added", text: "A welcome tour the first time you open TruthScore: what it is, how Verity and the council work, and how to read a result" },
      { type: "added", text: "Open a past assessment from History without analysing the article again" },
      { type: "added", text: "Contact support from the popup or at truthscore.ai/support. Replies go to your account's email address" },
      { type: "changed", text: "Clearer sign-in: a dedicated sign-in page with a Not now button, and a more visible Sign in link" },
      { type: "fixed", text: "Sign-in problems are now shown to you instead of failing silently" },
    ],
  },
  {
    date: "2026-09-30",
    version: "v1.4.0",
    category: "both",
    title: "Verity, the council and a new result view",
    description: "Articles are now scored by Verity, TruthScore's own journalism model, and checked by a council of five AI models. The result is laid out in three layers, so you can stop at a glance or read every model's reasoning.",
    changes: [
      { type: "added", text: "Verity scores each article, and a council of five AI models (from Anthropic, OpenAI, Google, xAI and Perplexity) checks it independently. Summaries now follow whichever scored the article" },
      { type: "added", text: "See how far the council's scores spread on each dimension, with a Contested flag wherever the models disagree" },
      { type: "changed", text: "A redesigned result in three layers: the score and what it means at a glance, then a summary, then the full detail" },
      { type: "changed", text: "Rating bands recalibrated against how more than a thousand real articles actually score, so the top band is reachable and the bands separate articles more clearly" },
      { type: "added", text: "Signed-in free accounts get 25 scores a day. When you reach the limit, or when TruthScore is at capacity, the popup tells you plainly instead of showing an error" },
      { type: "added", text: "An Analytics tab showing how the articles you have scored spread across the rating bands" },
      { type: "added", text: "The methodology page at truthscore.ai/methodology explains how TruthScore scores an article" },
      { type: "changed", text: "TruthScore now refuses links that point to private or internal network addresses, and limits how many anonymous scores one network can run each day, to keep the free trial fair" },
    ],
  },
  {
    date: "2026-07-11",
    version: "v1.3.0",
    category: "engine",
    title: "Fairer scoring of fact-checks",
    description: "Fact-checking and debunking journalism is no longer marked down for taking a side on claims that are documented as false.",
    changes: [
      { type: "fixed", text: "Balanced Perspective now applies to genuinely contested questions, not to documented falsehoods. Calling a debunked claim debunked is no longer treated as loaded language" },
      { type: "fixed", text: "When some AI models fail during an assessment, the incomplete result is now refreshed automatically after a while instead of being kept for good" },
    ],
  },
  {
    date: "2026-06-18",
    version: "v1.2.0",
    category: "both",
    title: "All nine dimensions, and a bigger popup",
    description: "Every model now scores the full nine-dimension framework, and the popup has room to show it.",
    changes: [
      { type: "added", text: "Author Credibility, Error Accountability, News vs Opinion, Headline Integrity and Humanity & Ethics are now scored alongside Factual Accuracy, Source Quality, Balanced Perspective and Transparency & Disclosure" },
      { type: "changed", text: "The spider chart shows all nine dimensions" },
      { type: "added", text: "Progress messages while an article is being scored" },
      { type: "changed", text: "A wider popup with a side-by-side layout, and a button to open the result in its own tab" },
    ],
  },
  {
    date: "2026-05-05",
    version: "v1.1.0",
    category: "both",
    title: "Accounts and history",
    description: "Sign in to keep your scoring history across devices.",
    changes: [
      { type: "added", text: "Sign in with Google or GitHub" },
      { type: "added", text: "Your scoring history, with a Load more button for older entries" },
      { type: "added", text: "Assessments you made before signing in move to your account when you sign in" },
    ],
  },
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
