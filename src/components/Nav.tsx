import { Scale, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Nav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-sm bg-background/80 border-b border-border">
      <div className="container mx-auto max-w-6xl h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">TruthScore.ai</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/changelog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Changelog
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Add to Chrome
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-6 pt-8">
              <Link to="/#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/changelog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Changelog
              </Link>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full mt-2">
                Add to Chrome
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Nav;
