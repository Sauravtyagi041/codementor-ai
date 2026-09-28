# AI Mentor connection

The mentor backend uses Cloudflare Workers AI REST with `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. The product label remains AI Mentor. Scout, Gemini and OpenRouter are not used by this route, and no paid fallback is configured.

In the Cloudflare dashboard, open Workers AI and choose Use REST API. Create an account-scoped token with Workers AI Read permission and copy the account ID. Follow https://developers.cloudflare.com/workers-ai/get-started/rest-api/.

Replace the matching placeholders in `.env.local` with `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_TOKEN`, then restart the development server. Keep credentials out of chat, source control and browser code. For hosting, configure these as server secrets.

Use Workers Free to prevent paid overages. The free allocation is 10,000 Neurons per day, not 10,000 tokens. The app applies input and output limits and 40 requests per user per day. Context size is not a promise of daily token allowance. Llama 3.1 8B Fast consumes fewer Neurons per input and output token than Scout at the currently documented rates. See https://developers.cloudflare.com/workers-ai/platform/pricing/.

The TypeScript check passed after the provider migration. A real API response has not yet been verified because Cloudflare credentials have not been supplied. Configuration readiness alone does not prove authentication or available quota.
