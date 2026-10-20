# ERP_TEST 작업 환경

## 저장소

- 작업·푸시 대상: `https://github.com/leejinho970715-star/ERP_TEST.git` (`origin`)
- 원본 참조: `https://github.com/leejinho970715-star/AX-DX_TEST.git` (`upstream`)
- 기본 작업 브랜치: `main`
- 가져온 원본 커밋: `772ea837e2001591340773b2aa9b61366cc1fbb9`
- 초기 가져오기에서는 원본 커밋 이력, 정적 페이지, 이미지, SQL 및 함수 소스를 유지했습니다.

현재 작업 폴더의 기본 push 대상은 `origin`입니다. 추가 기능은 필요에 따라 `codex/기능명` 브랜치에서 개발할 수 있습니다.

```powershell
git status
git add <변경한 파일>
git commit -m "변경 내용"
git push origin main
```

## 실행 및 배포

HTML/CSS/JavaScript로 구성된 정적 사이트입니다. 패키지 설치나 빌드 과정은 없습니다. Python 3이 설치된 환경에서는 저장소 루트에서 다음과 같이 실행합니다.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

`http://localhost:4173/`, `/personal.html`, `/admin.html`에서 각 화면을 엽니다.

ERP_TEST를 Vercel에 별도 배포하려면 새 Vercel 프로젝트에서 이 저장소를 가져옵니다. Framework Preset은 `Other`, 루트는 저장소 루트, Build Command는 비워두고 Output Directory는 `.`로 지정합니다. 현재 정적 설정은 `config.js`를 사용하므로 프런트엔드용 추가 환경변수는 필요하지 않습니다. 이번 초기 세팅에서는 새 Vercel 프로젝트나 도메인을 생성하지 않았습니다.

## 기존 Supabase 연결 유지

- 프로젝트: `uzvonfdifmbqdrsxzbcm`
- API URL: `https://uzvonfdifmbqdrsxzbcm.supabase.co`
- 공통 Edge Function: `/functions/v1/axdx-responses`
- 기업 응답: 위 함수의 기본 경로
- 개인 응답: 위 함수에 `?type=personal` 추가
- 브라우저 설정: `config.js`의 공개 publishable key와 네 개 endpoint
- 서버 소스: `supabase/functions/axdx-responses/index.ts`

`config.js`는 원본과 동일합니다. 공개 publishable key는 브라우저에서 사용하는 키이며, 서버 `service_role` 키나 관리자 토큰과 다릅니다. 기존 함수의 서버 환경변수와 관리자 토큰은 서버에 그대로 남아 있습니다.

이는 별도 DB 복제가 아니라 **기존 DB를 공유하는 연결**입니다. 제출·수정·관리자 삭제는 기존 사이트에도 영향을 줍니다. 스키마 SQL 재실행, Edge Function 재배포, 데이터 초기화는 초기 세팅에 필요하지 않으며 수행하지 않았습니다. DB나 함수의 후속 변경은 공유 영향을 확인한 뒤 진행해야 합니다.

## DB 구조

`supabase-schema.sql`을 원본 그대로 보존했습니다. 아래 내용은 해당 파일 기준이며 운영 DB 전체 스키마를 추출한 결과는 아닙니다.

| 테이블 | 기본 키 | 주요 데이터 |
| --- | --- | --- |
| `public.axdx_responses` | `id` (uuid) | 기업·담당자·연락처, 응답 JSON, 응답 라벨, 총점·레벨·축별 점수·프로필·모름 개수 |
| `public.personal_axdx_responses` | `id` (uuid) | 이름·연락처·직무·개인정보 동의, 응답 JSON, 총점·DX/AX/공통 점수·레벨·유형 |
| `public.axdx_deleted_responses` | `(id, response_type)` | 삭제한 기업/개인 응답의 식별자·삭제 시각; 재전송 시 복원 방지 |

SQL에는 응답 테이블 두 개의 `created_at desc` 인덱스와 세 테이블의 RLS 활성화가 포함되어 있습니다. 프런트엔드는 테이블을 직접 수정하지 않고 Edge Function을 호출합니다. 함수는 점수를 서버에서 계산하고, 관리자 조회·삭제에 `x-admin-token`을 검사합니다.

## 검증 기록 — 2026-10-20

- 기존 배포 사이트: HTTP 200.
- 배포된 `config.js`와 가져온 파일: 개행 정규화 후 동일.
- 기업·개인 함수 OPTIONS: HTTP 200, CORS `*`.
- 관리자 토큰 없는 기업·개인 GET: HTTP 401 `unauthorized`.
- 빈 객체를 보낸 기업·개인 POST: HTTP 400 `invalid assessment answers`. 함수 소스상 DB 접근 전 유효성 검사에서 종료하는 요청입니다.
- 공개 API의 세 테이블 HEAD 요청(`select=id&limit=0`): 모두 HTTP 200. 응답 데이터는 내려받지 않았습니다.
- `config.js`, `app.js`, `personal.js`, `admin.js`: `node --check` 통과.

현재 연결된 Supabase 계정의 프로젝트 목록에는 이 프로젝트가 없으며, 해당 프로젝트의 스키마 조회 도구도 권한 오류를 반환했습니다. 따라서 운영 DB의 전체 컬럼·정책·인덱스와 서버 secrets, 배포된 함수 소스가 저장소와 완전히 동일한지는 확인하지 못했습니다. 이를 직접 관리하거나 전체 스키마를 대조하려면 이 프로젝트에 접근할 수 있는 Supabase 계정 연결이 필요합니다. 정상 데이터 저장 및 관리자 인증 후 조회·삭제는 실행하지 않았습니다.

`.env*`, `.vercel/`, Supabase CLI 임시 디렉터리는 Git에서 제외합니다. 서버 비밀키와 관리자 토큰은 커밋하지 마세요.
