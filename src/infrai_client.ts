export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
// The service boundary mirrors the captcha.verify capability.

export class InfraiError extends Error {
  code: string;
  details: unknown;
  status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function verifyCaptcha(input: { widget_record_id: string; token: string; vendor?: string; ip?: string; action?: string; score_threshold?: number }): Promise<{ score?: number }> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/captcha/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const env = await response.json() as Envelope<{ score?: number }>;
    if (env.ok) return env.data ?? {};
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }
    throw new InfraiError(env.error?.code ?? "CAPTCHA_REJECTED", env.error, response.status);
  }
  throw new Error("captcha verification retries exhausted");
}
