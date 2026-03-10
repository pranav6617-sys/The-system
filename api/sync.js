const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisSet(key, value) {
  return fetch(`${REDIS_URL}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}

async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result ? JSON.parse(json.result) : null;
}

export default async function handler(req, res) {
  if (!REDIS_URL || !REDIS_TOKEN) return res.status(500).json({ error: "Redis not configured" });
  if (req.method === "POST") {
    try {
      await redisSet("the-system-data", JSON.stringify(req.body));
      return res.status(200).json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  if (req.method === "GET") {
    try {
      const data = await redisGet("the-system-data");
      return res.status(200).json({ data: data || {} });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
