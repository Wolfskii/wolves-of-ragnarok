# Authentication

## Design

Passwords use Argon2id through `@node-rs/argon2`. Session tokens are 32 random bytes encoded as base64url. Browsers receive the opaque token; PostgreSQL stores only an HMAC-SHA256 hash keyed by `AUTH_SECRET`.

The session cookie is named `wor_session`, is HTTP-only, uses `SameSite=Lax`, applies to `/`, and is secure outside development. Default expiry is controlled by `SESSION_DAYS`.

## Request Identity

`hooks.server.ts` validates the cookie and sets `event.locals.user` to a deliberately limited safe user projection. Protected profile and admin routes are guarded there. Every server action must still recheck the required user/role.

## Flows

- Registration normalizes email and username, validates a 12+ character password, creates a member and activity, and starts a session.
- Login returns one generic credential error to avoid account enumeration.
- Logout deletes the database session and cookie using POST.
- Password change verifies the current hash, updates it, revokes every session, and creates one replacement session.
- Forgot-password delivery is excluded from v1.

## Operational Notes

Generate `AUTH_SECRET` with a cryptographically secure tool such as `openssl rand -hex 32`. Rotating it invalidates all sessions. Never log raw passwords, cookies, or token hashes.
