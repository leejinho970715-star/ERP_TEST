export const RULE_VERSION = "erp-2026-10-v2";
export const options = {
 management: [["excel","엑셀·수기로 관리해요","여러 파일과 문서에 정보가 나뉘어 있어요",0],["tools","업무별 프로그램을 사용해요","회계, 인사, 협업 도구를 각각 사용해요",6],["erp","ERP로 주요 업무를 관리해요","주요 데이터를 한 시스템에서 관리해요",11],["integrated","ERP와 다른 시스템을 연결해요","여러 부서·시스템의 데이터를 연계해요",15]],
 industry: [["ai","AI·소프트웨어","지식·인력 중심의 기술 비즈니스",25],["robotics","로보틱스·첨단기술","연구개발과 프로젝트 중심의 비즈니스",25],["research","R&D·연구개발","연구 과제와 개발 투자 관리",25],["manufacturing","제조업","생산·자재·재고·원가 관리",18],["construction","건설·엔지니어링","현장별 손익과 프로젝트 관리",18],["service","서비스·전문업","인력·고객·프로젝트 관리",12],["distribution","유통·도소매","매입·매출과 재고 관리",10],["other","기타 업종","업무에 맞는 경영 관리",5]],
 erp: [["douzone","더존 ERP","Smart A, iCUBE, ERP iU, Amaranth 10 등"],["other","다른 ERP","SAP, Oracle, 영림원, 이카운트 등"],["none","아직 사용하지 않아요","첫 ERP 도입을 검토하고 있어요"]],
 level: [["low","하 · 기본 기능 위주","일부 기능만 사용해요"],["mid","중 · 주요 업무 활용","여러 부서에서 주요 기능을 활용해요"],["high","상 · 전사적으로 활용","부서 간 데이터를 연계해 적극 활용해요"]],
 category: [["finance","회계·인사","재무와 인력 관리부터"],["operations","생산·물류·재고","운영 프로세스를 체계적으로"],["project","프로젝트·손익","과제와 수익성을 한눈에"],["all","전사 통합 관리","부서별 업무를 하나로 연결"]],
 revenue: [["under10","10억 미만","",0],["10to50","10억–50억 미만","",5],["50to100","50억–100억 미만","",10],["100to300","100억–300억 미만","",16],["over300","300억 이상","",20]],
 staff: [["under10","10명 미만","",0],["10to50","10–49명","",2],["50to100","50–99명","",3],["over100","100명 이상","",5]],
 needs: [["finance","회계·인사 업무 효율화","반복 업무를 줄이고 정확도를 높이고 싶어요",3],["collaboration","결재·협업·문서 통합","흩어진 업무를 한곳에서 처리하고 싶어요",6],["operations","생산·재고·원가 관리","운영 흐름과 비용을 연결하고 싶어요",8],["project","프로젝트별 손익 관리","일정·투입 인력·수익성을 보고 싶어요",8],["analytics","경영 분석·실시간 리포트","데이터로 빠르게 의사결정하고 싶어요",7]],
 custom: [["standard","표준 기능으로 충분해요","검증된 프로세스로 빠르게 시작하고 싶어요"],["custom","맞춤 개발·시스템 연계가 필요해요","고유한 프로세스나 외부 시스템을 연결해야 해요"]],
};
// 업종·매출·인원에 붙어 있던 v1 가중치는 제거합니다.
for (const rows of Object.values(options)) for (const row of rows) row.splice(3);
options.pain = [['none','큰 불편은 없어요','현재 방식으로 필요한 업무를 처리하고 있어요'],['manual','중복 입력·수작업이 많아요','여러 도구 사이에서 같은 내용을 반복 입력해요'],['visibility','재고·손익·보고 확인이 어려워요','데이터가 늦거나 서로 맞지 않는 경우가 있어요'],['unknown','아직 정확히 모르겠어요','담당 부서와 업무 문제를 먼저 확인해야 해요']];
options.complexity = [['single','단일 사업장·단일 법인','한 조직의 표준 업무가 중심이에요'],['multi','여러 사업장·부서 간 연결','사업장·부서별 데이터 흐름을 연결해야 해요'],['group','여러 법인·해외 운영','법인별 결산·권한·통화 등을 함께 검토해야 해요'],['unknown','확인이 필요해요','운영 범위를 담당자와 확인해야 해요']];
options.currentProduct = [['smarta','Smart A / Smart A 10','회계 중심의 현재 제품'],['wehago','WEHAGO','현재 사용 중인 경영·협업 플랫폼'],['icube','iCUBE','현재 사용 중인 ERP'],['erpiu','ERP iU','현재 사용 중인 ERP'],['amaranth','Amaranth 10','현재 사용 중인 통합 플랫폼'],['omni','OmniEsol','현재 사용 중인 통합 플랫폼'],['unknown','정확한 제품명은 모르겠어요','상세 상담에서 확인해 주세요']];
options.revenue.push(['unknown','비공개·확인 필요','추천에 불이익이 없습니다']);
options.staff.push(['unknown','확인 필요','실제 사용 인원은 상담에서 확인해요']);
options.custom.push(['unknown','필요한지 아직 모르겠어요','표준 기능으로 해결되는지 먼저 확인하고 싶어요']);
options.needs.push(['none','당장 보완할 기능은 없어요','현재 방식의 유지·점검 방향을 알고 싶어요']);
const member = (key,value) => options[key].some(row=>row[0]===value);
export const label = (key,id) => options[key].find(row=>row[0]===id)?.[1] || "미선택";
export function validateAnswers(a) {
 if (!a || typeof a!=="object") return false;
 if (!["management","industry","erp","revenue","staff","custom"].every(key=>member(key,a[key]))) return false;
 if (a.erp==="douzone" && !member("level",a.level)) return false;
 if (a.erp!=="douzone" && !member("category",a.category)) return false;
 for (const key of ['pain','complexity','currentProduct']) if (a[key]!==undefined && !member(key,a[key])) return false;
 return Array.isArray(a.needs) && a.needs.length>0 && a.needs.length<=5 && new Set(a.needs).size===a.needs.length && a.needs.every(v=>member("needs",v)) && (!a.needs.includes('none') || a.needs.length===1);
}
export function normalizeAnswers(a) {
 return {management:a.management,industry:a.industry,erp:a.erp,...(a.erp==='douzone'?{level:a.level,currentProduct:a.currentProduct||'unknown'}:{category:a.category}),revenue:a.revenue,staff:a.staff,needs:[...a.needs],custom:a.custom,pain:a.pain||'unknown',complexity:a.complexity||'unknown'};
}
export const routeLabels = {clarify:'요구사항 확인 우선',maintain:'현재 방식 유지·점검',optimize:'기존 ERP 활용 개선',basic:'기본 경영 관리 검토',integrate:'업무 통합 검토',compare:'표준 기능·확장 방식 비교'};
export function calculate(a) {
 if (!validateAnswers(a)) throw new Error("모든 문항을 확인해 주세요.");
 a=normalizeAnswers(a);
 const hasErp=a.erp!=='none', needs=a.needs.filter(id=>id!=='none');
 const project=needs.includes('project'), operations=needs.includes('operations'), analytics=needs.includes('analytics');
 const missing=['pain','complexity'].filter(key=>a[key]==='unknown');
 if(a.custom==='unknown')missing.push('custom');
 if(a.erp==='douzone'&&a.currentProduct==='unknown')missing.push('currentProduct');
 if(a.erp==='none'&&['erp','integrated'].includes(a.management))missing.push('managementErp');
 let route,products=[];
 if(missing.length || (!needs.length&&a.pain!=='none')) route='clarify';
 else if(!needs.length || (a.pain==='none'&&a.custom==='standard')) route='maintain';
 else if(hasErp && (a.currentProduct==='omni' || (a.custom==='standard'&&a.complexity!=='group'))) route='optimize';
 else if(a.custom==='custom'||a.complexity==='group') {route='compare';products=['amaranth','omni'];}
 else if(operations||project||analytics) {route='integrate';products=['amaranth'];}
 else {route='basic';products=['wehago'];}
 // 기존 제품의 보유 모듈·설정·교육으로 해결할 수 있는지 먼저 확인합니다.
 if(route==='optimize'&&a.currentProduct==='amaranth'&&needs.length) products=['amaranth'];
 if(a.erp==='douzone'&&project&&route!=='clarify') products.push('pms');
 if(products.includes('amaranth'))products.push('oneai');
 const existingProducts=products.filter(id=>id===a.currentProduct);
 const breakdown={route,functionalBreadth:needs.length,project,operations,analytics,custom:a.custom,complexity:a.complexity,pain:a.pain,missing,existingProducts};
 // DB v1의 NOT NULL score 호환용 기능 수 집계입니다. 등급·추천 임계값으로 사용하지 않습니다.
 return {score:needs.length*20,breakdown,products,route,routeLabel:routeLabels[route],missing,existingProducts,thanks:a.erp==='douzone'&&['mid','high'].includes(a.level),ruleVersion:RULE_VERSION};
}
