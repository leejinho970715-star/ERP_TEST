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

function validScores(value: unknown, allowUnknown = false): value is Array<number | null> {
  return Array.isArray(value) && value.length === 10 && value.every((score) =>
    (allowUnknown && score === null) || Number.isInteger(score) && Number(score) >= 0 && Number(score) <= 3
  );
}

function percent(scores: Array<number | null>, indices: number[]) {
  const known = indices.map((index) => scores[index]).filter((score): score is number => score !== null);
  return known.length ? Math.round(known.reduce((sum, score) => sum + score, 0) / (known.length * 3) * 100) : 0;
}

function companyScores(scores: Array<number | null>) {
  const known = scores.filter((score): score is number => score !== null);
  const unknown = scores.length - known.length;
  const axis = {
    "변화 추진력": percent(scores, [0, 1]),
    "디지털 기반": percent(scores, [2, 3, 4]),
    "AI 활용력": percent(scores, [5, 6, 7]),
    "조직 준비도": percent(scores, [8, 9]),
  };
  const profile = {
    "DX 기반": percent(scores, [2, 3, 4]),
    "AX 활용": percent(scores, [5, 6, 7]),
    "전환 기반": percent(scores, [0, 1, 8, 9]),
  };
  const total100 = known.length ? Math.round(known.reduce((sum, score) => sum + score, 0) / (known.length * 3) * 100) : 0;
  let level = total100 <= 26 ? 1 : total100 <= 53 ? 2 : total100 <= 79 ? 3 : 4;
  if (level === 4 && Object.values(axis).some((score) => score < 50)) level = 3;
  if (level === 3 && axis["AI 활용력"] < 34) level = 2;
  const profileType = profile["DX 기반"] >= 60
    ? profile["AX 활용"] >= 60 ? "AX/DX 선도형" : "AI 도약 준비형"
    : profile["AX 활용"] >= 60 ? "AI 선행형" : "기반 구축형";
  const deferred = unknown >= 3;
  return {
    total: deferred ? null : Math.round(total100 * .3),
    total_100: deferred ? null : total100,
    level: deferred ? null : level,
    axis_scores: deferred ? null : axis,
    profile_scores: deferred ? null : profile,
    profile_type: deferred ? "레벨 측정 보류" : profileType,
    unknown_count: unknown,
  };
}

function personalScores(scores: Array<number | null>) {
  const dx = percent(scores, [0, 1, 2, 3]);
  const ax = percent(scores, [4, 5, 6, 7, 8]);
  const common = percent(scores, [9]);
  const total = Math.round(scores.reduce((sum, score) => sum + Number(score), 0) / 30 * 100);
  const level = total <= 25 ? 1 : total <= 50 ? 2 : total <= 75 ? 3 : 4;
  const type = dx >= 70 ? ax >= 70 ? "AX/DX 실전 확장형" : "AI 성장 가속형" : ax >= 70 ? "AI 선행 실험형" : "업무 전환 성장형";
  return { total_100: total, dx_score: dx, ax_score: ax, common_score: common, level, type };
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
    const record = payload as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : "";
    const scores = record.answers;
    if (!id || !validScores(scores, !personal)) return json({ error: "invalid assessment answers" }, 400);
    const responseType = personal ? "personal" : "company";
    const { data: deleted, error: deletedError } = await db.from("axdx_deleted_responses")
      .select("id").eq("id", id).eq("response_type", responseType).maybeSingle();
    if (deletedError) return json({ error: deletedError.message }, 400);
    if (deleted) return json({ ok: true, ignored: true }, 200);
    const row = {
      ...selectFields(record, fields),
      ...(personal ? personalScores(scores) : companyScores(scores)),
    };
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
    const responseType = personal ? "personal" : "company";
    const tombstones = ids.map((id) => ({ id, response_type: responseType }));
    const { error: tombstoneError } = await db.from("axdx_deleted_responses")
      .upsert(tombstones, { onConflict: "id,response_type" });
    if (tombstoneError) return json({ error: tombstoneError.message }, 400);
    const { error } = await db.from(table).delete().in("id", ids);
    return error ? json({ error: error.message }, 400) : json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
