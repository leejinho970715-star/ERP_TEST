# ERP 진단 구현 및 운영

## 저장소와 배포

- 작업 저장소: `https://github.com/leejinho970715-star/ERP_TEST.git` (`origin`)
- 원본 참조: `https://github.com/leejinho970715-star/AX-DX_TEST.git` (`upstream`)
- 기본 브랜치: `main`; 기본 push 대상: `origin`.
- 기존 AX/DX 원본은 Git 이력과 `axdx-legacy.html` 등에 남아 있습니다. ERP 배포 빌드는 ERP 파일만 `dist/`에 포함합니다.
- 로컬: `npm run dev`, 테스트: `npm test`, 정적 빌드: `npm run build`.
- Vercel: 새 프로젝트에서 ERP_TEST를 import. `vercel.json`이 `node scripts/build-site.mjs` 빌드 및 `dist` 출력을 지정합니다.
- OG URL은 빌드 시 `SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` 순으로 절대 URL을 생성합니다. Vercel 시스템 환경변수를 사용하지 않는 호스팅에서는 `SITE_URL`을 지정하세요.
- 새 프런트엔드 사이트는 아직 외부 배포하지 않았습니다. 기존 AX/DX Vercel 사이트에는 변경을 적용하지 않았습니다.

## 추천 규칙 v1

추천은 기획을 구체화한 휴리스틱이며 더존의 공식 평가 기준이나 통계적 구매 확률이 아닙니다. 기술 업종의 실제 원재료비·마진을 추정하지 않고, 연구·인력·프로젝트 관리 수요에 가중치를 둡니다.

| 영역 | 가중치 |
| --- | --- |
| 관리 방식 | 엑셀 0 / 개별 도구 6 / ERP 11 / 시스템 연계 15 |
| 업종 | AI·로보틱스·R&D 25 / 제조·건설 18 / 서비스 12 / 유통 10 / 기타 5 |
| ERP 활용 | 미사용 0 / 타 ERP 6 / 더존 하 4·중 7·상 10 |
| 연 매출 | 10억 미만 0 / 50억 미만 5 / 100억 미만 10 / 300억 미만 16 / 300억 이상 20 |
| 임직원 수 | 10명 미만 0 / 50명 미만 2 / 100명 미만 3 / 100명 이상 5 |
| 기능 수요 | 회계·인사 3 / 협업 6 / 생산·재고 8 / 프로젝트 8 / 분석 7; 합계 최대 25 |

총점은 0–100점입니다. Q3의 추가 질문과 Q4·Q5의 세부 선택은 별도 문항으로 세지 않아 진행률은 5문항으로 표시합니다.

추천 우선순위:

1. 맞춤 개발 필요 → Amaranth 10 + OmniEsol.
2. 표준 기능 + 기존 더존 사용 → PMS.
3. 그 외 → 50점 미만 WEHAGO / 50점 이상 Amaranth 10.
4. Amaranth 10이 있으면 ONE AI 추가.
5. 맞춤 개발과 더존 사용이 겹치면 PMS도 추가.
6. 더존 활용도 중·상 → 감사 문구.

규칙은 `supabase/functions/_shared/erp-rules.js` 한 곳에 있으며 프런트엔드와 서버에서 공유합니다. 서버는 클라이언트 점수를 신뢰하지 않고 직접 다시 계산합니다. 규칙을 변경하면 프런트엔드와 Edge Function을 함께 다시 배포해야 합니다.

제품 설명은 [더존 공식 제품 안내](https://www.douzone.com/solution/business.jsp)를 참고했습니다. PMS의 구체적인 제품·연계 가능 범위는 상세 상담 대상으로 표시했습니다.

## Supabase

- 프로젝트: `uzvonfdifmbqdrsxzbcm`.
- 새 테이블: `public.erp_consulting_responses`.
- 새 함수: `https://uzvonfdifmbqdrsxzbcm.supabase.co/functions/v1/erp-consulting`.
- 기존 `axdx_responses`, `personal_axdx_responses`, `axdx_deleted_responses`, `axdx-responses`는 수정하지 않았습니다.
- 실제 적용 SQL: `erp-schema.sql`. 2026-10-20 Supabase 대시보드 SQL Editor에서 적용했습니다.
- 테이블 RLS 활성화, `anon`/`authenticated` 테이블 권한 제거, 서버 역할로만 접근.
- 서버 환경변수: 기존 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN` 재사용. 비밀값은 조회·복사·커밋하지 않았습니다.
- POST: 연락처·UUID·동의·답변 검사, 서버 점수 재계산, 같은 UUID의 중복 저장 방지.
- GET: `x-admin-token` 필수, 200건 단위 페이지네이션, 만료 응답 제외.
- 프런트엔드: 공개 `apikey` 사용. 배포된 함수의 기본 JWT 설정을 변경하지 않은 상태에서 정상 호출을 검증했습니다.
- 관리자 키는 메모리에서만 유지하며 브라우저 저장소에 저장하지 않습니다.
- 개인 식별 정보는 공유 링크와 결과 이미지에 포함하지 않습니다. 새로고침 시 미저장 폼 상태는 복원하지 않습니다.
- 자동 삭제 작업은 설치하지 않았습니다. 응답은 기본 `expires_at = 생성일 + 1년`을 가지며 만료 후 관리자 API 조회에서 제외됩니다. 운영자는 보유 기간이 지난 데이터를 별도로 삭제해야 합니다. 수집 안내에도 이 절차를 명시했습니다.

대시보드로 함수를 다시 배포할 때는 `npm run build:function`으로 `.tmp/erp-consulting.ts`를 생성한 뒤 기존 `erp-consulting`의 Code에 해당 내용을 넣어 배포합니다. 이 파일은 공유 규칙과 함수 소스를 합친 단일 파일입니다. 새 함수를 만들거나 기존 AX/DX 함수를 덮어쓰지 마세요.

## 검증 기록 — 2026-10-20

- 추천 분기·점수 경계·입력 거부·서버 재계산·관리자 인증·페이지네이션 등 자동 테스트 16개 통과.
- 브라우저: 회사 정보 → 5문항 → 분석 → 결과까지 실제 진행.
- 로보틱스 / 더존 중 / 맞춤 개발 시 64점, Amaranth 10·OmniEsol·ONE AI·PMS 결과 및 감사 문구 확인.
- 위 가상 응답의 점수·제품·규칙 버전을 SQL로 확인. 검증용 행 `0f981503-d2f5-4522-94d5-e5e836f1b1a3`은 `expires_at`을 검증 시각으로 바꿔 일반 관리자 목록에서 제외했습니다. 물리적으로 삭제하지 않았습니다.
- 데스크톱과 390px 모바일: 가로 넘침 없음, 전달받은 제품 이미지 정상 로딩.
- 결과 PNG 파일 생성·시각 검수 통과. PDF는 브라우저 인쇄의 PDF 저장 기능을 사용합니다.
- 공유 링크로 새로 열었을 때 개인정보 없는 WEHAGO 추천 결과 정상 표시, 서버 재저장 없음.
- 브라우저 JavaScript 오류 없음.
- RLS `true`, anon/authenticated SELECT `false`, service_role INSERT `true`를 SQL로 검증.
- 관리자 토큰 없는 API 조회 차단. 실제 관리자 토큰을 입력한 브라우저 조회·CSV 실데이터 검증은 수행하지 않았습니다.
