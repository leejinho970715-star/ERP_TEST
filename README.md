# AX/DX 완성도 체크리스트

Figma 시안과 AX/DX 완성도 체크리스트 PDF를 바탕으로 구현한 반응형 웹 진단입니다.

## 실행

```powershell
python -m http.server 4173
```

- 사용자 진단: `/index.html`
- 관리자 응답 조회 및 CSV: `/admin.html`

관리자 화면에서는 응답을 체크박스로 선택해 일괄 삭제할 수 있습니다. 결과 화면에서는 PNG 이미지, 사내 공유용 PDF 다운로드와 SNS 공유를 지원합니다.

## 데이터 저장

기본 상태에서는 브라우저 `localStorage`에 테스트 데이터를 저장합니다. 운영 DB는 `supabase-schema.sql`을 실행하고 `supabase/functions/axdx-responses`를 배포한 뒤 `config.js`의 `submitEndpoint`, `adminEndpoint`에 연결합니다. Edge Function에는 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN` secret이 필요하며, 관리자 접근 키는 공개 파일에 저장하지 않고 관리자 화면에서 세션마다 입력합니다.

관리자 조회 API에는 반드시 인증과 권한 검사를 적용하고, Supabase `service_role` 키를 프런트엔드에 넣지 마세요.
