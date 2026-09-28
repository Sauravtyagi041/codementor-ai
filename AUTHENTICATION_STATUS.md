# Password authentication status

Implemented 2026-09-13 at the user's explicit request to replace provider-only login with an app-owned email/password flow.

- Email is the login ID, normalized to lowercase. Signup requires name and a 12-character minimum password, capped at 72 UTF-8 bytes without silent truncation.
- bcryptjs cost 12 hashes with unique salts. Passwords are not returned, logged or stored as plaintext.
- Random 256-bit session tokens; only SHA-256 token digests in D1. Seven-day expiry, HttpOnly, SameSite=Lax, Path=/, Secure on HTTPS. Logout deletes the server session and clears the cookie. Account access checks no longer trust the old provider identity headers.
- Same-origin checks on auth POSTs, JSON-only signup/login, per-account and edge-IP rate limits. Old/expired rate buckets and sessions are cleaned during login/signup.
- Settings logout uses POST. Login/logout clear the shared tab's unsaved editor draft to avoid showing another account's code. Saved records remain in the server account.
- Existing provider-owned data is preserved, not assigned to new accounts based on a claimed email. New accounts start separately and link GitHub/Telegram under their own identity.
- Migration 0003_rainy_gladiator.sql generated and applied locally. Not remotely deployed.

Verification: scripts/check-auth.cjs passed signup, duplicate rejection, invalid password, case-insensitive email login, CSRF rejection, HttpOnly/SameSite cookie flags, two-account note isolation, anonymous and spoofed-header rejection, and logout revocation. Synthetic accounts and notes cleaned after testing.

Remaining: email ownership verification, password-reset email, password change UI, MFA, and production load/CPU-limit verification. Do not claim full production authentication readiness or that reset emails are being sent. Bcrypt computation must be benchmarked on the eventual deployment's runtime limits before public release. No paid service enabled.
