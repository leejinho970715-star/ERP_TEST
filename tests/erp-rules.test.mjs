import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,validateAnswers,normalizeAnswers,questionKeys,leadGrade} from '../supabase/functions/_shared/erp-rules.js';
// 기획 가이드라인(2026-10-23) 4장 매트릭스·6장 결과 유형·7장 예외 규칙 기준
const base={role:'ceo',timeSink:'closing',industry:'manufacturing',revenue:'t2',audit:'none',system:'excel',accounting:'single',projectNeeds:['none'],trigger:'growth',special:['production'],groupware:['approval'],deploy:'cloud',timeline:'m6',concern:'cost'};
const c={role:'it',timeSink:'reports',industry:'food',revenue:'t3',audit:'none',system:'douzone_extend',currentErp:'amaranth',vendor:'iwon',special:['production'],scope:'multi',integration:'auto',hardTasks:'few',deploy:'cloud',timeline:'m3',concern:'migration'};
const pick=r=>({type:r.type,tier:r.tier,main:r.main?.name});
test('워밍업 2 + 공통 3 + 분기 1 + 경로 5 + 마무리 3 = 14문항, 감사 엔딩은 6문항',()=>{assert.equal(questionKeys(base).length,14);assert.equal(questionKeys(c).length,14);assert.equal(questionKeys({...base,system:'douzone_good'}).length,6);});
test('경로 A: T1 첫 단추형 WEHAGO, T2 성장 엔진형 아마란스10 기본, T3 체계 완성형 확장+PMS, T4 확장+SI',()=>{
 assert.deepEqual(pick(calculate({...base,revenue:'t1'})),{type:'first',tier:'T1',main:'WEHAGO'});
 assert.deepEqual(pick(calculate(base)),{type:'growth',tier:'T2',main:'아마란스10 기본 구성'});
 assert.deepEqual(pick(calculate({...base,revenue:'t3'})),{type:'complete',tier:'T3',main:'아마란스10 확장 구성(내부회계·그룹웨어) + PMS'});
 assert.deepEqual(pick(calculate({...base,revenue:'t4'})),{type:'complete',tier:'T4',main:'아마란스10 확장 구성 + SI'});
 assert.equal(calculate({...base,revenue:'t1'}).companion,'세무사 연계');
 assert.equal(calculate({...base,revenue:'t3'}).companion,'내부회계·K-IFRS18 대응');
});
test('경로 B: 더존(iU·WEHAGO) → 클라우드 이사형, 타사 → 새 옷 갈아입기형(등급별 제품 + 데이터 이전)',()=>{
 assert.deepEqual(pick(calculate({...base,system:'douzone_switch'})),{type:'cloud',tier:'T2',main:'아마란스10 클라우드'});
 for(const [revenue,main] of [['t1','WEHAGO'],['t2','아마란스10 기본 구성'],['t3','아마란스10 클라우드'],['t4','아마란스10 확장 구성 + SI']]){const r=calculate({...base,system:'other_switch',revenue});assert.equal(r.type,'switch');assert.equal(r.main.name,main);assert.equal(r.companion,'데이터 이전 지원');}
});
test('경로 C는 맞춤 설계형: 현재 ERP + 등급별 확장',()=>{for(const [revenue,plan] of [['t1','부가 기능·세무사 연계'],['t2','PMS 연동 또는 SI 커스터마이징'],['t3','PMS + SI 연동 개발'],['t4','SI 커스터마이징']]){const r=calculate({...c,revenue});assert.equal(r.type,'custom');assert.equal(r.main.name,'현재 아마란스10 + '+plan);}});
test('규모 등급: 매출로 먼저 정하고 외감·상장은 최소 T3, 회계팀은 최소 T2, 하향 없음',()=>{
 assert.equal(calculate({...base,revenue:'t1',audit:'external'}).tier,'T3');
 assert.equal(calculate({...base,revenue:'t1',audit:'listing'}).tier,'T3');
 assert.equal(calculate({...base,revenue:'t1',accounting:'team'}).tier,'T2');
 assert.equal(calculate({...base,revenue:'t4',audit:'external'}).tier,'T4');
 assert.equal(calculate({...base,revenue:'t1',accounting:'taxagent'}).tier,'T1');
});
test('업종은 제품을 바꾸지 않고 모듈 구성만 바꿈',()=>{for(const industry of ['manufacturing','food','distribution','content','other'])assert.equal(calculate({...base,industry}).main.name,'아마란스10 기본 구성');assert.equal(calculate({...base,industry:'food'}).modules.core,'생산, 로트·유통기한 관리, 재고');});
test('예외 1: 더존 ERP 잘 활용 → 감사 엔딩, 아마란스10 + 타 파트너·타 부서 구매 → 감사 엔딩 + 이관',()=>{
 const audit=calculate({role:'ceo',timeSink:'closing',industry:'food',revenue:'t1',audit:'none',system:'douzone_good'});assert.equal(audit.type,'audit');assert.equal(audit.transfer,false);assert.equal(audit.main,undefined);
 for(const vendor of ['partner','dept']){const {special,scope,integration,hardTasks,deploy,timeline,concern,...head}=c;const r=calculate({...head,vendor});assert.equal(r.type,'audit');assert.equal(r.transfer,true);}
 assert.equal(calculate({...c,currentErp:'wehago',vendor:'partner'}).type,'custom');
});
test('예외 2: 업무 전반 맞춤 설계는 규모와 관계없이 OmniEsol(전면 설계형)',()=>{for(const revenue of ['t1','t4']){const r=calculate({...base,revenue,special:['redesign','production']});assert.equal(r.type,'full');assert.equal(r.main.id,'omni');}assert.equal(calculate({...c,special:['redesign']}).type,'full');});
test('예외 4: 잘 모름 3개 이상이면 T2 기본값 + 상담 CTA 우선',()=>{const r=calculate({...base,revenue:'t4',industry:'unknown',trigger:'unknown',concern:'unknown'});assert.equal(r.consultFirst,true);assert.equal(r.tier,'T2');assert.equal(calculate({...base,industry:'unknown',trigger:'unknown'}).consultFirst,false);assert.equal(calculate({...base,timeSink:'unknown',industry:'unknown',trigger:'unknown'}).consultFirst,false,'워밍업은 세지 않음');});
test('예외 5: 맞춤 키워드 1개 이상이면 경로와 관계없이 맞춤 설계형',()=>{for(const patch of [{special:['timesheet']},{special:['report_form','production']},{projectNeeds:['pl']},{system:'other_switch',special:['integration']}])assert.equal(calculate({...base,...patch}).type,'custom');assert.equal(calculate({...base,special:['production','trade']}).type,'growth','표준 모듈은 맞춤 아님');});
test('PMS 함께 제안: 외감·상장, 더존 사용, IT·연구개발·로보틱스·건설이면 고정하고 주 추천에 있으면 중복하지 않음',()=>{
 for(const patch of [{audit:'external'},{system:'douzone_switch'},{industry:'it'},{industry:'research'},{industry:'robotics'},{industry:'construction'}]){const r=calculate({...base,...patch});assert.ok(r.products.includes('pms'),JSON.stringify(patch));assert.ok(r.companion.startsWith('PMS')||/PMS/.test(r.main.name),JSON.stringify(patch));}
 const plain=calculate(base);assert.equal(plain.pms,false);assert.ok(!plain.products.includes('pms'));
 const t3=calculate({...base,revenue:'t3',audit:'external'});assert.equal(t3.pms,false);assert.match(t3.main.name,/PMS/);
 const it=calculate({...base,industry:'it'});assert.equal(it.companion,'PMS(프로젝트 관리)');assert.match(it.proposal,/업종 모듈/);
});
test('응답 검증: 경로에 없는 문항·잘못된 값·“없음”과 다른 항목 동시 선택 거부',()=>{
 assert.ok(validateAnswers(base));assert.ok(validateAnswers(c));
 for(const bad of [{...base,currentErp:'amaranth'},{...base,revenue:'huge'},{...base,groupware:['none','approval']},{...base,special:[]},{...base,special:['production','production']},{...base,concern:undefined},{...c,accounting:'team'}])assert.equal(validateAnswers(bad),false,JSON.stringify(bad));
 assert.deepEqual(Object.keys(normalizeAnswers(base)),Object.keys(base));
});
test('리드 등급',()=>{const r=calculate(base);assert.equal(leadGrade({type:'consult',phone:'010-1234-5678',email:'a@b.co'},base,r),'A');assert.equal(leadGrade({type:'demo',phone:'010-1234-5678',email:'a@b.co'},{...base,timeline:'y1'},r),'C','전화번호는 무료 상담에서만');assert.equal(leadGrade({type:'report',email:'a@b.co'},{...base,timeline:'m3'},r),'B');assert.equal(leadGrade({type:'report',email:'a@b.co'},{...base,timeline:'research'},r),'C');assert.equal(leadGrade({type:'newsletter',email:'a@b.co'},{},{transfer:true}),'이관');});
test('모듈 구성: 업종 핵심 모듈 + 표준 모듈 특수 요구 + 그룹웨어(아마란스10 통합형 / WEHAGO 그룹웨어)',()=>{
 assert.deepEqual(calculate({...base,special:['trade'],groupware:['approval','attendance']}).moduleList,['생산·MRP, 원가, 재고','외화·수출입 관리','그룹웨어 통합(전자결재·근태·휴가)']);
 assert.equal(calculate({...base,revenue:'t1',groupware:['messenger']}).groupware,'WEHAGO 그룹웨어(메신저·협업)');
 assert.equal(calculate({...base,groupware:['none']}).groupware,'');
 assert.deepEqual(calculate({...base,industry:'it',special:['production']}).moduleList,['회계·인사, 프로젝트 원가','생산·재고 관리','그룹웨어 통합(전자결재)']);
 assert.equal(calculate({...base,revenue:'t3'}).companion,'내부회계·K-IFRS18 대응');
});
