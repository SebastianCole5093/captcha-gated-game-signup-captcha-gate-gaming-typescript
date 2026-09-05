import { createServer } from "node:http";
import { signup } from "./signup_service";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/signup") { res.writeHead(404).end(); return; }
  let text = "";
  for await (const chunk of req) text += chunk;
  try {
    const result = await signup(JSON.parse(text));
    res.writeHead(result.status, { "Content-Type": "application/json" }).end(JSON.stringify(result.body));
  } catch { res.writeHead(502, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: false, error: "UPSTREAM_ERROR" })); }
});
server.listen(3000, () => console.log("signup service listening on http://localhost:3000/signup"));
