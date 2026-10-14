import { describe, it, expect, vi } from 'vitest';
import { deleteAccount, deleteErrorCopy, needsFreshSignIn, signInAgeSeconds } from './account';

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
    await expect(deleteAccount('tok', f)).resolves.toEqual({ email_sent: true });
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
});
