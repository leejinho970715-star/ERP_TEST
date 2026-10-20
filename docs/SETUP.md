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

## 추천 규칙 v2

전체 검토 근거와 분기표는 [기획 검토 보고서](PLANNING-REVIEW.md)를 확인하세요. 업종·매출·인원 점수와 50점 임계값을 제거하고 실제 업무의 불편·필요 기능·운영 범위·기존 ERP를 중심으로 제안합니다.

- 결과·PNG에는 숫자 등급 대신 검토 방향과 추천 이유를 표시합니다.
- PMS는 더존 사용 + 프로젝트 수요일 때만 검토 후보입니다.
- 기존 제품 활용 개선, 신규 도입 보류, 정보 추가 확인도 정상 결과입니다.
- 더존 제품 범위로 한정한 예비 제안임을 명시합니다. 정확도·도입 성과는 실증 검증하지 않았습니다.
- 이전 링크도 읽을 수 있지만 새 항목 누락은 확인 필요로 처리하며 최신 규칙으로 재검토한다고 표시합니다.
- DB의 score 필드는 기존 스키마 호환을 위한 기능 수 집계이며 고객 레벨·추천 임계값으로 사용하지 않습니다. 관리자 화면·CSV는 v2 검토 방향과 v1 점수를 구분합니다.

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

### v2 개선 검증

최신 v2 검증: 자동 테스트 22개 통과. 5개 업무 시나리오 × 업종 8종 × 매출 선택 6종 × 인원 선택 5종 = 1,200개 조합에서 업무 조건이 같으면 추천 방향·후보가 바뀌지 않음을 확인했습니다. 이는 규칙 일관성 검증이며 실제 고객 적합도나 사업 성과 검증이 아닙니다.

브라우저에서 매출 비공개 → 기존 iCUBE·중 활용·회계 개선 수요로 전체 진단을 진행해 `optimize`, 신규 제품 없음, `erp-2026-10-v2` 응답이 실제 저장된 것을 확인했습니다. 가상 검증 행 `94e46226-b770-4ac1-99d5-9ed1045c4199`은 만료 처리해 일반 관리자 목록에서 제외했습니다. 프런트엔드·서버에 v2를 반영했고 기존 테이블 스키마와 과거 응답은 보존했습니다.

### v1 초기 구축 당시 기록

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
