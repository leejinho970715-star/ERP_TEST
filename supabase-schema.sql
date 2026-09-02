create table if not exists public.axdx_responses (
  id uuid primary key,
  created_at timestamptz not null default now(),
  company text not null,
  manager text not null,
  phone text not null,
  email text not null,
  answers jsonb not null,
  answer_labels jsonb not null,
  total integer not null check (total between 0 and 30),
  level integer not null check (level between 1 and 4),
  axis_scores jsonb not null,
  unknown_count integer not null default 0
);
alter table public.axdx_responses enable row level security;
-- 브라우저에는 service_role 키를 절대 노출하지 마세요. 삽입/조회는 Edge Function에서 수행합니다.
