import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CHROME_STORE_URL } from "@/lib/config";

// An "Add to Chrome" button: a link to the Web Store listing, styled as a button.
const InstallButton = ({ children, className, ...props }: ButtonProps & { children: ReactNode }) => (
  <Button asChild className={`bg-primary text-primary-foreground hover:bg-primary/90 ${className ?? ""}`} {...props}>
    <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  </Button>
);

export default InstallButton;
