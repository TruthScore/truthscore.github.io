import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SupportResult from './SupportResult';

const noop = () => {};
const render = (r: { ticket_id: string; email_sent: boolean }) =>
  renderToStaticMarkup(<SupportResult result={r} onAnother={noop} />).replace(/&#x27;/g, "'");

describe('SupportResult', () => {
  it('has a focusable heading naming the ticket', () => {
    const html = render({ ticket_id: 'TCK-1001', email_sent: true });
    expect(html).toMatch(/<h2[^>]*tabindex="-1"[^>]*>Ticket <strong>TCK-1001<\/strong> created\.<\/h2>/);
    expect(html).toContain("We've emailed you a copy");
  });
  it('tells the user when the copy email failed', () => {
    const html = render({ ticket_id: 'TCK-1002', email_sent: false });
    expect(html).toContain("We couldn't email you a copy");
    expect(html).not.toContain("We've emailed you a copy");
  });
});
