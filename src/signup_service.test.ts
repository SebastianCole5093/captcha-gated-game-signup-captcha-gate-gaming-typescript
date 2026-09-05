import assert from "node:assert/strict";
import { signup } from "./signup_service";

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, data: { score: 0.9 }, metadata: {} }), { status: 200 });
const result = await signup({ email: "player@example.com", password: "correct-horse", name: "Player", captcha_token: "token", widget_record_id: "widget-1" });
assert.equal(result.status, 201);
assert.equal(result.body.ok, true);
if (result.body.ok) assert.equal(result.body.data.queued, true);
globalThis.fetch = originalFetch;
console.log("signup decision test passed");
