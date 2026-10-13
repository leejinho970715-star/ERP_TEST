import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-admin-token",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: cors });

const companyFields = [
  "id", "created_at", "company", "manager", "phone", "email", "answers",
  "answer_labels", "total", "total_100", "level", "axis_scores",
  "profile_scores", "profile_type", "unknown_count",
];

const personalFields = [
  "id", "created_at", "name", "phone", "email", "role", "privacy_agreed",
  "answers", "total_100", "dx_score", "ax_score", "common_score", "level", "type",
];

function selectFields(payload: Record<string, unknown>, fields: string[]) {
  return Object.fromEntries(fields.map((field) => [field, payload[field]]));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  const personal = url.searchParams.get("type") === "personal";
  const table = personal ? "personal_axdx_responses" : "axdx_responses";
  const fields = personal ? personalFields : companyFields;
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (req.method === "POST") {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return json({ error: "invalid payload" }, 400);
    const row = selectFields(payload as Record<string, unknown>, fields);
    const { error } = await db.from(table).upsert(row, { onConflict: "id" });
    return error ? json({ error: error.message }, 400) : json({ ok: true }, 201);
  }

  const expected = Deno.env.get("ADMIN_TOKEN");
  const supplied = req.headers.get("x-admin-token");
  if (!expected || supplied !== expected) return json({ error: "unauthorized" }, 401);

  if (req.method === "GET") {
    const { data, error } = await db.from(table).select("*").order("created_at");
    return error ? json({ error: error.message }, 400) : json(data);
  }

  if (req.method === "DELETE") {
    const body = await req.json().catch(() => null);
    const ids = body?.ids;
    if (!Array.isArray(ids) || !ids.length || ids.length > 100) {
      return json({ error: "invalid ids" }, 400);
    }
    const { error } = await db.from(table).delete().in("id", ids);
    return error ? json({ error: error.message }, 400) : json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
