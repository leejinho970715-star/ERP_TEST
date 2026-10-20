import { options, label, calculate, validateAnswers } from './supabase/functions/_shared/erp-rules.js';
import { resultCharacters, celebrate } from './erp-effects.js';

const app = document.querySelector('#app');
let stopCelebration = () => {};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { step: -1, contact: { company: '', manager: '', email: '' }, answers: { needs: [] }, consent: false, id: '', result: null, saved: false };
const titles = ['우리 회사의 업무는\n어떻게 관리하고 있나요?', '우리 회사는\n어떤 업종에 속하나요?', '현재 사용 중인\nERP를 알려주세요.', '우리 회사의\n규모는 어느 정도인가요?', 'ERP로 가장 먼저\n해결하고 싶은 일은 무엇인가요?'];
const hints = ['관리 도구와 실제 불편을 함께 확인해요.', '업종은 추가 확인할 업무를 정하는 데만 사용하며 점수를 더하지 않아요.', '현재 제품의 활용·설정 개선으로 해결할 수 있는지도 먼저 살펴봐요.', '매출은 선택 공개 정보예요. 추천 방향은 필요한 기능과 운영 범위를 중심으로 정해요.', '현재 부족하거나 추가로 필요한 기능만 골라주세요. ‘보완할 기능 없음’도 선택할 수 있어요.'];
const products = {
 wehago: { name: 'WEHAGO', ko: '위하고', tag: '필요한 업무 서비스를 선택하는 플랫폼', desc: 'Smart A 10의 회계·급여·물류와 결재·협업, WE PMS 등 필요한 서비스를 검토합니다. 단순 재고·프로젝트 수요도 범위를 확인해 비교할 수 있어요.', features: ['Smart A 10','물류·협업 서비스','WE PMS 범위 확인'], color:'sky', mark:'W' },
 amaranth: { name:'Amaranth 10', ko:'아마란스 10', tag:'연결할수록 커지는 업무의 가능성', desc:'ERP·그룹웨어·문서관리를 하나로 연결합니다. 부서 사이의 정보 흐름을 정리하고 전사 업무를 통합해 보세요.', features:['ERP·그룹웨어 통합','문서·결재 연결','전사 데이터 관리'], color:'violet',mark:'a' },
 omni: { name:'OmniEsol', ko:'옴니이솔', tag:'ERP·확장 솔루션·AI를 연결하는 플랫폼', desc:'ERP·확장 솔루션·그룹웨어·문서관리와 AI를 연결하는 플랫폼입니다. DEWS 개발 도구와 연계·운영 범위는 표준 기능을 먼저 확인한 뒤 비교해 보세요.',features:['ERP·확장 솔루션','DEWS·연계 범위 검토','AI·문서·협업'],color:'cyan',mark:'O' },
 oneai: { name:'ONE AI',ko:'원 AI',tag:'Amaranth 10과 함께 검토하는 AI',desc:'Amaranth 10의 선택형 AI 동반 후보로 제안합니다. 소개서는 OmniEsol과의 통합본이며, 실제 사용 제품에서의 제공 기능·권한·요금·데이터 활용 범위를 따로 확인해 주세요.',features:['AI 업무 지원','문서 활용','Amaranth 10 연계 검토'],color:'pink',mark:'AI' },
 pms: { name:'PMS',ko:'프로젝트 관리 솔루션',tag:'이미 갖춘 ERP에 프로젝트의 깊이를',desc:'프로젝트 일정·투입 인력·예산·원가 관리가 필요할 때 검토합니다. WE PMS와 Amaranth 10 PMS는 구분해야 하며, 현재 ERP와 연결되는 제품·모듈은 상담에서 확인합니다.',features:['프로젝트별 손익','인력·일정 관리','기존 ERP 연계 검토'],color:'blue',mark:'P' },
};
function mount(html, focus = true) {
 stopCelebration();
 app.innerHTML = html;
 if (focus) { app.focus({ preventScroll: true }); window.scrollTo({top:0,behavior:'instant'}); }
}
function button(text, id, style='primary') { return `<button class="button ${style}" id="${id}" type="button">${text}</button>`; }
function home() {
 state.step=-1;
 mount(`<section class="hero"><div class="hero-copy"><p class="eyebrow">FIND YOUR NEXT ERP</p><h1>우리 회사에 딱 맞는<br><span>ERP, 함께 찾아볼까요?</span></h1><p class="hero-description">업무 방식부터 우리 회사만의 고민까지.<br>5가지 질문으로 만나는 <strong>ERP 가상 컨설팅 진단</strong></p><div class="hero-actions"><span class="time-note">약 3분 · 5가지 질문</span>${button('우리 회사 ERP 진단하기 <span aria-hidden="true">↗</span>','start')}</div><div class="hero-points"><span>01 <b>우리 회사 이해하기</b></span><span>02 <b>업무 니즈 분석하기</b></span><span>03 <b>맞춤 ERP 만나기</b></span></div></div><div class="hero-art"><img class="dashboard" src="assets/erp-dashboard.png" alt="막대그래프와 도넛 차트가 있는 심플한 3D ERP 대시보드" fetchpriority="high" width="1424" height="1104"></div><div class="hero-bottom"><span class="scroll-line"></span> 복잡한 ERP 선택, 이제 쉽게 시작하세요.</div></section>`,false);
 document.querySelector('#start').onclick=()=>{state.step=0;contactPage();};
}
function contactPage() {
 state.step=0;
 mount(`<section class="flow screen"><div class="section-heading"><span class="eyebrow">BEFORE WE START</span><h1>반갑습니다!<br>어떤 회사를 위한 진단인가요?</h1><p>결과를 안내받으실 기본 정보만 알려주세요.</p></div><form id="contact-form" class="panel contact-panel"><label class="field">회사명<input name="company" autocomplete="organization" maxlength="100" placeholder="회사명을 입력해 주세요" value="${esc(state.contact.company)}" required></label><div class="field-row"><label class="field">담당자명<input name="manager" autocomplete="name" maxlength="60" placeholder="담당자 성함" value="${esc(state.contact.manager)}" required></label><label class="field">이메일 주소<input name="email" type="email" autocomplete="email" maxlength="254" placeholder="name@company.com" value="${esc(state.contact.email)}" required></label></div><div class="consent-line"><label><input id="consent" type="checkbox" ${state.consent?'checked':''} required> <span>진단 정보 이용에 동의합니다. <b>(필수)</b></span></label><button type="button" class="text-button" id="privacy">내용 보기</button></div><div class="flow-actions">${button('이전','back','secondary')}<button class="button primary" type="submit">진단 시작하기 <span aria-hidden="true">→</span></button></div></form></section>`);
 const form=document.querySelector('#contact-form');
 document.querySelector('#privacy').onclick=()=>document.querySelector('#privacy-dialog').showModal();
 document.querySelector('#back').onclick=home;
 form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);for(const key of ['company','manager','email']) { const input=form.elements.namedItem(key);input.value=String(data.get(key)).trim();if(!input.value){input.setCustomValidity('공백 없이 내용을 입력해 주세요.');input.reportValidity();input.oninput=()=>input.setCustomValidity('');return;}state.contact[key]=input.value; }state.consent=true;state.consentAt=new Date().toISOString();state.step=1;question();};
}
function choiceGroup(key, multi=false, compact=false) {
 const value=state.answers[key];
 return `<div class="choices ${compact?'compact':''} ${key==='industry'?'industry-grid':''}" role="group" aria-label="${esc({pain:'현재 불편',complexity:'운영 범위',currentProduct:'현재 더존 제품',level:'더존 ERP 활용 레벨',category:'희망 ERP 카테고리',revenue:'연 매출',staff:'임직원 수',custom:'맞춤 개발 여부',needs:'필요한 기능'}[key]||titles[state.step-1])}">${options[key].map(([id,title,note],i)=>{const selected=multi?value?.includes(id):value===id;return `<button type="button" class="choice ${selected?'selected':''}" data-key="${key}" data-value="${id}" aria-pressed="${!!selected}"><span class="choice-number">${multi?(selected?'✓':'+'):String(i+1).padStart(2,'0')}</span><span><b>${title}</b>${note?`<small>${note}</small>`:''}</span><span class="choice-check" aria-hidden="true">${selected?'✓':'○'}</span></button>`;}).join('')}</div>`;
}
function complete(step) {
 const a=state.answers;
 return step===1?!!a.management&&!!a.pain:step===2?!!a.industry:step===3?!!a.erp&&(a.erp==='douzone'?!!a.level&&!!a.currentProduct:!!a.category):step===4?!!a.revenue&&!!a.staff&&!!a.complexity:!!a.needs?.length&&!!a.custom;
}
function question(focus=true) {
 const n=state.step;
 let content=n===1?`${choiceGroup('management')}<div class="subquestion"><h2>현재 어떤 불편이 있나요?</h2>${choiceGroup('pain',false,true)}</div>`:n===2?choiceGroup('industry'):n===3?`${choiceGroup('erp')}${state.answers.erp?`<div class="subquestion">${state.answers.erp==='douzone'?`<h2>현재 사용 중인 더존 제품</h2>${choiceGroup('currentProduct',false,true)}<h2 class="subheading">실제 활용 수준은 어느 정도인가요?</h2>${choiceGroup('level',false,true)}`:`<h2>주로 관심 있는 업무 영역은 무엇인가요?</h2>${choiceGroup('category',false,true)}`}</div>`:''}`:n===4?`<div class="subquestion first"><h2>연 매출 규모 <small>· 비공개 선택 가능</small></h2>${choiceGroup('revenue',false,true)}</div><div class="subquestion"><h2>임직원 수</h2>${choiceGroup('staff',false,true)}</div><div class="subquestion"><h2>함께 관리할 운영 범위</h2>${choiceGroup('complexity',false,true)}</div>`:`${choiceGroup('needs',true)}<div class="subquestion"><h2>표준 기능 외의 별도 개발·연계가 필요한가요?</h2>${choiceGroup('custom',false,true)}</div>`;
 mount(`<section class="flow question-flow screen"><div class="progress-meta"><span>우리 회사 알아보기</span><b><span class="current-step">0${n}</span> / 05</b></div><div class="progress" role="progressbar" aria-label="진단 진행률" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="5"><i style="width:${n*20}%"></i></div><div class="question-heading"><span class="eyebrow">QUESTION 0${n}</span><h1>${titles[n-1].replace('\n','<br>')}</h1><p>${hints[n-1]}</p>${n===5?'<span class="selection-note">복수 선택 가능</span>':''}</div><div class="panel question-panel">${content}<p id="question-error" class="error" role="alert"></p><div class="flow-actions">${button('← 이전','back','secondary')}<span class="step-caption">${n===5?'마지막 질문이에요':`${5-n}개 질문이 남았어요`}</span>${button(n===5?'맞춤 결과 확인하기 ↗':'다음 질문 →','next')}</div></div></section>`,focus);
 document.querySelectorAll('[data-key]').forEach(el=>el.onclick=()=>{
  const {key,value}=el.dataset;
  if(key==='needs'){const list=state.answers.needs;if(value==='none')state.answers.needs=['none'];else state.answers.needs=list.includes(value)?list.filter(x=>x!==value):[...list.filter(x=>x!=='none'),value];}
  else {state.answers[key]=value;if(key==='erp'){delete state.answers.level;delete state.answers.category;delete state.answers.currentProduct;}}
  const scroll=window.scrollY;question(false);window.scrollTo({top:scroll,behavior:'instant'});document.querySelector(`[data-key="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});
 });
 document.querySelector('#back').onclick=()=>{state.step--;state.step===0?contactPage():question();};
 document.querySelector('#next').onclick=()=>{if(!complete(n)){const error=document.querySelector('#question-error');error.textContent='선택하지 않은 항목을 확인해 주세요.';return;}if(n<5){state.step++;question();}else analyze();};
}
function analyze() {
 state.result=calculate(state.answers);state.id=crypto.randomUUID();state.saved=false;
 mount(`<section class="loading screen"><div class="analysis-orb"><span>✦</span></div><p class="eyebrow">CONNECTING THE DOTS</p><h1>우리 회사의 다음 ERP를<br>찾고 있어요.</h1><p id="loading-copy" role="status" aria-live="polite">업종과 업무 방식을 살펴보고 있어요</p><div class="analysis-bars"><i></i><i></i><i></i></div></section>`);
 setTimeout(()=>{const copy=document.querySelector('#loading-copy');if(copy)copy.textContent='성장 규모와 필요한 기능을 연결하고 있어요';},650);
 setTimeout(()=>{resultPage();saveResponse();},1600);
}
function productGuides(id) {
 const guides=window.ERP_CONFIG?.productGuides?.[id]||[];
 if(!guides.length)return id==='pms'?'<div class="product-guides"><a class="button secondary guide-link" href="https://www.duzon119.co.kr/product/pms.asp" target="_blank" rel="noopener noreferrer">PMS 공식 안내 보기 ↗<small>별도 PMS 소개서 미제공 · 새 탭</small></a></div>':'';
 return `<div class="product-guides">${guides.map(g=>`<div class="guide-item"><a class="button secondary guide-link" href="${esc(g.href)}#page=${g.page}" target="_blank" rel="noopener noreferrer" aria-label="${esc(products[id].name+' '+g.label+' (새 탭)')}"><span>${esc(g.label)} ↗</span><small>${esc(g.meta)} · 새 탭</small></a><a class="guide-download" href="${esc(g.href)}" download aria-label="${esc(products[id].name+' '+g.label.replace(' 보기',' 다운로드'))}">다운로드 ↓</a></div>`).join('')}<p class="guide-note">모바일에서 PDF가 열리지 않으면 다운로드해 확인해 주세요.</p></div>`;
}
function productCard(id,index) {
 const p=products[id],icon=window.ERP_CONFIG?.productIcons?.[id];
 return `<article class="product-card ${p.color}" style="--delay:${index*80}ms"><div class="product-top"><span class="product-type">${state.result?.existingProducts?.includes(id)?'기존 제품 활용 검토':id==='oneai'?'선택형 AI 동반 검토':id==='pms'?'프로젝트 수요 확장 후보':'업무 수요 기반 후보'}</span><div class="product-icon">${icon?`<img src="${esc(icon)}" alt="${esc(p.name)} 제품 아이콘">`:`<span aria-label="프로젝트 관리">${p.mark}</span>`}</div></div><p class="product-tag">${p.tag}</p><h3>${p.name}</h3><span class="product-ko">${p.ko}</span><p class="product-description">${p.desc}</p><div class="tags">${p.features.map(t=>`<span>${t}</span>`).join('')}</div>${productGuides(id)}</article>`;
}
function reasons() {
 const a=state.answers,r=state.result;
 const prompts={ai:'연구·개발 인건비 배분과 프로젝트별 손익이 실제로 필요한지 확인해요.',robotics:'부품·재고·생산 원가와 연구개발 과제를 각각 확인해요. 원재료비가 낮다고 가정하지 않아요.',research:'과제별 예산·투입 인력·증빙 관리의 필요 여부를 확인해요.',manufacturing:'BOM·생산·재고·원가·추적 관리 중 필수 범위를 확인해요.',construction:'현장별 예산·기성·외주·손익 관리의 필요 여부를 확인해요.',service:'인력·고객·계약·프로젝트 청구의 연결이 필요한지 확인해요.',distribution:'품목·창고·반품·매입/매출 흐름을 확인해요.',other:'실제 업무 흐름과 필수 기능을 상담에서 구체화해요.'};
 return [
  {title:'실제로 선택한 보완 업무를 반영했어요',text:a.needs.includes('none')?'당장 보완할 기능이 없다고 답해 불필요한 신규 도입을 우선 권하지 않아요.':`선택한 보완 업무(${a.needs.map(id=>label('needs',id)).join(', ')})를 검토 범위로 삼았어요. 기능 지원 여부와 비용은 별도로 확인해야 해요.`},
  {title:r.route==='clarify'?'추가 확인 후 후보를 좁혀요':'기존 시스템과 운영 범위를 함께 살펴봤어요',text:r.route==='clarify'?'현재 불편·운영 범위·제품명·맞춤 개발 여부 중 확인되지 않은 정보가 있거나 답변을 함께 확인해야 해요. 이를 낮은 레벨로 평가하지 않아요.':a.erp!=='none'?'기존 제품의 모듈·설정·교육으로 해결되는지 먼저 점검해요. 더존 ERP를 사용하고 프로젝트 관리 수요가 있을 때만 PMS를 확장 후보로 제안해요.':a.custom==='custom'||a.complexity==='group'?'별도 개발·연계 또는 여러 법인 운영이 있어 표준 기능 충족 여부와 확장 설계를 비교해요. 맞춤 기능의 제공을 보장하는 결과는 아니에요.':'ERP 미사용 상태에서 선택한 기능에 맞춰 기본 경영 관리 또는 업무 통합 후보를 살펴봤어요.'},
  {title:'업종·매출은 등급으로 바꾸지 않아요',text:`${label('industry',a.industry)}: ${prompts[a.industry]} 업종·매출·인원은 상담 맥락으로만 참고하고, 후보는 실제 업무 조건으로 검토해요.`},
 ];
}
function recommendationDetails() {
 const a=state.answers;
 return [['현재 업무의 불편',label('pain',a.pain||'unknown')],['운영 범위',label('complexity',a.complexity||'unknown')],['현재 ERP',label('erp',a.erp)],...(a.erp==='douzone'?[['현재 제품',label('currentProduct',a.currentProduct||'unknown')],['자기평가 활용도',label('level',a.level)]]:[['관심 영역',label('category',a.category)]]),['보완할 기능',a.needs.map(id=>label('needs',id)).join(' / ')],['별도 개발·연계',label('custom',a.custom)],['연 매출 (참고)',label('revenue',a.revenue)],['임직원 (참고)',label('staff',a.staff)]];
}
function resultPage() {
 const r=state.result,a=state.answers;
 const headings={clarify:'업무 요구사항을 확인하면,\n더 적합한 후보를 찾을 수 있어요.',maintain:'지금의 방식을 살펴보고,\n필요한 부분만 보완하세요.',optimize:'이미 갖춘 ERP에서,\n개선의 가능성을 먼저 찾아보세요.',basic:'기본 경영 업무부터,\n필요한 범위를 차근차근.',integrate:'연결이 필요한 업무부터,\n통합 범위를 구체화해 보세요.',compare:'표준 기능과 확장 설계를,\n함께 비교해 보세요.'};
 const heading=headings[r.route];
 const company=state.contact.company||'우리 회사';
 mount(`<section class="results screen">
 <div class="result-hero"><span class="pill"><i></i> ERP CONSULTING REPORT</span><p class="result-company">${esc(company)}를 위한 예비 검토</p><h1>${heading.replace('\n','<br>')}</h1><p>기업의 레벨을 매기는 대신, 실제 업무 수요에 맞는 검토 방향을 제안해요.</p><div class="result-chips"><span>${label('industry',a.industry)}</span><span>${r.routeLabel}</span><span>업무 수요 중심</span></div>${r.thanks?'<div class="thanks">✦ 더존 ERP를 사용해주셔서 감사합니다.<br><span>현재 제품을 더 잘 활용하는 방향도 함께 검토해요.</span></div>':''}</div>
 <div class="scope-notice">아이원소프트뱅크가 취급하는 더존 제품 범위 내의 예비 제안입니다. 타사 전체를 비교한 순위·공식 인증·도입 효과 예측은 아닙니다.</div>
 <div class="report-grid"><div class="score-panel panel"><span class="eyebrow">REVIEW DIRECTION</span><h2>우선 검토 방향</h2><strong class="route-title">${r.routeLabel}</strong><p>${r.route==='clarify'?'모르는 항목은 불이익 없이 추가 확인 대상으로 남겨두었어요.':'제품 구매를 결정하기 전에 현재 기능과 필요한 업무의 차이를 먼저 확인해요.'}</p><ul class="fit-checks"><li>필요한 기능으로 후보 선정</li><li>매출·인원으로 상위 제품 강제하지 않음</li><li>예산·거래량·담당자·도입 일정은 추가 확인</li></ul></div><div class="reasons panel"><h2>이렇게 판단했어요</h2>${reasons().map((reason,i)=>`<div class="reason"><span>0${i+1}</span><div><h3>${reason.title}</h3><p>${esc(reason.text)}</p></div></div>`).join('')}</div></div>
 <div class="section-title"><div><span class="eyebrow">CANDIDATES TO REVIEW</span><h2>${r.products.length?'상담에서 확인할 후보 솔루션':'신규 도입보다 먼저 확인할 사항'}</h2></div><span>${r.products.includes('oneai')?'ONE AI는 선택적으로 함께 검토해요':'도입·교체를 확정하는 결과가 아닙니다'}</span></div>
 ${r.products.includes('amaranth')?'<aside class="scope-notice comparison-note"><b>같은 업무라도 필요한 깊이에 따라 후보가 달라져요.</b><br>WEHAGO에도 물류·생산·WE PMS 서비스가 있습니다. 단순 재고·일정 관리인지, BOM·MRP·원가와 부서 간 결재·문서까지 연결할지 확인한 뒤 비교하세요. <a href="brochures/wehago-overview.pdf#page=14" target="_blank" rel="noopener noreferrer">WEHAGO 범위도 PDF로 확인 ↗</a></aside>':''}
 ${r.products.length?`<div class="product-grid ${r.products.length===1?'single-product':''}">${r.products.map(productCard).join('')}</div>`:`<div class="panel no-purchase"><h3>${r.route==='clarify'?'답변을 보완하면 후보를 더 정확히 좁힐 수 있어요.':'현재 도구의 기능·설정·교육을 먼저 점검해 보세요.'}</h3><p>${r.route==='clarify'?'담당 부서와 현재 불편, 사용 제품, 운영 범위, 필요한 기능을 확인한 뒤 다시 진단해 주세요.':'보유한 모듈과 업무 절차로 해결할 수 있는지 확인하고, 해결되지 않는 요구사항에 대해서만 신규 제품을 비교하는 것이 좋습니다.'}</p></div>`}
 <div class="next-panel panel"><div><span class="eyebrow">BEFORE YOU DECIDE</span><h2>실제 도입 판단은,<br>업무 시나리오로 확인하세요.</h2></div><ol><li><b>필수 업무·예산 정리</b><span>실사용 인원, 월 거래량, 예산, 담당자와 목표 일정을 확인해요.</span></li><li><b>표준 기능으로 먼저 시연</b><span>보유 모듈과 후보 제품에서 실제 업무가 처리되는지 확인해요.</span></li><li><b>총비용·이전·운영 비교</b><span>라이선스, 개발·연계, 데이터 이전, 유지보수와 교육 비용을 함께 비교해요.</span></li></ol></div>
 <details class="rules panel"><summary>추천 기준과 내 답변 자세히 보기</summary><p>업종·매출·인원에 점수를 더하거나 50점 같은 임계값으로 제품을 나누지 않습니다. 현재 불편, 보완할 기능, 운영 복잡도와 기존 시스템을 기준으로 유지·활용 개선·후보 비교 방향을 정합니다. 자기평가 활용도는 객관적인 성숙도 등급이 아닙니다.</p><dl>${recommendationDetails().map(([key,value])=>`<div><dt>${key}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p>구체적인 제품명·에디션·모듈 지원, 예산, 거래량, 데이터 이전과 도입 준비도는 상담에서 추가 확인해야 합니다. 본 규칙의 전환율·정확도는 아직 실증 검증되지 않았습니다.</p><p>규칙 버전: ${r.ruleVersion} · 기존 공유 링크도 최신 기준으로 다시 검토합니다.</p></details>
 <div class="result-actions">${button('이미지로 저장','download','secondary')}${button('PDF로 저장','print','secondary')}${button('결과 링크 공유','share')}${button('다시 진단하기','restart','text-button')}</div><p class="save-status" id="save-status" role="status">${state.shared?'공유된 답변을 최신 기준으로 검토했습니다. 회사명·담당자·이메일은 포함되지 않습니다.':state.saved?'진단 응답이 저장되었습니다.':'진단 결과는 현재 화면에서 확인할 수 있습니다.'}</p><p class="product-source">첨부 소개서는 기능 이해를 위한 자료이며, 계약 시점의 제품·에디션·모듈·요금은 별도 확인해 주세요.<br>제품 소개 참고: <a href="https://www.duzon119.co.kr/" target="_blank" rel="noopener">아이원소프트뱅크 ↗</a> · <a href="https://www.douzone.com/product/bportal.jsp" target="_blank" rel="noopener">더존 공식 제품 안내 ↗</a></p></section>`);
 const characters=document.createElement('div');characters.className='result-characters';
 characters.innerHTML=resultCharacters.map(character=>`<img class="result-character" src="${character.src}" alt="진단 완료를 축하하는 ${character.name} 캐릭터" width="1254" height="1254">`).join('');
 document.querySelector('.result-hero .pill').insertAdjacentElement('afterend',characters);
 const confetti=document.createElement('canvas');confetti.className='confetti-canvas';confetti.setAttribute('aria-hidden','true');
 app.prepend(confetti);stopCelebration=celebrate(confetti);
 document.querySelector('#restart').onclick=()=>{state.answers={needs:[]};state.contact={company:'',manager:'',email:''};state.consent=false;state.result=null;state.shared=false;state.saved=false;history.replaceState(null,'',location.pathname);home();};
 document.querySelector('#print').onclick=()=>window.print();
 document.querySelector('#download').onclick=download;
 document.querySelector('#share').onclick=share;
}
async function saveResponse() {
 if(state.shared)return;
 const cfg=window.ERP_CONFIG||{},status=document.querySelector('#save-status');
 if(!cfg.endpoint){status.textContent='진단이 완료되었습니다. 현재는 서버 저장 없이 결과를 제공하고 있어요.';return;}
 status.textContent='진단 응답을 저장하고 있어요…';
 try{const response=await fetch(cfg.endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({id:state.id,...state.contact,answers:state.answers,privacy_agreed:true,consented_at:state.consentAt})});if(!response.ok)throw Error();state.saved=true;status.textContent='진단 응답이 안전하게 저장되었습니다.';}catch{status.innerHTML='서버에 저장하지 못했어요. 결과는 다운로드할 수 있습니다. <button class="text-button" id="retry-save">저장 다시 시도</button>';document.querySelector('#retry-save').onclick=saveResponse;}
}
async function share() {
 const url=new URL(location.pathname,location.origin);url.searchParams.set('r',btoa(encodeURIComponent(JSON.stringify(state.answers))));
 const status=document.querySelector('#save-status');
 try{if(navigator.share)await navigator.share({title:'ERP 가상 컨설팅 진단 결과',url:url.href});else{await navigator.clipboard.writeText(url.href);status.textContent='개인정보가 제외된 결과 링크를 복사했어요.';}}catch(error){if(error.name!=='AbortError')status.textContent='링크 복사 권한을 확인해 주세요.';}
}
async function download() {
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1100;const ctx=canvas.getContext('2d');
 const grad=ctx.createLinearGradient(0,0,1200,1100);grad.addColorStop(0,'#eff8ff');grad.addColorStop(1,'#e9eaff');ctx.fillStyle=grad;ctx.fillRect(0,0,1200,1100);
 ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(60,60,1080,980,32);ctx.fill();
 ctx.fillStyle='#4478e8';ctx.font='600 20px Pretendard, sans-serif';ctx.fillText('ERP VIRTUAL CONSULTING REPORT',110,125);
 ctx.fillStyle='#14294b';ctx.font='700 42px Pretendard, sans-serif';ctx.fillText('우리 회사에 맞는 ERP 가상 컨설팅 진단',110,200);
 ctx.font='500 24px Pretendard, sans-serif';ctx.fillStyle='#61718d';ctx.fillText(label('industry',state.answers.industry)+' · 연 매출 '+label('revenue',state.answers.revenue),110,250);
 ctx.fillStyle='#386ce5';ctx.font='700 40px Pretendard, sans-serif';ctx.fillText(state.result.routeLabel,110,350);ctx.font='400 22px Pretendard, sans-serif';ctx.fillText('업무 수요를 바탕으로 한 예비 검토 · 기업 등급 아님',110,400);
 for(const [index,character] of resultCharacters.entries()){
  const portrait=new Image();portrait.src=character.src;
  try{await portrait.decode();const scale=Math.min(85/portrait.naturalWidth,155/portrait.naturalHeight);const width=portrait.naturalWidth*scale,height=portrait.naturalHeight*scale;ctx.drawImage(portrait,920+index*85+(85-width)/2,275+(155-height)/2,width,height);}catch{/* 캐릭터 로딩 실패 시에도 결과를 저장합니다. */}
 }

 let y=485;if(!state.result.products.length){ctx.fillStyle='#61718d';ctx.font='500 26px Pretendard, sans-serif';ctx.fillText('기존 기능 점검 또는 요구사항 추가 확인을 먼저 권합니다.',110,y);}for(const id of state.result.products){const p=products[id];ctx.fillStyle='#14294b';ctx.font='700 30px Pretendard, sans-serif';ctx.fillText(p.name,110,y);ctx.fillStyle='#61718d';ctx.font='400 21px Pretendard, sans-serif';ctx.fillText(p.tag,430,y);y+=78;}
 ctx.fillStyle='#61718d';ctx.font='400 20px Pretendard, sans-serif';ctx.fillText('더존 제품 범위 내 예비 제안이며, 업종·매출에 가산점을 주지 않습니다.',110,920);ctx.fillText('구체적인 제품 기능과 도입 범위는 상세 상담에서 확인해 주세요.',110,955);ctx.fillStyle='#14294b';ctx.font='700 22px Pretendard, sans-serif';ctx.fillText('아이원소프트뱅크',110,1005);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ERP-컨설팅-진단결과.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
const shared=new URLSearchParams(location.search).get('r');
if(shared){try{if(shared.length>3000)throw Error();const answers=JSON.parse(decodeURIComponent(atob(shared)));if(!validateAnswers(answers))throw Error();state.answers=answers;state.result=calculate(answers);state.shared=true;resultPage();}catch{home();const note=document.createElement('p');note.className='link-error';note.textContent='결과 링크가 올바르지 않습니다. 새로운 진단을 시작해 주세요.';app.prepend(note);}}else home();
