import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Support from './Support';

const html = () => renderToStaticMarkup(<MemoryRouter><Support /></MemoryRouter>);

describe('Support page landmarks and live regions', () => {
  it('wraps the page content in exactly one <main>', () => {
    expect(html().match(/<main[\s>]/g)).toHaveLength(1);
  });
  it('renders the status and alert live regions before any content changes', () => {
    // Live regions must exist in the DOM before text is put in them, or screen readers may miss it.
    const out = html();
    expect(out).toMatch(/<div[^>]*role="status"[^>]*aria-live="polite"/);
    expect(out).toMatch(/<div[^>]*role="alert"/);
  });
});
