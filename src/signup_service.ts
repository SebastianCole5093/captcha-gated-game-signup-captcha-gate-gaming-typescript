import { z } from "zod";
import { InfraiError, verifyCaptcha } from "./infrai_client";

export const SignupBody = z.object({
  email: z.string().email(), password: z.string().min(8), name: z.string().min(1),
  captcha_token: z.string().min(1), widget_record_id: z.string().min(1), vendor: z.string().optional(), ip: z.string().optional()
});
export type Signup = z.infer<typeof SignupBody>;

type Player = { id: string; email: string; assets: string[] };
const players = new Map<string, Player>();
const events: Array<{ type: string; player_id: string }> = [];
const moderationQueue: Array<{ player_id: string; reason: string }> = [];

export async function signup(raw: unknown) {
  const parsed = SignupBody.safeParse(raw);
  if (!parsed.success) return { status: 400, body: { ok: false, error: "INVALID_ARGUMENT" } };
  const input = parsed.data;
  try {
    await verifyCaptcha({ widget_record_id: input.widget_record_id, token: input.captcha_token, vendor: input.vendor, ip: input.ip, action: "signup", score_threshold: 0.5 });
  } catch (error) {
    if (error instanceof InfraiError) return { status: Math.max(400, error.status), body: { ok: false, error: error.code } };
    throw error;
  }
  const id = `player_${input.email}`;
  if (!players.has(id)) players.set(id, { id, email: input.email, assets: [] });
  events.push({ type: "player.created", player_id: id });
  moderationQueue.push({ player_id: id, reason: "new signup" });
  return { status: 201, body: { ok: true, data: { player: players.get(id), event_count: events.length, queued: true } } };
}
