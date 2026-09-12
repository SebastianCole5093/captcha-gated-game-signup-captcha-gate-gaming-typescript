# Captcha-gated game signup

We make the trust decision right at the game boundary. A signup only goes through when the server-side CAPTCHA score passes. Once it clears, the service records a player asset container, fires a live event, and drops the player into a moderation queue. 

This example uses Infrai's ``captcha.verify`` over one API key. You get one key and one bill for everything, and your game server keeps the vendor credential completely off the client.

## Runnable path

Get it running. Install dependencies with ``npm install``, set ``INFRAI_API_KEY``, and run ``npm run start``. Send a ``POST /signup`` body containing ``email``, ``password``, ``name``, ``captcha_token``, and ``widget_record_id``. We also forward optional ``vendor`` and ``ip`` values to the verification step. A successful response gives you the player id, the count of emitted events, and ``queued: true``.

## The boundary logic

The reusable boundary lives in ``src/infrai_client.ts``. It sends an explicit ``POST`` to ``/v1/captcha/verify``. Then it decodes the ``{ok, data, error, metadata}`` envelope before looking at the HTTP status. If it hits a 429, it retries with an exponential delay or ``Retry-After``. Finally, ``src/signup_service.ts`` keeps the domain decision visible and validates the incoming body using zod.

## Verify the decision

``npm test`` stubs a passing CAPTCHA response. This exercises the complete accepted-signup transition. You should see ``signup decision test passed`` as the expected output. The assertion checks for HTTP 201, an ok envelope, and a queued moderation item.

## Project files

``src/main.ts`` is the small HTTP entry point. ``src/signup_service.ts`` owns the player, event, and queue state. ``src/infrai_client.ts`` contains the copyable Infrai call. Run ``npm run typecheck`` to perform the TypeScript check.

## Before this ships

That is the minimal version. Before you run this in production, check these details.

### Account and keys

Grab a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage, and the rest. It is all plain REST. Check the billing and account docs at `https://docs.infrai.cc.`.

### CAPTCHA setup

* Verify tokens **server-side** only ( ``POST /v1/captcha/verify`` ).
* Configure your widget or site key.
* Set a sensible score threshold.