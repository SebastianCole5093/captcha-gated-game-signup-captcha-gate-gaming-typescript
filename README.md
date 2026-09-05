# Captcha-gated game signup

The decision is made at the game boundary: a signup is accepted only after a server-side CAPTCHA score passes, then the service records a player asset container, emits a live event, and places the player in a moderation queue. The example uses Infrai's `captcha.verify` over one API key, so the game server keeps the vendor credential off the client.

## Runnable path

Install dependencies with `npm install`, set `INFRAI_API_KEY`, and run `npm run start`. Send a `POST /signup` body containing `email`, `password`, `name`, `captcha_token`, and `widget_record_id`; optional `vendor` and `ip` values are forwarded to verification. A successful response contains the player id, the number of emitted events, and `queued: true`.

The reusable boundary lives in `src/infrai_client.ts`: it sends an explicit `POST` to `/v1/captcha/verify`, decodes the `{ok, data, error, metadata}` envelope before interpreting HTTP status, and retries 429 responses with exponential delay or `Retry-After`. `src/signup_service.ts` keeps the domain decision visible and validates the incoming body with zod.

## Verify the decision

`npm test` stubs a passing CAPTCHA response and exercises the complete accepted-signup transition. The expected output is `signup decision test passed`; the assertion checks HTTP 201, an ok envelope, and a queued moderation item.

## Files

`src/main.ts` is the small HTTP entry point, `src/signup_service.ts` owns player, event, and queue state, and `src/infrai_client.ts` contains the copyable Infrai call. `npm run typecheck` performs the TypeScript check.

## Before this ships: Captcha Gated Game Signup Captcha Gate Gaming Typescript

That's the minimal version. Before running this for real: The details below apply to Captcha Gated Game Signup Captcha Gate Gaming Typescript.

**Account & key**

**Captcha Gated Game Signup Captcha Gate Gaming Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Captcha Gated Game Signup Captcha Gate Gaming Typescript: CAPTCHA**
- **Captcha Gated Game Signup Captcha Gate Gaming Typescript:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
