import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (req.method === "POST") {
    const payload = await req.json();
    const allowed = {
      id: payload.id,
      created_at: payload.created_at,
      company: payload.company,
      manager: payload.manager,
      phone: payload.phone,
      email: payload.email,
      answers: payload.answers,
      answer_labels: payload.answer_labels,
      total: payload.total,
      level: payload.level,
      axis_scores: payload.axis_scores,
      unknown_count: payload.unknown_count,
    };
    const { error } = await db.from("axdx_responses").insert(allowed);
    return Response.json(error ? { error: error.message } : { ok: true }, {
      status: error ? 400 : 201,
      headers: cors,
    });
  }

  if (req.method === "GET") {
    const expected = Deno.env.get("ADMIN_TOKEN");
    const supplied = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!expected || supplied !== expected) {
      return Response.json({ error: "unauthorized" }, { status: 401, headers: cors });
    }
    const { data, error } = await db.from("axdx_responses").select("*").order("created_at");
    return Response.json(error ? { error: error.message } : data, {
      status: error ? 400 : 200,
      headers: cors,
    });
  }

  if (req.method === "DELETE") {
    const expected = Deno.env.get("ADMIN_TOKEN");
    const supplied = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!expected || supplied !== expected) {
      return Response.json({ error: "unauthorized" }, { status: 401, headers: cors });
    }
    const { ids } = await req.json();
    if (!Array.isArray(ids) || !ids.length || ids.length > 100) {
      return Response.json({ error: "invalid ids" }, { status: 400, headers: cors });
    }
    const { error } = await db.from("axdx_responses").delete().in("id", ids);
    return Response.json(error ? { error: error.message } : { ok: true }, {
      status: error ? 400 : 200,
      headers: cors,
    });
  }

  return new Response("Method not allowed", { status: 405, headers: cors });
});
