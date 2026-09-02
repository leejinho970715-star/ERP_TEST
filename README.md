# AX/DX 완성도 체크리스트

Figma 시안과 AX/DX 완성도 체크리스트 PDF를 바탕으로 구현한 반응형 웹 진단입니다.

## 실행

```powershell
python -m http.server 4173
```

- 사용자 진단: `/index.html`
- 관리자 응답 조회 및 CSV: `/admin.html`

## 데이터 저장

기본 상태에서는 브라우저 `localStorage`에 테스트 데이터를 저장합니다. 운영 DB는 `supabase-schema.sql`을 실행하고 `supabase/functions/axdx-responses`를 배포한 뒤 `config.js`의 `submitEndpoint`, `adminEndpoint`, `adminToken`에 연결합니다. Edge Function에는 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN` secret이 필요합니다.

관리자 조회 API에는 반드시 인증과 권한 검사를 적용하고, Supabase `service_role` 키를 프런트엔드에 넣지 마세요.
