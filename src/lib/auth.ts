import crypto from 'crypto';

const COOKIE_NAME = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = import.meta.env?.AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET env var is not set');
  return secret;
}

function sign(value: string): string {
  const secret = getSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64url');
  return `${value}.${signature}`;
}

function verify(signed: string): string | null {
  const dot = signed.lastIndexOf('.');
  if (dot === -1) return null;
  const value = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(value)
    .digest('base64url');
  if (sig !== expected) return null;
  return value;
}

export function createSessionCookie(): string {
  const payload = JSON.stringify({ iat: Date.now() });
  const encoded = Buffer.from(payload).toString('base64url');
  const signed = sign(encoded);
  return `${COOKIE_NAME}=${signed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function destroySessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function validateSession(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const raw = verify(match[1]);
  if (!raw) return false;
  try {
    const payload = JSON.parse(Buffer.from(raw, 'base64url').toString());
    return typeof payload.iat === 'number';
  } catch {
    return false;
  }
}
