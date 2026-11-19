import { describe, it, expect, vi } from 'vitest';
import { BILLING_UNREACHABLE, deleteAccount, deleteErrorCopy, needsFreshSignIn, signInAgeSeconds } from './account';

const NOW = 1_800_000_000_000;
const jwt = (payload: object) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.sig`;

describe('account deletion lib', () => {
  it('reads the newest amr timestamp', () => {
    expect(signInAgeSeconds(jwt({ amr: [{ timestamp: NOW / 1000 - 900 }, { timestamp: NOW / 1000 - 30 }] }), NOW)).toBe(30);
    expect(signInAgeSeconds(jwt({ iat: 1 }), NOW)).toBeNull();
    expect(signInAgeSeconds('garbage', NOW)).toBeNull();
  });

  it('asks for a fresh sign-in past 10 minutes or with no sign-in time', () => {
    expect(needsFreshSignIn(jwt({ amr: [{ timestamp: NOW / 1000 - 60 }] }), NOW)).toBe(false);
    expect(needsFreshSignIn(jwt({ amr: [{ timestamp: NOW / 1000 - 601 }] }), NOW)).toBe(true);
    expect(needsFreshSignIn(jwt({}), NOW)).toBe(true);
  });

  it('sends DELETE with the bearer and the confirmation', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'success', data: { deleted: true, email_sent: true } })));
    await expect(deleteAccount('tok', f)).resolves.toEqual({ email_sent: true, billing_unverified: false });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://truthscore.taggmedia.cloud/api/v1/user/account');
    expect(init.method).toBe('DELETE');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toEqual({ confirm: 'DELETE' });
  });

  it('surfaces engine codes and network failures', async () => {
    const reauth = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'error', code: 'REAUTH_REQUIRED' }), { status: 401 }));
    await expect(deleteAccount('tok', reauth)).rejects.toMatchObject({ code: 'REAUTH_REQUIRED' });
    await expect(deleteAccount('tok', vi.fn().mockRejectedValue(new TypeError('x')))).rejects.toMatchObject({ code: 'NETWORK' });
    await expect(deleteAccount('tok', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })))).rejects.toMatchObject({ code: 'HTTP_502' });
  });

  it('every failure offers the email route', () => {
    expect(deleteErrorCopy('NETWORK')).toContain('support@truthscore.ai');
    expect(deleteErrorCopy('SUBSCRIPTION_ACTIVE')).toContain('support@truthscore.ai');
  });

  it('surfaces BILLING_UNREACHABLE (503) as its own code', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'error', code: 'BILLING_UNREACHABLE' }), { status: 503 }));
    await expect(deleteAccount('tok', f)).rejects.toMatchObject({ code: BILLING_UNREACHABLE });
  });

  it('re-sends with confirm_billing_unreachable and reports billing_unverified', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 'success', data: { deleted: true, email_sent: true, billing_unverified: true },
    })));
    await expect(deleteAccount('tok', f, { confirmBillingUnreachable: true }))
      .resolves.toEqual({ email_sent: true, billing_unverified: true });
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ confirm: 'DELETE', confirm_billing_unreachable: true, channel: 'Website' });
  });

  it('returns support_ticket_id when the engine opened a ticket', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 'success', data: { deleted: true, email_sent: true, billing_unverified: true, support_ticket_id: 'TCK-1042' },
    })));
    await expect(deleteAccount('tok', f, { confirmBillingUnreachable: true }))
      .resolves.toEqual({ email_sent: true, billing_unverified: true, support_ticket_id: 'TCK-1042' });
  });

  it('omits support_ticket_id when it is missing or not a string', async () => {
    for (const support_ticket_id of [undefined, null, '', 42]) {
      const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({
        status: 'success', data: { deleted: true, email_sent: true, billing_unverified: true, support_ticket_id },
      })));
      const r = await deleteAccount('tok', f, { confirmBillingUnreachable: true });
      expect(r).toEqual({ email_sent: true, billing_unverified: true });
      expect('support_ticket_id' in r).toBe(false);
    }
  });

  it('with the flag, an active subscription still gets the existing copy', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'error', code: 'SUBSCRIPTION_ACTIVE' }), { status: 409 }));
    await expect(deleteAccount('tok', f, { confirmBillingUnreachable: true })).rejects.toMatchObject({ code: 'SUBSCRIPTION_ACTIVE' });
    expect(deleteErrorCopy('SUBSCRIPTION_ACTIVE')).toContain('active subscription');
  });
});
