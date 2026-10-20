-- ERP 진단 전용 테이블. 기존 AX/DX 테이블은 수정하지 않습니다.
create table if not exists public.erp_consulting_responses (
  id uuid primary key,
  created_at timestamptz not null default now(),
  company text not null check (char_length(company) between 1 and 100),
  manager text not null check (char_length(manager) between 1 and 60),
  email text not null check (char_length(email) between 3 and 254),
  answers jsonb not null,
  score integer not null check (score between 0 and 100),
  breakdown jsonb not null,
  recommended_products jsonb not null,
  rule_version text not null,
  privacy_agreed boolean not null check (privacy_agreed = true),
  consented_at timestamptz not null,
  expires_at timestamptz not null default (now() + interval '1 year')
);
create index if not exists erp_consulting_created_at_idx on public.erp_consulting_responses (created_at desc, id desc);
create index if not exists erp_consulting_expires_at_idx on public.erp_consulting_responses (expires_at);
alter table public.erp_consulting_responses enable row level security;
revoke all on public.erp_consulting_responses from anon, authenticated;
grant select, insert, delete on public.erp_consulting_responses to service_role;
comment on table public.erp_consulting_responses is 'ERP virtual consulting responses; access through erp-consulting Edge Function only';
