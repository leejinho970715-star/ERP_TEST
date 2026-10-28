// ERP 추천 테스트 v3 규칙 — 「ERP 추천 테스트 기획 가이드라인」(2026-10-23) 기준.
// 추천은 점수 합산이 아닌 규칙(규모 등급 × 진입 경로 → 예외 규칙 → PMS 함께 제안)으로 정합니다.
// 브라우저(결과 화면·관리자 화면)와 Supabase Edge Function이 같은 파일을 씁니다.
export const RULE_VERSION = "erp-2026-10-v3";

const U = ['unknown','잘 모르겠습니다'];
export const options = {
 // 워밍업: 추천 규칙에는 쓰지 않고 결과 문구에만 씁니다.
 role: [['ceo','대표·경영'],['finance','회계·재무'],['hr','인사·총무'],['it','IT·전산'],['other','그 외 업무']],
 timeSink: [['reports','자료 취합·보고서 작성'],['approval','결재·문서 처리'],['closing','숫자 맞추기·결산'],['inventory','재고·주문 확인'],['schedule','프로젝트 일정 관리'],['unknown','그때그때 달라 고르기 어렵습니다']],
 // 공통 1~3
 industry: [['manufacturing','제조'],['food','식품'],['distribution','유통·무역'],['it','IT·서비스·SI'],['research','연구개발·국책과제'],['robotics','로보틱스'],['construction','건설·현장'],['content','콘텐츠·엔터·게임'],['other','기타'],U],
 revenue: [['t1','30억 미만'],['t2','30억~300억'],['t3','300억~1,000억'],['t4','1,000억 이상'],U],
 audit: [['none','해당 없음'],['external','외부감사 대상입니다'],['listing','상장했거나 상장을 준비하고 있습니다'],U],
 // 4. 경로 분기
 system: [['excel','엑셀·수기로 관리하고 있습니다','A'],['taxagent','세무사무소 기장으로 관리하고 있습니다','A'],['douzone_switch','더존 ERP(iU·WEHAGO·Smart A 등)를 쓰고 있고, 바꿀 계획이 있습니다','B'],['other_switch','다른 회사 ERP를 쓰고 있고, 바꿀 계획이 있습니다','B'],['douzone_extend','더존 ERP(아마란스10·WEHAGO)를 그대로 쓰면서 기능을 더하고 싶습니다','C'],['douzone_good','더존 ERP를 잘 활용하고 있습니다','audit'],['unknown','잘 모르겠습니다','A']],
 // 경로 A·B 5~9
 accounting: [['taxagent','세무사무소에서 정리해 주신 자료를 확인합니다'],['single','회계 담당자 한 분이 꼼꼼히 마감합니다'],['team','회계팀이 함께 결산을 진행합니다'],U],
 projectNeeds: [['pl','프로젝트·현장별 손익'],['schedule','일정·진척 관리'],['timesheet','인력 투입 시간'],['research','연구 과제·연구비'],['none','따로 필요하지 않습니다'],U],
 trigger: [['growth','회사가 커지면서 관리할 일이 늘었습니다'],['closing','결산·보고에 시간이 많이 듭니다'],['system','지금 쓰는 프로그램을 바꿀 때가 되었습니다'],['audit','외부감사·투자·상장을 준비하고 있습니다'],['request','경영진이 검토를 요청했습니다'],U],
 special: [['project_pl','프로젝트·현장별 손익 관리'],['timesheet','타임시트(인력 투입 시간) 관리'],['schedule','프로젝트 일정·진척 관리'],['research','연구과제·연구비 관리'],['integration','전자결재·기존 시스템 연동'],['report_form','우리 회사 양식에 맞춘 보고서'],['production','생산·재고 관리'],['trade','외화·수출입 관리'],['redesign','업무 전반을 우리 회사 방식으로 새로 설계'],U],
 groupware: [['approval','전자결재'],['attendance','근태·휴가'],['messenger','메신저·협업'],['using','이미 사용하고 있습니다'],['none','필요하지 않습니다'],U],
 // 경로 C 5~9
 currentErp: [['amaranth','아마란스10'],['wehago','WEHAGO'],['iu','ERP iU·iCUBE'],U],
 vendor: [['iwon','아이원소프트뱅크에서 도입했습니다'],['partner','다른 파트너사에서 도입했습니다'],['dept','본사·다른 부서에서 일괄 도입했습니다'],U],
 scope: [['team','한 부서, 10명 미만'],['multi','여러 부서, 10~50명'],['company','전사, 50명 이상'],U],
 integration: [['auto','네, 자동으로 이어져야 합니다'],['partial','일부만 이어지면 됩니다'],['no','따로 써도 괜찮습니다'],U],
 hardTasks: [['many','여러 가지 있습니다'],['few','한두 가지 있습니다'],['none','특별히 없습니다'],U],
 // 공통 마무리 10~12
 deploy: [['cloud','클라우드'],['onprem','구축형(자체 서버)'],U],
 timeline: [['m3','3개월 안'],['m6','6개월 안'],['y1','1년 안'],['research','정보를 모으는 중입니다'],U],
 concern: [['cost','비용'],['education','교육·사용 적응'],['migration','데이터 이전'],['schedule','도입 일정'],U],
};
export const multiKeys = ['projectNeeds','special','groupware'];
// 함께 고를 수 없는 선택지(“필요 없음”, “잘 모름” 등)
const exclusive = { projectNeeds:['none','unknown'], special:['unknown'], groupware:['using','none','unknown'] };
const CUSTOM_KEYWORDS = ['project_pl','timesheet','schedule','research','integration','report_form'];
const PROJECT_KEYWORDS = ['pl','schedule','timesheet','research'];
const PMS_INDUSTRIES = ['it','research','robotics','construction'];

const member = (key,value) => options[key]?.some(row=>row[0]===value);
export const label = (key,id) => options[key]?.find(row=>row[0]===id)?.[1] || '미선택';
export const pathOf = system => options.system.find(row=>row[0]===system)?.[2];

// 응답에 따라 실제로 묻는 문항 목록(키 묶음)입니다. 감사 엔딩이면 경로 문항 없이 끝납니다.
export function questionKeys(a = {}) {
 const keys = [['role'],['timeSink'],['industry'],['revenue'],['audit'],['system']];
 const path = pathOf(a.system);
 if (!path || path === 'audit') return keys;
 if (path === 'C') {
  keys.push(['currentErp','vendor']);
  if (isTransfer(a)) return keys;
  keys.push(['special'],['scope'],['integration'],['hardTasks']);
 } else keys.push(['accounting'],['projectNeeds'],['trigger'],['special'],['groupware']);
 keys.push(['deploy'],['timeline'],['concern']);
 return keys;
}
const isTransfer = a => a.currentErp === 'amaranth' && ['partner','dept'].includes(a.vendor);

function validMulti(key, list) {
 if (!Array.isArray(list) || !list.length || list.length > options[key].length || new Set(list).size !== list.length || !list.every(v=>member(key,v))) return false;
 return list.length === 1 || !list.some(v=>exclusive[key].includes(v));
}
export function validateAnswers(a) {
 if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
 const asked = questionKeys(a).flat();
 if (Object.keys(a).some(key=>!asked.includes(key))) return false;
 return asked.every(key=>multiKeys.includes(key) ? validMulti(key,a[key]) : member(key,a[key]));
}
export function normalizeAnswers(a) {
 return Object.fromEntries(questionKeys(a).flat().map(key=>[key, multiKeys.includes(key) ? [...a[key]] : a[key]]));
}

export const tierLabels = { T1:'소규모', T2:'성장기', T3:'중견', T4:'대기업' };
export const pathLabels = { A:'신규 도입', B:'교체 검토', C:'기존 유지 + 확장', audit:'감사 엔딩' };
export const resultTypes = {
 first: { label:'첫 단추형', message:'지금이 체계를 갖추기 가장 좋은 시점입니다.', companion:'세무사 연계' },
 growth: { label:'성장 엔진형', message:'성장 속도에 맞춰 함께 커지는 시스템을 제안합니다.', companion:'업종 모듈' },
 complete: { label:'체계 완성형', message:'외부의 기준까지 준비된 경영 관리를 시작합니다.', companion:'내부회계·K-IFRS18 대응' },
 cloud: { label:'클라우드 이사형', message:'익숙한 데이터 그대로, 더 넓은 환경으로 옮겨 갑니다.', companion:'SI 커스터마이징(기존 iU 기능 이식)' },
 switch: { label:'새 옷 갈아입기형', message:'지금의 업무 흐름에 더 잘 맞는 선택지를 비교해 보십시오.', companion:'데이터 이전 지원' },
 custom: { label:'맞춤 설계형', message:'표준 기능 위에 우리 회사의 일하는 방식을 더합니다.', companion:'무료 업무 진단 상담' },
 full: { label:'전면 설계형', message:'회사 고유의 업무 방식에 맞춘 설계 상담으로 안내드립니다.', companion:'' },
 audit: { label:'감사 인사', message:'더존 ERP와 함께해 주셔서 감사합니다. 앞으로도 많은 활용 부탁드립니다.', companion:'' },
};
// 4-2. 업종별 모듈 구성(업종은 제품이 아니라 모듈 구성만 바꿉니다)
export const industryModules = {
 manufacturing: { core:'생산·MRP, 원가, 재고', extra:'바코드·창고 관리' },
 food: { core:'생산, 로트·유통기한 관리, 재고', extra:'품질 이력 관리' },
 distribution: { core:'영업·구매·재고, 외화·수출입', extra:'WEHAGO 물류관리' },
 it: { core:'회계·인사, 프로젝트 원가', extra:'PMS' },
 research: { core:'회계, 연구비 관리', extra:'PMS(과제 관리), RCMS·이지바로 대응' },
 robotics: { core:'생산·원가, 연구개발 과제 관리', extra:'PMS' },
 construction: { core:'현장·프로젝트별 원가', extra:'PMS' },
 content: { core:'프로젝트·IP별 정산, 인사', extra:'PMS, 그룹웨어' },
 other: { core:'회계·인사 기본 관리', extra:'그룹웨어' },
 unknown: { core:'회계·인사 기본 관리', extra:'그룹웨어' },
};
// 4-1. 규모 등급 × 진입 경로 (C는 현재 ERP를 유지하고 더하는 구성)
const matrix = {
 A: { T1:['wehago','WEHAGO'], T2:['amaranth','아마란스10 기본 구성'], T3:['amaranth','아마란스10 확장 구성(내부회계·그룹웨어) + PMS'], T4:['amaranth','아마란스10 확장 구성 + SI'] },
 Bother: { T1:['wehago','WEHAGO'], T2:['amaranth','아마란스10 기본 구성'], T3:['amaranth','아마란스10 클라우드'], T4:['amaranth','아마란스10 확장 구성 + SI'] },
 Bdouzone: { T1:['amaranth','아마란스10 클라우드'], T2:['amaranth','아마란스10 클라우드'], T3:['amaranth','아마란스10 클라우드'], T4:['amaranth','아마란스10 확장 구성 + SI'] },
 C: { T1:'부가 기능·세무사 연계', T2:'PMS 연동 또는 SI 커스터마이징', T3:'PMS + SI 연동 개발', T4:'SI 커스터마이징' },
};
const tierRank = t => Number(t.slice(1));
const maxTier = (...tiers) => 'T'+Math.max(...tiers.map(tierRank));

export function calculate(input) {
 if (!validateAnswers(input)) throw new Error('모든 문항을 확인해 주세요.');
 const a = normalizeAnswers(input);
 const path = pathOf(a.system);
 const base = { ruleVersion:RULE_VERSION, path, unknownCount:0, consultFirst:false, pms:false, customKeywords:[], products:[] };
 // 예외 1: 감사 엔딩(더존 ERP 잘 활용) / 아마란스10 + 타 부서·타 파트너 구매 → 감사 엔딩 + 내부 이관
 if (path === 'audit' || isTransfer(a)) {
  const transfer = path !== 'audit';
  return { ...base, path:'audit', transfer, type:'audit', typeLabel:resultTypes.audit.label, message:resultTypes.audit.message, tier:null };
 }
 // 워밍업(role·timeSink)을 뺀 “잘 모름” 응답 수
 const unknownCount = Object.entries(a).filter(([key,v])=>!['role','timeSink'].includes(key) && (Array.isArray(v) ? v.includes('unknown') : v==='unknown')).length;
 const consultFirst = unknownCount >= 3;
 // 규모 등급: 매출액으로 먼저 정하고, 상향 조정 변수 중 가장 높은 조건을 적용합니다(하향 없음).
 const tierBase = consultFirst || a.revenue === 'unknown' ? 'T2' : a.revenue.toUpperCase();
 const raises = [];
 if (['external','listing'].includes(a.audit)) raises.push('T3');
 if (a.accounting === 'team') raises.push('T2');
 const tier = maxTier(tierBase, ...raises);
 const customKeywords = [...(a.special||[]).filter(v=>CUSTOM_KEYWORDS.includes(v)), ...(a.projectNeeds||[]).filter(v=>PROJECT_KEYWORDS.includes(v)).map(v=>'project_'+v)];
 let type, main;
 const pathMain = path === 'B' ? matrix[a.system === 'douzone_switch' ? 'Bdouzone' : 'Bother'][tier] : path === 'A' ? matrix.A[tier] : null;
 if (a.special.includes('redesign')) { type='full'; main={ id:'omni', name:'OmniEsol(ERP10) 설계 상담' }; }
 else if (path === 'C' || customKeywords.length) {
  type='custom';
  // 등급별 ERP에 이미 붙은 PMS·SI는 “PMS·SI 맞춤 구성”과 겹치므로 뗍니다.
  const current = path === 'C' ? (a.currentErp === 'unknown' ? '현재 쓰시는 더존 ERP' : '현재 '+label('currentErp',a.currentErp)) : pathMain[1].replace(/ \+ (PMS|SI)$/,'');
  main={ id: path === 'C' ? (a.currentErp === 'wehago' ? 'wehago' : a.currentErp === 'amaranth' ? 'amaranth' : 'current') : pathMain[0], name:`${current} + ${path === 'C' ? matrix.C[tier] : 'PMS·SI 맞춤 구성'}` };
 }
 else if (path === 'B') { type = a.system === 'douzone_switch' ? 'cloud' : 'switch'; main={ id:pathMain[0], name:pathMain[1] }; }
 else { type = tier === 'T1' ? 'first' : tier === 'T2' ? 'growth' : 'complete'; main={ id:pathMain[0], name:pathMain[1] }; }
 const modules = industryModules[a.industry];
 let companion = resultTypes[type].companion === '업종 모듈' ? `업종 모듈(${modules.core})` : resultTypes[type].companion;
 // PMS 함께 제안 규칙: 외감·상장(예정), 더존 ERP 사용 중, IT·연구개발·로보틱스·건설 업종 → 함께 제안을 PMS로 고정
 const douzoneUser = a.system === 'douzone_switch' || path === 'C';
 const pmsReasons = [];
 if (['external','listing'].includes(a.audit)) pmsReasons.push('audit');
 if (douzoneUser) pmsReasons.push('douzone');
 if (PMS_INDUSTRIES.includes(a.industry)) pmsReasons.push('industry');
 const pmsInMain = /PMS/.test(main.name);
 const pms = pmsReasons.length > 0 && !pmsInMain;
 const proposal = pms ? companion : '';
 if (pms) companion = 'PMS(프로젝트 관리)';
 // 함께 보면 좋은 기능 1개: 업종의 함께 제안 모듈(이미 제안한 PMS와 겹치면 핵심 모듈)
 let feature = modules.extra;
 if (a.industry === 'distribution' && tier !== 'T1') feature = '외화·수출입 관리';
 if (/^PMS/.test(feature) && (pms || pmsInMain) || feature === companion) feature = modules.core;
 // 모듈 구성: 업종 핵심 모듈 + 표준 모듈로 고른 특수 요구 + 그룹웨어(아마란스10 통합형 / WEHAGO 그룹웨어)
 const moduleList = [modules.core];
 if (a.special.includes('production') && !/생산/.test(modules.core)) moduleList.push('생산·재고 관리');
 if (a.special.includes('trade') && !/외화/.test(modules.core)) moduleList.push('외화·수출입 관리');
 const gw = (a.groupware||[]).filter(v=>['approval','attendance','messenger'].includes(v)).map(v=>label('groupware',v));
 const groupware = gw.length ? (main.id === 'wehago' ? `WEHAGO 그룹웨어(${gw.join('·')})` : `그룹웨어 통합(${gw.join('·')})`) : a.groupware?.includes('using') ? '사용 중인 그룹웨어와 연동' : '';
 if (groupware) moduleList.push(groupware);
 const products = [main.id, ...(pms || pmsInMain ? ['pms'] : [])].filter((id,i,list)=>['wehago','amaranth','omni','pms'].includes(id) && list.indexOf(id)===i);
 return { ...base, type, typeLabel:resultTypes[type].label, message:resultTypes[type].message, tier, tierBase, raises, unknownCount, consultFirst, customKeywords, main, companion, proposal, pms, pmsReasons, feature, modules, moduleList, groupware, products, transfer:false };
}

// 리드 등급: A 무료 상담 신청 + 전화번호 / B 이메일 + 도입 6개월 이내 / C 그 외 / 이관(아마란스10 타 부서·파트너 구매)
export function leadGrade(lead, answers, result) {
 if (result?.transfer) return '이관';
 if (lead.type === 'consult' && lead.phone) return 'A';
 if (lead.email && ['m3','m6'].includes(answers.timeline)) return 'B';
 return 'C';
}
export const leadTypes = { none:'응답만', report:'상세 리포트', consult:'무료 상담', demo:'데모 요청', newsletter:'소식 받기', legacy:'이전 버전' };

// v1·v2(이전 규칙) 응답을 관리자 화면에서 읽기 위한 표시용 정보입니다.
export const routeLabels = {clarify:'요구사항 확인 우선',maintain:'현재 방식 유지·점검',optimize:'기존 ERP 활용 개선',basic:'기본 경영 관리 검토',integrate:'업무 통합 검토',compare:'표준 기능·확장 방식 비교'};
export const legacyOptions = {
 industry:{ai:'AI·소프트웨어',robotics:'로보틱스·첨단기술',research:'R&D·연구개발',manufacturing:'제조업',construction:'건설·엔지니어링',service:'서비스·전문업',distribution:'유통·도소매',other:'기타 업종'},
 revenue:{under10:'10억 미만','10to50':'10억–50억 미만','50to100':'50억–100억 미만','100to300':'100억–300억 미만',over300:'300억 이상',unknown:'비공개·확인 필요'},
};
