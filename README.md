# CodeMentor AI

A coding-learning prototype with topic practice, multi-language Code Studio, AI mentoring, notes, activity tracking and authentication.

## Live app

[Open CodeMentor AI](https://codementor-practice-studio.sauravtyagi041.chatgpt.site)

Use the deployed link above to try the app. The development instructions below are for running your own copy.

## Local development

Requires Node.js 22.13+ and npm.

1. Run npm ci.
2. Copy .env.example to .env.local. Configure optional integrations; never commit secrets.
3. Run npm run build.
4. Apply each SQL migration in drizzle/ in numeric order, once per local database:

    npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/<migration>.sql

5. Run npm run dev and open the development address printed in your terminal.

## Features

- Separate Google and email sign-in/sign-up options, with email verification required before email accounts can sign in.
- Email/password sessions with bcrypt hashes; Google OAuth accounts without stored Google passwords.
- Password-reset flow with expiring, single-use links and session revocation; email delivery still needs configuration.
- Code Studio: original exercises, custom tests, formatting, stopwatch, problem drawer.
- JavaScript browser execution; remote Judge0 and Compiler Explorer runtimes.
- Server-selected submission suites and CodeMentor acceptance history.
- LeetCode, Codeforces, GeeksforGeeks and a small CodeChef question-link collection.
- Cloudflare Workers AI mentoring and clearly labelled generated original exercises.
- User-owned notes, saved solutions, progress and optional GitHub synchronization.

## Recent updates

- Simplified sign-in and account-creation screens with explicit Google/email choices.
- Added email verification and prevented unverified email accounts from opening the workspace.
- Improved Code Studio problem selection, description navigation, saved drafts and compact custom tests.

## Validation

Run npx tsc --noEmit, node scripts/check-guided.cjs, and npm run build.

## Prototype limitations

Third-party compiler and AI quotas apply. Generated content needs review. External question metadata is not full imported statements. Fixed-suite acceptance is not proof of correctness for every input or acceptance on another platform. GitHub sync needs user authorization and a selected repository/branch. Telegram automatic reminders are incomplete. Password recovery needs an email provider. The app is publicly deployed. Email verification and password-reset delivery are not yet enabled: a configured email provider and verified sender are still required.

See CODE_STUDIO_AUDIT.md, COMPILER_STATUS.md and GOOGLE_AUTH_SETUP.md for further detail.
