import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

// Mirrors the engine's authoritative tables: dimensions and weights from
// truthscore-engine src/config/questions.json, band edges from RATING_EDGES
// (src/utils/ratings.ts, D-019). Update this page when either changes.
const DIMENSIONS = [
  {
    title: "Factual Accuracy",
    weight: 20,
    asks: "Are claims supported by credible evidence, statistics cited and verifiable, and uncertain facts qualified rather than stated as settled?",
  },
  {
    title: "Source Quality",
    weight: 15,
    asks: "Are sources named and credible for the claims made, primary rather than second-hand, and anonymous sources justified?",
  },
  {
    title: "Balanced Perspective",
    weight: 13,
    asks: "Are the legitimate perspectives presented fairly, in neutral language, without loaded framing? Documented falsehoods are not owed equal time.",
  },
  {
    title: "Author Credibility",
    weight: 10,
    asks: "Is there a real, attributable author with relevant background, and a way to verify who they are?",
  },
  {
    title: "Error Accountability",
    weight: 10,
    asks: "Are corrections, updates and the limits of the reporting clearly acknowledged?",
  },
  {
    title: "News vs Opinion",
    weight: 10,
    asks: "Is the piece labelled for what it is, with facts kept distinct from the author's opinions?",
  },
  {
    title: "Headline Integrity",
    weight: 8,
    asks: "Does the headline reflect the article without sensationalism or clickbait, and does the lede deliver on it?",
  },
  {
    title: "Humanity & Ethics",
    weight: 7,
    asks: "Are the people covered treated with dignity, privacy respected, and harm weighed against public interest?",
  },
  {
    title: "Transparency & Disclosure",
    weight: 7,
    asks: "Are conflicts of interest, funding and method disclosed, with links so readers can check the claims?",
  },
];

const BANDS = [
  { label: "Verified", range: "7.93 and above", color: "#22C55E" },
  { label: "Generally Reliable", range: "6.83 – 7.92", color: "#84CC16" },
  { label: "Mixed Signals", range: "5.50 – 6.82", color: "#EAB308" },
  { label: "Caution", range: "3.87 – 5.49", color: "#F97316" },
  { label: "Unreliable", range: "below 3.87", color: "#EF4444" },
];

const Methodology = () => {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="mb-10 space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Methodology</p>
          <h1 className="text-3xl font-semibold text-foreground">How TruthScore scores</h1>
          <p className="text-muted-foreground">Last updated: 30 September 2026</p>
        </div>

        <div className="prose-custom space-y-8 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">What a score measures</h2>
            <p className="text-muted-foreground">
              A TruthScore rates the journalism in one article: how well it is sourced, how fairly it
              is framed and how honestly it is presented. It is not a fact-check of every claim, and it
              is not a rating of the outlet. The same outlet can publish a strong article and a weak one.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Who scores it</h2>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Verity</span>, our own model trained
              specifically to assess journalism, scores each article. A{" "}
              <span className="text-foreground font-medium">council of five AI models</span> from
              Anthropic, OpenAI, Google, xAI and Perplexity scores it independently as a check.
            </p>
            <p className="text-muted-foreground">
              Verity's score is the one you see, and the two are never averaged. When the models split
              on a dimension, the result marks it as contested. Paid plans show each model's score,
              dimension by dimension. If Verity is unavailable, the council's score is used, and the
              result says who scored it.
            </p>
            <p className="text-muted-foreground">
              Within the council, each dimension takes the <em>median</em> of the models' scores, so a
              single model's outlier cannot move the result. A model that fails or refuses to answer is
              left out rather than counted as zero.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">The nine dimensions</h2>
            <p className="text-muted-foreground">
              Every article is scored 0–10 on nine dimensions, each assessed through four specific
              questions. The overall score is their weighted average.
            </p>
            <div className="divide-y divide-border rounded-lg border border-border">
              {DIMENSIONS.map((d) => (
                <div key={d.title} className="flex gap-4 p-4">
                  <div className="w-12 shrink-0 font-mono text-sm text-foreground">{d.weight}%</div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{d.title}</p>
                    <p className="text-muted-foreground">{d.asks}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">The rating bands</h2>
            <p className="text-muted-foreground">
              The overall score places the article in one of five bands. The boundaries were set from
              the observed distribution of more than a thousand scored articles, not picked in advance,
              so each band means something relative to real reporting.
            </p>
            <ul className="space-y-2">
              {BANDS.map((b) => (
                <li key={b.label} className="flex items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="font-medium text-foreground w-40">{b.label}</span>
                  <span className="font-mono text-muted-foreground">{b.range}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Limits</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                Scores are AI judgments. They can be wrong, and they are a prompt to read critically,
                not a verdict.
              </li>
              <li>
                Only the article's text is assessed. Author Credibility and Error Accountability in
                particular depend on things an article often doesn't show, such as an author's track
                record or an outlet's corrections policy. Read those two dimensions with that in mind.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">How we check ourselves</h2>
            <p className="text-muted-foreground">
              Verity is tested against a held-out set of articles it never trained on. People read and
              grade a sample of its results before any new version ships. Every scoring run is stored
              with each model's scores, so disagreements can be reviewed afterwards.
            </p>
          </section>

          <hr className="border-border" />
          <p className="text-xs text-muted-foreground">
            See also: <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            {" · "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Methodology;
