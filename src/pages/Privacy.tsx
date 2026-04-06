import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="mb-10 space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Legal</p>
          <h1 className="text-3xl font-semibold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: 5 April 2026</p>
        </div>

        <div className="prose-custom space-y-8 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Who we are</h2>
            <p className="text-muted-foreground">
              TruthScore.ai ("TruthScore", "we", "us", "our") provides an AI-powered article scoring
              service delivered through a Chrome browser extension and a web application. This Privacy
              Policy explains how we collect, use, store, and protect your personal data in accordance
              with the UK General Data Protection Regulation (UK GDPR), the EU General Data Protection
              Regulation (EU GDPR), and the Privacy and Electronic Communications Regulations (PECR).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. What we collect and when</h2>

            <h3 className="text-base font-medium text-foreground">Visitors to this website</h3>
            <p className="text-muted-foreground">
              If you are simply browsing this marketing website without creating an account, we do not
              collect, store, or process any personal data about you. We do not use cookies, analytics
              trackers, or fingerprinting on this site.
            </p>

            <h3 className="text-base font-medium text-foreground">Registered users (Chrome Extension &amp; App)</h3>
            <p className="text-muted-foreground">
              When you download the Chrome Extension or sign up for the TruthScore app, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">Account information</span> — email
                address and display name, collected at registration.
              </li>
              <li>
                <span className="text-foreground font-medium">Authentication data</span> — hashed
                credentials or OAuth tokens for third-party sign-in providers (e.g. Google).
              </li>
              <li>
                <span className="text-foreground font-medium">Usage data</span> — URLs of articles
                you score, scores returned, and timestamps. This data is processed to deliver the
                service and improve scoring accuracy.
              </li>
              <li>
                <span className="text-foreground font-medium">Subscription &amp; billing data</span> — if
                you subscribe to a paid plan, payment processing is handled by our third-party
                payment provider. We store your plan type and subscription status but never your
                full card number.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Legal basis for processing</h2>
            <p className="text-muted-foreground">We process personal data under the following lawful bases (Article 6 UK/EU GDPR):</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><span className="text-foreground font-medium">Contract</span> — to provide the service you signed up for.</li>
              <li><span className="text-foreground font-medium">Legitimate interest</span> — to improve scoring models, prevent abuse, and maintain security.</li>
              <li><span className="text-foreground font-medium">Consent</span> — for any optional communications (e.g. product update emails). You can withdraw consent at any time.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Delivering and personalising the scoring service.</li>
              <li>Authenticating your identity and managing your account.</li>
              <li>Processing payments and managing subscriptions.</li>
              <li>Improving and training our AI scoring models (using aggregated, de-identified data only).</li>
              <li>Communicating service updates and, where you have opted in, product news.</li>
              <li>Detecting and preventing fraud or misuse.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data sharing &amp; international transfers</h2>
            <p className="text-muted-foreground">
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Infrastructure and hosting providers (to operate the service).</li>
              <li>Payment processors (to handle billing).</li>
              <li>Law enforcement or regulatory bodies where required by law.</li>
            </ul>
            <p className="text-muted-foreground">
              Where data is transferred outside the UK or EEA, we ensure appropriate safeguards are in
              place (e.g. Standard Contractual Clauses or an adequacy decision).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Data retention</h2>
            <p className="text-muted-foreground">
              We retain your account data for as long as your account is active. Usage data used for
              model training is aggregated and de-identified within 90 days. If you delete your
              account, we will erase your personal data within 30 days, except where retention is
              required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Your rights</h2>
            <p className="text-muted-foreground">Under UK and EU GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Access the personal data we hold about you.</li>
              <li>Rectify inaccurate or incomplete data.</li>
              <li>Erase your data ("right to be forgotten").</li>
              <li>Restrict or object to processing.</li>
              <li>Data portability — receive your data in a machine-readable format.</li>
              <li>Withdraw consent at any time (where consent is the legal basis).</li>
              <li>Lodge a complaint with your supervisory authority (e.g. the UK ICO or your local EU DPA).</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@truthscore.ai" className="text-primary hover:underline">
                privacy@truthscore.ai
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organisational measures to protect your personal
              data, including encryption in transit (TLS) and at rest, access controls, and regular
              security reviews.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Children</h2>
            <p className="text-muted-foreground">
              Our services are not directed at children under the age of 16. We do not knowingly
              collect personal data from children. If you believe a child has provided us with
              personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Changes to this policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via email or an in-app notification. The "Last updated" date at the top
              reflects the most recent revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related enquiries, contact us at{" "}
              <a href="mailto:privacy@truthscore.ai" className="text-primary hover:underline">
                privacy@truthscore.ai
              </a>.
            </p>
          </section>

          <hr className="border-border" />
          <p className="text-xs text-muted-foreground">
            See also: <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
