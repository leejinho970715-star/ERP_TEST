// 결과 화면과 관리자 결과 이미지가 함께 쓰는 제품 소개 문구입니다.
// 더존 제품 체계: WEHAGO(Lite ERP) · 아마란스10(Standard ERP) · OmniEsol·ERP10(Extended ERP)
export const products = {
 wehago: { name:'WEHAGO', ko:'위하고', tag:'Lite ERP · 중소기업·세무사무소', desc:'Smart A의 후속 제품입니다. 회계·급여·물류와 결재·협업 서비스를 필요한 만큼 골라 쓰고, 세무사무소와 자료를 함께 볼 수 있습니다.', features:['회계·급여·물류','세무사무소 연계','결재·협업 서비스'], color:'sky', mark:'W' },
 amaranth: { name:'Amaranth 10', ko:'아마란스10', tag:'Standard ERP · ERP와 그룹웨어 통합', desc:'ERP·그룹웨어·문서관리를 하나로 연결합니다. 기본 구성으로 시작해 내부회계·그룹웨어 확장, 클라우드 전환까지 회사의 성장에 맞춰 넓혀 갈 수 있습니다.', features:['ERP·그룹웨어 통합','기본·확장·클라우드 구성','전사 데이터 관리'], color:'violet', mark:'a' },
 omni: { name:'OmniEsol', ko:'옴니이솔 · ERP10', tag:'Extended ERP · 업무 전반 맞춤 설계', desc:'업무 전반을 회사 고유의 방식으로 새로 설계할 때 검토합니다. 표준 패키지에 기능을 더하는 수준이라면 아마란스10과 SI 커스터마이징으로 안내합니다.', features:['업무 전반 맞춤 설계','DEWS 개발 도구','대기업·그룹 운영'], color:'cyan', mark:'O' },
 pms: { name:'PMS', ko:'프로젝트 관리 솔루션', tag:'프로젝트·현장·과제를 한눈에', desc:'프로젝트 일정·투입 인력·예산·원가를 관리합니다. WE PMS와 아마란스10 PMS 중 현재 ERP와 연결되는 제품은 상담에서 확인합니다.', features:['프로젝트별 손익','인력·일정 관리','기존 ERP 연계'], color:'blue', mark:'P' },
 // 이전 규칙(v2) 응답의 관리자 결과 이미지에서만 씁니다.
 oneai: { name:'ONE AI', ko:'원 AI', tag:'Amaranth 10과 함께 검토하는 AI', desc:'', features:[], color:'pink', mark:'AI' },
};
