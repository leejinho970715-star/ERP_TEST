import { calculate, validateAnswers, normalizeAnswers, leadGrade } from '../_shared/erp-rules.js';

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'apikey, content-type, x-admin-token', 'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS', 'cache-control': 'no-store' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validText = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!['GET','POST','DELETE'].includes(req.method)) return json({error:'Method not allowed'},405);
  const base = Deno.env.get('SUPABASE_URL');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !secret) return json({error:'Server configuration unavailable'},503);
  const headers = { apikey: secret, authorization: `Bearer ${secret}`, 'content-type': 'application/json' };
  const endpoint = `${base}/rest/v1/erp_consulting_responses`;
  try {
    if (req.method !== 'POST') {
      const expected = Deno.env.get('ADMIN_TOKEN');
      if (!expected || req.headers.get('x-admin-token') !== expected) return json({error:'unauthorized'},401);
    }
    if (req.method === 'DELETE') {
      // 관리자 화면에서 선택한 응답만 id로 지웁니다. 한 번에 최대 200건입니다.
      const text = await req.text();
      if (text.length > 16384) return json({error:'Payload too large'},413);
      let body;
      try { body = JSON.parse(text); } catch { return json({error:'Invalid JSON'},400); }
      const ids = body?.ids;
      if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200 || new Set(ids).size !== ids.length || !ids.every(id => typeof id === 'string' && uuid.test(id))) return json({error:'Invalid response ids'},400);
      const response = await fetch(`${endpoint}?id=in.(${ids.join(',')})&select=id`, {method:'DELETE',headers:{...headers,Prefer:'return=representation'}});
      if (!response.ok) return json({error:'Could not delete responses'},502);
      const deleted = (await response.json()).map((row: {id: string}) => row.id);
      return json({deleted});
    }
    if (req.method === 'GET') {
      const offset = Number(new URL(req.url).searchParams.get('offset') || 0);
      if (!Number.isInteger(offset) || offset < 0 || offset > 100000) return json({error:'Invalid pagination'},400);
      const response = await fetch(`${endpoint}?select=*&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&order=created_at.desc,id.desc&offset=${offset}&limit=201`, {headers});
      if (!response.ok) return json({error:'Could not load responses'},502);
      const rows = await response.json();
      return json({rows:rows.slice(0,200),nextOffset:rows.length>200?offset+200:null});
    }
    if (Number(req.headers.get('content-length') || 0) > 16384) return json({error:'Payload too large'},413);
    const text = await req.text();
    if (text.length > 16384) return json({error:'Payload too large'},413);
    let body;
    try { body = JSON.parse(text); } catch { return json({error:'Invalid JSON'},400); }
    if (!body || typeof body.id !== 'string' || !uuid.test(body.id)) return json({error:'Invalid response id'},400);
    if (!validateAnswers(body.answers)) return json({error:'Invalid assessment'},400);
    // 브라우저가 전달한 결과 대신 서버의 공유 규칙으로 다시 계산합니다.
    const result = calculate(body.answers);
    const answers = normalizeAnswers(body.answers);
    const row: Record<string, unknown> = {id:body.id,answers,score:0,breakdown:result,recommended_products:result.products,rule_version:result.ruleVersion,result_type:result.type,size_tier:result.tier,entry_path:result.transfer?'C-transfer':result.path,timeline:answers.timeline ?? null};
    if (body.lead === undefined) {
      // 연락처 없는 응답 저장: 같은 id가 이미 있으면(리드 신청이 먼저 저장된 경우 등) 덮어쓰지 않습니다.
      const response = await fetch(endpoint, {method:'POST',headers:{...headers,Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({...row,lead_type:'none',privacy_agreed:false})});
      return response.ok ? json({ok:true,result},201) : json({error:'Could not save assessment'},502);
    }
    const lead = body.lead, needsContact = ['consult','demo'].includes(lead?.type), optional = (v: unknown, max: number) => v === null || v === undefined || validText(v,max);
    if (!lead || !['report','consult','demo','newsletter'].includes(lead.type) || !validText(lead.email,254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim()) || lead.privacy_agreed !== true || typeof lead.marketing_agreed !== 'boolean' || (lead.type === 'newsletter' && !lead.marketing_agreed)) return json({error:'Invalid lead'},400);
    if (!(lead.type === 'newsletter' ? optional(lead.company,100) : validText(lead.company,100)) || !optional(lead.job_title,40) || !(needsContact ? validText(lead.manager,60) && typeof lead.phone === 'string' && /^[0-9+\-\s()]{9,20}$/.test(lead.phone.trim()) : lead.manager == null && lead.phone == null)) return json({error:'Invalid lead'},400);
    const consented = Date.parse(lead.consented_at);
    if (!Number.isFinite(consented) || consented > Date.now()+300000 || consented < Date.now()-86400000) return json({error:'Invalid consent timestamp'},400);
    const trim = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : null;
    const contact = {lead_type:lead.type,company:trim(lead.company),email:lead.email.trim(),job_title:trim(lead.job_title),manager:trim(lead.manager),phone:trim(lead.phone),privacy_agreed:true,marketing_agreed:lead.marketing_agreed,consented_at:new Date(consented).toISOString()};
    const response = await fetch(`${endpoint}?on_conflict=id`, {method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({...row,...contact,lead_grade:leadGrade({type:lead.type,email:contact.email,phone:contact.phone},answers,result)})});
    return response.ok ? json({ok:true,result},201) : json({error:'Could not save lead'},502);
  } catch { return json({error:'Service temporarily unavailable'},503); }
});
