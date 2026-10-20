# ERP_TEST — ERP 가상 컨설팅 체크리스트

Figma 시안과 AX/DX 완성도 체크리스트 PDF를 바탕으로 구현한 반응형 웹 진단입니다.

기존 [AX-DX_TEST](https://github.com/leejinho970715-star/AX-DX_TEST)의 `772ea837e2001591340773b2aa9b61366cc1fbb9`를 기준으로 가져온 작업 저장소입니다. 이후 개발·커밋·푸시는 [ERP_TEST](https://github.com/leejinho970715-star/ERP_TEST)에서 진행합니다.

## 실행

```powershell
python -m http.server 4173
```

- 사용자 진단: `/index.html`
- 개인 진단: `/personal.html`
- 관리자 응답 조회 및 CSV: `/admin.html`

관리자 화면에서는 응답을 체크박스로 선택해 일괄 삭제할 수 있습니다. 결과 화면에서는 PNG 이미지, 사내 공유용 PDF 다운로드와 SNS 공유를 지원합니다.

## 데이터 저장

현재 `config.js`는 기존 사이트 [axdx-test.vercel.app](https://axdx-test.vercel.app/)과 같은 Supabase 프로젝트(`uzvonfdifmbqdrsxzbcm`)의 배포된 `axdx-responses` Edge Function을 사용합니다. DB 스키마 소스와 Edge Function 소스도 원본 그대로 포함되어 있습니다. 기존 서버 연결을 사용하므로 초기 실행을 위해 SQL을 다시 실행하거나 함수를 재배포할 필요가 없습니다.

두 사이트의 응답과 관리자 삭제 작업은 같은 DB에 반영됩니다. 브라우저 `localStorage`도 응답 임시 저장·재전송에 사용됩니다. 운영 DB에 연결된 상태에서 정상 진단을 제출하면 실제 응답이 저장됩니다.

Edge Function의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN`은 기존 Supabase 서버의 설정을 계속 사용합니다. 관리자 접근 키는 관리자 화면에서 세션마다 입력합니다. 서버 비밀키와 관리자 토큰은 이 저장소에 복사하지 않습니다.

관리자 조회 API에는 반드시 인증과 권한 검사를 적용하고, Supabase `service_role` 키를 프런트엔드에 넣지 마세요.

연결 구조, DB 테이블, 검증 결과 및 배포 방법은 [설정 문서](docs/SETUP.md)를 참고하세요.
