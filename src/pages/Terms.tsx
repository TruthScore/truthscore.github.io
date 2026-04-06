import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="mb-10 space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Legal</p>
          <h1 className="text-3xl font-semibold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: 5 April 2026</p>
        </div>

        <div className="prose-custom space-y-8 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground">
              These Terms of Service ("Terms") govern your use of the TruthScore.ai website,
              Chrome browser extension, and web application (collectively, the "Service") provided
              by TruthScore.ai ("TruthScore", "we", "us", "our"). By creating an account or
              using the Service, you agree to be bound by these Terms.
            </p>
            <p className="text-muted-foreground">
              If you are browsing this website without creating an account, these Terms do not
              apply to you — no account or agreement is required to view this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Eligibility</h2>
            <p className="text-muted-foreground">
              You must be at least 16 years old to create an account and use the Service. By
              registering, you represent that you meet this age requirement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Account registration</h2>
            <p className="text-muted-foreground">
              To access the Chrome Extension and the App you must register for an account.
              You agree to provide accurate information and keep your credentials secure. You are
              responsible for all activity under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. The Service</h2>
            <p className="text-muted-foreground">
              TruthScore provides AI-generated reliability scores for online articles. Scores are
              informational only and do not constitute professional advice, fact-checking
              certification, or editorial endorsement. We do not block, censor, or filter any
              content — all scoring is supplementary information to support your own judgement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Subscriptions &amp; billing</h2>
            <p className="text-muted-foreground">
              Free accounts are available with limited features. Paid plans (Dedicated and Expert)
              are billed on a monthly or annual cycle. Prices are displayed in your local currency
              where possible and include applicable taxes for UK and EU customers.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">Cancellation</span> — you may cancel
                your subscription at any time. Access continues until the end of the current billing
                period.
              </li>
              <li>
                <span className="text-foreground font-medium">Refunds</span> — if you are an EU or
                UK consumer, you have a 14-day statutory right of withdrawal from the date of
                purchase, provided you have not fully used the service during that period.
              </li>
              <li>
                <span className="text-foreground font-medium">Price changes</span> — we will give
                at least 30 days' notice before any price increase takes effect.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Acceptable use</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Reverse-engineer, scrape, or systematically extract data from the Service.</li>
              <li>Use the Service to harass, defame, or infringe on the rights of others.</li>
              <li>Attempt to bypass rate limits, authentication, or access controls.</li>
              <li>Redistribute scores or API responses commercially without our written consent.</li>
              <li>Use automated tools to create accounts or generate fraudulent usage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Intellectual property</h2>
            <p className="text-muted-foreground">
              All content, software, models, and branding associated with TruthScore are our
              property or licensed to us. Your use of the Service does not transfer any
              intellectual property rights to you. You retain ownership of any content you submit
              (e.g. community corrections on Expert plans).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Disclaimer of warranties</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" and "as available". While we strive for accuracy,
              AI-generated scores may contain errors. We make no warranty that scores are complete,
              accurate, or suitable for any particular purpose. Nothing in these Terms excludes or
              limits liability that cannot be excluded under applicable law (including UK and EU
              consumer protection law).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Limitation of liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, TruthScore's total liability for any claim
              arising from or relating to these Terms or the Service shall not exceed the amount
              you paid us in the 12 months preceding the claim, or £100, whichever is greater. This
              limitation does not apply to liability for death, personal injury, fraud, or any
              liability that cannot be limited under UK or EU law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Termination</h2>
            <p className="text-muted-foreground">
              You may delete your account at any time. We may suspend or terminate your account if
              you breach these Terms, with reasonable notice where practicable. On termination, your
              right to use the Service ends and we will delete your personal data in accordance with
              our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">11. Changes to these Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Material changes will be communicated
              via email or in-app notification at least 30 days before taking effect. Continued use
              of the Service after the effective date constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">12. Governing law &amp; disputes</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of England and Wales. If you are an EU consumer,
              you also benefit from any mandatory provisions of the law of your country of
              residence. Any disputes will be subject to the non-exclusive jurisdiction of the
              courts of England and Wales, without prejudice to your right to bring proceedings in
              your local courts if required by applicable consumer law.
            </p>
            <p className="text-muted-foreground">
              EU residents may also use the European Commission's Online Dispute Resolution
              platform at{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">13. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@truthscore.ai" className="text-primary hover:underline">
                legal@truthscore.ai
              </a>.
            </p>
          </section>

          <hr className="border-border" />
          <p className="text-xs text-muted-foreground">
            See also: <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
