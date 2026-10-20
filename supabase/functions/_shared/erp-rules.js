export const RULE_VERSION = "erp-2026-10-v1";
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
const member = (key,value) => options[key].some(row=>row[0]===value);
export const label = (key,id) => options[key].find(row=>row[0]===id)?.[1] || "미선택";
export function validateAnswers(a) {
 if (!a || typeof a!=="object") return false;
 if (!["management","industry","erp","revenue","staff","custom"].every(key=>member(key,a[key]))) return false;
 if (a.erp==="douzone" && !member("level",a.level)) return false;
 if (a.erp!=="douzone" && !member("category",a.category)) return false;
 return Array.isArray(a.needs) && a.needs.length>0 && a.needs.length<=5 && new Set(a.needs).size===a.needs.length && a.needs.every(v=>member("needs",v));
}
export function calculate(a) {
 if (!validateAnswers(a)) throw new Error("모든 문항을 확인해 주세요.");
 const points=(key,value)=>options[key].find(row=>row[0]===value)?.[3]||0;
 const breakdown={management:points("management",a.management),industry:points("industry",a.industry),erp:a.erp==="douzone"?{low:4,mid:7,high:10}[a.level]:a.erp==="other"?6:0,scale:points("revenue",a.revenue)+points("staff",a.staff),needs:Math.min(25,a.needs.reduce((sum,id)=>sum+points("needs",id),0))};
 const score=Object.values(breakdown).reduce((sum,n)=>sum+n,0);
 const products=a.custom==="custom"?["amaranth","omni"]:a.erp==="douzone"?["pms"]:score>=50?["amaranth"]:["wehago"];
 if (products.includes("amaranth")) products.push("oneai");
 if (a.erp==="douzone"&&!products.includes("pms")) products.push("pms");
 return {score,breakdown,products,thanks:a.erp==="douzone"&&["mid","high"].includes(a.level),ruleVersion:RULE_VERSION};
}
