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
  total_100 integer not null check (total_100 between 0 and 100),
  level integer not null check (level between 1 and 4),
  axis_scores jsonb not null,
  profile_scores jsonb not null,
  profile_type text not null,
  unknown_count integer not null default 0
);

create index if not exists axdx_responses_created_at_idx
  on public.axdx_responses (created_at desc);

alter table public.axdx_responses enable row level security;

create table if not exists public.personal_axdx_responses (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  role text not null,
  privacy_agreed boolean not null default false,
  answers jsonb not null,
  total_100 integer not null check (total_100 between 0 and 100),
  dx_score integer not null check (dx_score between 0 and 100),
  ax_score integer not null check (ax_score between 0 and 100),
  common_score integer not null check (common_score between 0 and 100),
  level integer not null check (level between 1 and 4),
  type text not null
);

create index if not exists personal_axdx_responses_created_at_idx
  on public.personal_axdx_responses (created_at desc);

alter table public.personal_axdx_responses enable row level security;

-- 브라우저에는 service_role 키를 절대 노출하지 마세요.
-- 삽입/조회/삭제는 Edge Function에서만 수행합니다.
