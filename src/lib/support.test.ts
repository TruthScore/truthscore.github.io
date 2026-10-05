import { describe, it, expect, vi } from 'vitest';
import { CATEGORIES, deviceLabel, submitSupport, supportErrorCopy, validateSupportForm } from './support';

describe('support lib (twin of extension shared/support.js)', () => {
  it('has the same eight categories', () => {
    expect(CATEGORIES).toEqual(['Bug Report', 'UI Glitch', 'Account Access', 'Billing', 'Performance', 'Feature Request', 'Score Accuracy', 'Other']);
  });
  it('validates', () => {
    expect(validateSupportForm({ category: 'Other', subject: ' Hi there ', description: 'Long enough text.' }))
      .toEqual({ ok: true, value: { category: 'Other', subject: 'Hi there', description: 'Long enough text.' } });
    expect(validateSupportForm({ category: '', subject: 'a', description: '' }).ok).toBe(false);
  });
  it('labels devices', () => {
    expect(deviceLabel('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15')).toBe('macOS / Safari 17');
  });
  it('falls back to the email address', () => expect(supportErrorCopy('X')).toContain('support@truthscore.ai'));

  it('posts with the bearer and surfaces engine codes', async () => {
    const ok = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'success', data: { ticket_id: 'TCK-1001', email_sent: true } }), { status: 201 }));
    await expect(submitSupport('tok', { channel: 'Website' } as never, ok)).resolves.toEqual({ ticket_id: 'TCK-1001', email_sent: true });
    expect(ok.mock.calls[0][0]).toBe('https://truthscore.taggmedia.cloud/api/v1/support');
    expect(ok.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
    const bad = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'RATE_LIMITED' }), { status: 429 }));
    await expect(submitSupport('tok', {} as never, bad)).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    const down = vi.fn().mockRejectedValue(new TypeError('network'));
    await expect(submitSupport('tok', {} as never, down)).rejects.toMatchObject({ code: 'NETWORK' });
  });
});
