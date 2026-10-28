-- v3.1 (2026-10-28): 가이드라인 “전화번호는 무료 상담을 신청할 때만 받습니다”에 맞춰 데모 요청은 담당자명까지만 받습니다.
-- erp-schema-v3.sql을 이미 실행한 DB에서 이 파일만 SQL Editor로 실행합니다. 여러 번 실행해도 안전합니다.
begin;
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
commit;
