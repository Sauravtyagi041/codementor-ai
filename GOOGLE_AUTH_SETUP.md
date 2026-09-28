# Google sign-in setup
Create a Web application OAuth client in Google Cloud / Google Auth Platform. Configure branding and audience; while in Testing add your own Google email as a test user.

Authorized redirect URI: http://localhost:5173/api/google/callback

Set these server-only variables in .env.local (never in client code or chat):
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5173/api/google/callback

Restart the dev server after saving. Use Continue with Google on the login page. For deployment create the exact HTTPS callback for the deployed domain and configure server secrets there.

New Google accounts store their Google subject, name, verified email, and application session hashes. Their password_hash is NULL. Google access tokens are used only for the profile request and are not saved. Existing password accounts retain their hashes and are not automatically merged by email. Google-only accounts recover access through Google, not the app password-reset flow.

Live Google sign-in is not verified until credentials are configured. Password reset email separately requires RESEND_API_KEY, AUTH_EMAIL_FROM and APP_ORIGIN.
