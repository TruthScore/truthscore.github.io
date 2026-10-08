import { forwardRef } from "react";
import { Button } from "@/components/ui/button";

interface Props { result: { ticket_id: string; email_sent: boolean }; onAnother: () => void }

/** Confirmation shown after a ticket is created; the heading takes focus when it appears. */
const SupportResult = forwardRef<HTMLHeadingElement, Props>(({ result, onAnother }, ref) => (
  <div className="space-y-3">
    <h2 ref={ref} tabIndex={-1} className="text-lg outline-none">Ticket <strong>{result.ticket_id}</strong> created.</h2>
    <p>{result.email_sent
      ? "We've emailed you a copy — reply to it to add details."
      : "We couldn't email you a copy. Note the ticket number; we'll reply to your account email."}</p>
    <Button variant="outline" onClick={onAnother}>Send another</Button>
  </div>
));
SupportResult.displayName = "SupportResult";

export default SupportResult;
