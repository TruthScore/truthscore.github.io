import { Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { openCookieSettings } from "@/lib/consent";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <span>&copy; {new Date().getFullYear()} TruthScore.ai</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/support" className="hover:text-foreground transition-colors">
            Support
          </Link>
          <Link to="/methodology" className="hover:text-foreground transition-colors">
            Methodology
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <button type="button" onClick={openCookieSettings} className="hover:text-foreground transition-colors">
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
