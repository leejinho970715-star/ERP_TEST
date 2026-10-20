# ERP 가상 컨설팅 진단

아이원소프트뱅크의 ERP 추천 진단 사이트입니다. 기존 AX/DX 사이트의 디자인 방향을 참고해 5문항 진단·추천 결과·응답 관리 화면을 구현했습니다.

## 실행

Node.js 22.18 이상에서 별도 패키지 설치 없이 실행할 수 있습니다.

```powershell
npm run dev
```

- 진단: `http://127.0.0.1:4173/`
- ERP 응답 관리: `http://127.0.0.1:4173/erp-admin.html`
- 테스트: `npm test`
- 배포 파일 생성: `npm run build` → `dist/`

## 진단 흐름

1. 시작 화면: Pretendard, 하늘색 배경, 독립된 투명 PNG 대시보드.
2. 회사명·담당자명·이메일과 정보 이용 동의.
3. 업무 관리 방식, 업종, ERP 종류·활용도/관심 영역, 매출·인원, 필요 기능·맞춤 개발 여부.
4. 분석 애니메이션 → 추천 이유·점수 내역·제품 카드.
5. 결과 PNG 저장, PDF 인쇄, 개인정보를 제외한 결과 링크 공유.

낮은 점수는 WEHAGO, 50점 이상은 Amaranth 10을 추천합니다. 더존 ERP 사용자는 PMS를 추천하며 중·상 활용도에서는 감사 문구를 표시합니다. 맞춤 개발을 선택하면 Amaranth 10과 OmniEsol을 함께 추천합니다. **Amaranth 10이 포함되면 ONE AI를 항상 함께 제안합니다.**

## 데이터 연결

기존 Supabase 프로젝트 `uzvonfdifmbqdrsxzbcm`에 추가한 `erp_consulting_responses` 테이블과 `erp-consulting` Edge Function을 사용합니다. 기존 AX/DX 테이블·함수와 분리되어 있습니다. 브라우저 설정은 `erp-config.js`이며 서버 키와 관리자 토큰은 Supabase에서만 관리합니다.

관리자 화면은 기존 프로젝트의 `ADMIN_TOKEN`으로 서버 인증하며 키를 브라우저 저장소에 보관하지 않습니다. 관리자 조회·페이지 추가 로딩·CSV 다운로드를 제공합니다.

## 배포

ERP_TEST를 새 Vercel 프로젝트로 가져오면 `vercel.json`의 빌드·출력 설정을 사용합니다. 이번 작업에서는 Supabase 함수를 배포했으며 새 Vercel 프로젝트는 생성하지 않았습니다. 기존 `axdx-test.vercel.app` 배포는 변경하지 않았습니다.

추천 가중치·배포 절차·검증 기록은 [설정 문서](docs/SETUP.md), 이미지 출처·생성 프롬프트는 [에셋 문서](docs/ASSETS.md)를 참고하세요. 초기 가져오기 기록은 [AX/DX 기준선](docs/AXDX-BASELINE.md)에 보존했습니다.
