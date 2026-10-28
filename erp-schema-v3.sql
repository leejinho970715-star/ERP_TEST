-- ERP 추천 테스트 v3(기획 가이드라인 2026-10-23) 마이그레이션.
-- 결과 요약은 입력 없이 공개하고 응답을 먼저 저장한 뒤, 리포트·상담·데모·소식 받기 신청 때 같은 행에 연락처를 더합니다.
-- Supabase 대시보드 SQL Editor에서 한 번 실행합니다. 여러 번 실행해도 안전합니다. 기존 응답은 지우지 않습니다.
begin;

alter table public.erp_consulting_responses
  alter column company drop not null,
  alter column manager drop not null,
  alter column email drop not null,
  alter column consented_at drop not null,
  add column if not exists phone text,
  add column if not exists job_title text,
  add column if not exists lead_type text not null default 'none',
  add column if not exists lead_grade text,
  add column if not exists marketing_agreed boolean not null default false,
  add column if not exists result_type text,
  add column if not exists size_tier text,
  add column if not exists entry_path text,
  add column if not exists timeline text;

-- v3 이전 응답은 연락처를 먼저 받던 방식이므로 '이전 버전'으로 표시합니다.
update public.erp_consulting_responses set lead_type = 'legacy' where rule_version <> 'erp-2026-10-v3' and lead_type = 'none';

-- 응답만 저장한 행(lead_type = 'none')은 개인정보 동의가 없으므로 기존 동의 필수 조건을 바꿉니다.
alter table public.erp_consulting_responses drop constraint if exists erp_consulting_responses_privacy_agreed_check;
alter table public.erp_consulting_responses drop constraint if exists erp_consulting_v3_lead_check;
alter table public.erp_consulting_responses add constraint erp_consulting_v3_lead_check check (
  lead_type in ('none','report','consult','demo','newsletter','legacy')
  and (lead_grade is null or lead_grade in ('A','B','C','이관'))
  and (lead_type in ('none') or (privacy_agreed and email is not null and consented_at is not null))
  and (lead_type <> 'consult' or (manager is not null and phone is not null))
  and (lead_type <> 'demo' or manager is not null)
  and (phone is null or char_length(phone) between 9 and 20)
  and (job_title is null or char_length(job_title) <= 40)
);

create index if not exists erp_consulting_lead_type_idx on public.erp_consulting_responses (lead_type);
-- 리드 신청 시 같은 응답 행을 갱신(upsert)합니다.
grant select, insert, update, delete on public.erp_consulting_responses to service_role;

commit;
