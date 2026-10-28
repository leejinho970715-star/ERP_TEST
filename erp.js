import { options, label, calculate, validateAnswers, normalizeAnswers, questionKeys, multiKeys, pathOf, tierLabels, pathLabels } from './supabase/functions/_shared/erp-rules.js';
import { resultCharacters, celebrate } from './erp-effects.js';
import { products } from './erp-products.js';
import { drawResultCard, savePng, summaryLines as summarize } from './erp-report.js';

const app = document.querySelector('#app');
let stopCelebration = () => {};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { step: -1, answers: {}, id: '', result: null, shared: false, leads: [] };
const TOTAL = 14;
// 문항 문구: 정중한 비즈니스 톤, 상황형 문항은 “우리 회사 모습에 가까운 것”으로 묻습니다.
const questions = {
 role: { eyebrow:'WARM-UP 1', title:'오늘 이 테스트를 열어 보신 분은\n어떤 일을 맡고 계십니까?', hint:'정답은 없습니다. 결과 안내를 맡으신 업무에 맞춰 드립니다.' },
 timeSink: { eyebrow:'WARM-UP 2', title:'요즘 업무 중 가장 시간을\n많이 쓰시는 일은 무엇입니까?', hint:'가볍게 골라 주십시오. 결과의 추천 이유 첫 줄에 반영합니다.' },
 industry: { title:'귀사의 주력 업종은\n어디에 가장 가깝습니까?', hint:'업종은 제품이 아니라 함께 살펴볼 모듈 구성을 정하는 데 씁니다.', transition:'이제 회사에 맞는 방향을 찾아보겠습니다.' },
 revenue: { title:'지난해 기준 연 매출 규모를\n선택해 주십시오.', hint:'규모 등급을 정하는 기준입니다. 정확하지 않아도 괜찮습니다.' },
 audit: { title:'외부감사 대상이거나\n상장을 준비하고 계십니까?', hint:'해당하시면 내부회계·공시 대응까지 함께 살펴봅니다.' },
 system: { title:'현재 회계·경영 관리는\n어떻게 하고 계십니까?', hint:'답변에 따라 이어지는 질문이 달라집니다.' },
 accounting: { title:'월말 결산 날,\n우리 회사 모습에 가까운 것은?', hint:'회계를 맡는 방식에 따라 알맞은 구성이 달라집니다.' },
 projectNeeds: { title:'혹시 프로젝트나 현장 단위로\n관리가 필요하십니까?', hint:'해당하는 항목을 모두 골라 주십시오.' },
 trigger: { title:'ERP 도입이나 교체를\n검토하게 된 계기는 무엇입니까?', hint:'결과 안내 문구를 맞추는 데 씁니다.' },
 special: { title:'ERP 도입으로 가장 먼저\n개선되길 바라는 업무는 무엇입니까?', titleC:'더하고 싶은 기능에\n가장 가까운 것은 무엇입니까?', hint:'평소 쓰시는 말로 적었습니다. 해당하는 항목을 모두 골라 주십시오.' },
 groupware: { title:'전자결재나 근태 관리 도구도\n함께 필요하십니까?', hint:'해당하는 항목을 모두 골라 주십시오.' },
 currentErp: { title:'지금 쓰시는 ERP는 무엇이며,\n어디에서 도입하셨습니까?', hint:'도입하신 곳에 따라 안내해 드릴 창구가 달라집니다.', sub:{ currentErp:'사용 중인 ERP', vendor:'도입한 곳' } },
 scope: { title:'그 기능이 필요한 부서와 인원은\n어느 정도입니까?', hint:'확장할 범위에 맞춰 구성을 제안합니다.' },
 integration: { title:'현재 시스템과 데이터가\n자동으로 이어져야 합니까?', hint:'연동 범위에 따라 SI 개발 여부를 살펴봅니다.' },
 hardTasks: { title:'표준 기능으로 해결이\n어려웠던 업무가 있습니까?', hint:'맞춤 구성이 필요한 정도를 가늠합니다.' },
 deploy: { title:'클라우드와 구축형 중\n선호하시는 방식이 있습니까?', hint:'추천 제품은 바뀌지 않고, 제안 방식만 맞춰 드립니다.' },
 timeline: { title:'도입 또는 개선은\n언제쯤 계획하고 계십니까?', hint:'안내 일정을 맞추는 데 씁니다.' },
 concern: { title:'가장 걱정되는 점은\n무엇입니까?', hint:'결과에서 걱정을 덜어 드릴 지원 방법을 안내합니다.' },
};
const honorific = { ceo:'대표님', finance:'회계·재무 담당자님', hr:'인사·총무 담당자님', it:'IT·전산 담당자님', other:'담당자님' };
const roleFocus = { ceo:' 경영 현황을 한눈에 보는 흐름을 함께 살폈습니다.', finance:' 결산·보고 시간을 줄이는 기능을 중심으로 보았습니다.', hr:' 근태·급여가 이어지는 흐름을 함께 살폈습니다.', it:' 시스템 연동과 운영 부담을 함께 고려했습니다.', other:'' };
const concernCopy = {
 cost:['비용이 걱정되신다면','필요한 모듈부터 단계적으로 도입하는 구성과 예상 비용을 상담에서 함께 정리해 드립니다.'],
 education:['교육과 사용 적응이 걱정되신다면','도입 후 사용자 교육과 운영이 자리 잡을 때까지의 지원을 함께 안내해 드립니다.'],
 migration:['데이터 이전이 걱정되신다면','기존 데이터의 이전 범위와 방법을 도입 전에 먼저 점검해 드립니다.'],
 schedule:['도입 일정이 걱정되신다면','목표 일정에 맞춘 단계별 도입 계획을 함께 세워 드립니다.'],
 unknown:['아직 걱정되는 점을 정하기 어렵다면','비용·교육·데이터 이전·일정을 상담에서 차례로 확인해 드립니다.'],
};
const deployCopy = { cloud:'클라우드로 빠르게 시작하는 방식을 기준으로 안내합니다.', onprem:'자체 서버에 설치하는 구축형 방식을 기준으로 안내합니다.', unknown:'클라우드와 구축형을 비교해 안내합니다.' };
function mount(html, focus = true) {
 stopCelebration();
 app.innerHTML = html;
 if (focus) { app.focus({ preventScroll: true }); window.scrollTo({top:0,behavior:'instant'}); }
}
function button(text, id, style='primary') { return `<button class="button ${style}" id="${id}" type="button">${text}</button>`; }
// 지금까지의 답으로 실제로 묻는 문항만 남깁니다(경로를 바꾸면 이전 경로의 답은 결과에 쓰지 않습니다).
const asked = () => Object.fromEntries(questionKeys(state.answers).flat().filter(key=>state.answers[key]!==undefined).map(key=>[key,state.answers[key]]));
const totalSteps = () => state.answers.system ? questionKeys(state.answers).length : TOTAL;

function home() {
 state.step=-1;
 mount(`<section class="hero"><div class="hero-copy"><p class="eyebrow">FIND YOUR NEXT ERP</p><h1>우리 회사에 맞는<br><span>ERP, 함께 찾아보겠습니다.</span></h1><p class="hero-description">현재 업무 환경을 점검하고, 회사 규모와 관리 방식에 맞는 <br><strong>더존 ERP 추천 1개와 함께 제안 1개</strong>를 안내합니다.</p><div class="hero-actions"><span class="time-note">약 3~4분 · 14문항 · 결과는 바로 공개</span>${button('우리 회사 ERP 진단하기 <span aria-hidden="true">↗</span>','start')}<a class="button secondary website-link" href="https://www.duzon119.co.kr/">아이원소프트뱅크 웹사이트 바로가기 <span aria-hidden="true">↗</span></a></div><ol class="hero-journey" aria-label="ERP 진단 진행 순서"><li><span class="journey-number" aria-hidden="true">01</span><strong>현재 모습<span>점검하기</span></strong></li><li><span class="journey-number" aria-hidden="true">02</span><strong>함께 성장할<span>방향 찾기</span></strong></li><li><span class="journey-number" aria-hidden="true">03</span><strong>다음 단계<span>제안받기</span></strong></li></ol></div><div class="hero-art"><img class="dashboard" src="assets/erp-dashboard.png" alt="막대그래프와 도넛 차트가 있는 심플한 3D ERP 대시보드" fetchpriority="high" width="1424" height="1104"></div><div class="hero-bottom"><span class="scroll-line"></span> 복잡한 ERP 선택, 이제 쉽게 시작하십시오.</div></section>`,false);
 document.querySelector('#start').onclick=()=>{state.answers={};state.step=0;state.leads=[];state.lead=null;question();};
}
function choiceGroup(key) {
 const multi=multiKeys.includes(key), value=state.answers[key];
 const rows=options[key];
 // 선택지가 많고 짧을 때(업종 등)만 2열로 놓습니다. 긴 문장 선택지는 좁은 화면에서 한 열로 둡니다.
 return `<div class="choices ${rows.length>6&&rows.every(row=>row[1].length<=14)?'industry-grid':''}" role="group" aria-label="${esc(questions[key]?.sub?.[key]||questions[key]?.title.replace('\n',' ')||questions.currentErp.sub[key])}">${rows.map(([id,title],i)=>{const selected=multi?value?.includes(id):value===id;return `<button type="button" class="choice ${selected?'selected':''}" data-key="${key}" data-value="${id}" aria-pressed="${!!selected}"><span class="choice-number">${multi?(selected?'✓':'+'):String(i+1).padStart(2,'0')}</span><span><b>${esc(title)}</b></span><span class="choice-check" aria-hidden="true">${selected?'✓':'○'}</span></button>`;}).join('')}</div>`;
}
function question(focus=true) {
 const keys=questionKeys(state.answers)[state.step], first=keys[0], q=questions[first];
 const n=state.step+1, total=totalSteps(), last=n===total;
 const title=first==='special'&&pathOf(state.answers.system)==='C'?q.titleC:q.title;
 const multi=keys.some(key=>multiKeys.includes(key));
 const content=keys.length>1?keys.map((key,i)=>`<div class="subquestion ${i?'':'first'}"><h2>${esc(q.sub[key])}</h2>${choiceGroup(key)}</div>`).join(''):choiceGroup(first);
 mount(`<section class="flow question-flow screen"><div class="progress-meta"><span>${state.step<2?'가볍게 시작하기':'우리 회사 알아보기'}</span><b><span class="current-step">${String(n).padStart(2,'0')}</span> / ${String(total).padStart(2,'0')}</b></div><div class="progress" role="progressbar" aria-label="진단 진행률" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${total}"><i style="width:${n/total*100}%"></i></div><div class="question-heading">${q.transition?`<p class="transition-note">${q.transition}</p>`:''}<span class="eyebrow">${q.eyebrow||'QUESTION '+String(n-2).padStart(2,'0')}</span><h1>${esc(title).replace('\n','<br>')}</h1><p>${q.hint}</p>${multi?'<span class="selection-note">복수 선택 가능</span>':''}</div><div class="panel question-panel">${content}<p id="question-error" class="error" role="alert"></p><div class="flow-actions">${button('← 이전','back','secondary')}<span class="step-caption">${last?'마지막 질문입니다':`${total-n}개 질문이 남았습니다`}</span>${button(last?'결과 확인하기 ↗':'다음 질문 →','next')}</div></div></section>`,focus);
 document.querySelectorAll('[data-key]').forEach(el=>el.onclick=()=>{
  const {key,value}=el.dataset;
  if(multiKeys.includes(key)){const list=state.answers[key]||[],only=['none','unknown','using'];state.answers[key]=only.includes(value)?(list.includes(value)?[]:[value]):list.includes(value)?list.filter(x=>x!==value):[...list.filter(x=>!only.includes(x)),value];}
  else state.answers[key]=value;
  const scroll=window.scrollY;question(false);window.scrollTo({top:scroll,behavior:'instant'});document.querySelector(`[data-key="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});
 });
 document.querySelector('#back').onclick=()=>{if(state.step===0)return home();state.step--;question();};
 document.querySelector('#next').onclick=()=>{
  if(!keys.every(key=>multiKeys.includes(key)?state.answers[key]?.length:state.answers[key])){document.querySelector('#question-error').textContent='선택하지 않은 항목을 확인해 주십시오.';return;}
  if(state.step+1<questionKeys(state.answers).length){state.step++;question();}else analyze();
 };
}
function analyze() {
 state.answers=asked();state.result=calculate(state.answers);state.id=crypto.randomUUID();state.shared=false;
 mount(`<section class="loading screen"><div class="analysis-orb"><span>✦</span></div><p class="eyebrow">CONNECTING THE DOTS</p><h1>우리 회사의 다음 단계를<br>정리하고 있습니다.</h1><p id="loading-copy" role="status" aria-live="polite">규모와 현재 시스템을 살펴보고 있습니다</p><div class="analysis-bars"><i></i><i></i><i></i></div></section>`);
 setTimeout(()=>{const copy=document.querySelector('#loading-copy');if(copy)copy.textContent='함께 성장할 구성을 연결하고 있습니다';},650);
 setTimeout(()=>{state.result.type==='audit'?auditPage():resultPage();saveCompletion();},1600);
}
function productGuides(id) {
 const guides=window.ERP_CONFIG?.productGuides?.[id]||[];
 if(!guides.length)return id==='pms'?'<div class="product-guides"><a class="button secondary guide-link" href="https://www.duzon119.co.kr/product/pms.asp" target="_blank" rel="noopener noreferrer">PMS 공식 안내 보기 ↗<small>별도 PMS 소개서 미제공 · 새 탭</small></a></div>':'';
 return `<div class="product-guides">${guides.map(g=>`<div class="guide-item"><a class="button secondary guide-link" href="${esc(g.href)}#page=${g.page}" target="_blank" rel="noopener noreferrer" aria-label="${esc(products[id].name+' '+g.label+' (새 탭)')}"><span>${esc(g.label)} ↗</span><small>${esc(g.meta)} · 새 탭</small></a><a class="guide-download" href="${esc(g.href)}" download aria-label="${esc(products[id].name+' '+g.label.replace(' 보기',' 다운로드'))}">다운로드 ↓</a></div>`).join('')}<p class="guide-note">모바일에서 PDF가 열리지 않으면 다운로드해 확인해 주십시오.</p></div>`;
}
function productCard(id,index) {
 const p=products[id],icon=window.ERP_CONFIG?.productIcons?.[id];
 return `<article class="product-card ${p.color}" style="--delay:${index*80}ms"><div class="product-top"><span class="product-type">${index===0&&id!=='pms'?'주 추천 제품':'함께 제안'}</span><div class="product-icon">${icon?`<img src="${esc(icon)}" alt="${esc(p.name)} 제품 아이콘">`:`<span aria-label="프로젝트 관리">${p.mark}</span>`}</div></div><p class="product-tag">${p.tag}</p><h3>${p.name}</h3><span class="product-ko">${p.ko}</span><p class="product-description">${p.desc}</p><div class="tags">${p.features.map(t=>`<span>${t}</span>`).join('')}</div>${productGuides(id)}</article>`;
}
const keywordLabel = id => id.startsWith('project_') ? label('projectNeeds',id.slice(8)) : label('special',id);
function reasons(a=state.answers,r=state.result) {
 const who=honorific[a.role];
 const first=a.timeSink==='unknown'?`${who}께서 매일 하시는 업무의 흐름을 가볍게 만드는 데서 출발했습니다.`:`${who}께서 가장 시간을 많이 쓰신다고 답하신 ‘${label('timeSink',a.timeSink)}’ 업무를 줄이는 데서 출발했습니다.`;
 const raise=r.consultFirst||r.tier===r.tierBase?'':r.tier==='T3'&&r.raises.includes('T3')?' 외부감사·상장 기준에 맞춰 규모 등급을 높여 보았습니다.':' 회계팀이 직접 결산하는 운영 방식을 반영해 성장기(T2) 구성으로 보았습니다.';
 const scale=r.consultFirst?'확인이 필요한 답변이 있어 성장기(T2) 기본 구성으로 안내하고, 상담에서 실제 조건을 함께 정리하겠습니다.':`${tierLabels[r.tier]}(${r.tier}) 단계와 ${pathLabels[r.path]} 경로를 기준으로 주 추천을 정했습니다.${raise}`;
 const keywords=r.customKeywords.map(keywordLabel).filter((v,i,l)=>l.indexOf(v)===i);
 const trigger=a.trigger&&a.trigger!=='unknown'?` 검토 계기(${label('trigger',a.trigger)})도 함께 반영했습니다.`:'';
 const fit={
  first:`처음 ERP 체계를 갖추는 단계라, 부담 없이 바로 시작할 수 있는 구성을 우선했습니다.${trigger}`,
  growth:`내부에서 회계를 처리하며 성장하는 단계라, 업종에 맞는 모듈(${r.modules.core})과 함께 커질 수 있는 구성을 골랐습니다.${trigger}`,
  complete:`외부감사·상장 등 외부 기준에 대응할 수 있도록 내부회계와 그룹웨어까지 갖춘 구성을 골랐습니다.${trigger}`,
  cloud:'지금 쓰시는 더존 ERP의 데이터를 그대로 옮길 수 있어, 익숙한 업무 흐름을 유지하며 더 넓은 환경으로 옮겨 갈 수 있습니다.',
  switch:`다른 회사 ERP에서 옮기시는 경우라, 데이터 이전 지원과 함께 지금의 업무 흐름에 맞는 제품을 비교하도록 했습니다.${trigger}`,
  custom:r.path==='C'?`지금 쓰시는 ERP는 그대로 두고, ${{team:'한 부서(10명 미만)',multi:'여러 부서(10~50명)',company:'전사(50명 이상)',unknown:'필요한 범위'}[a.scope]}에 필요한 기능을 더하는 방향으로 구성했습니다.${{auto:' 현재 시스템과 데이터가 자동으로 이어지도록 SI 연동을 함께 설계합니다.',partial:' 꼭 필요한 데이터만 이어지도록 연동 범위를 정합니다.'}[a.integration]||''}${{many:' 표준 기능으로 어려웠던 업무는 맞춤 개발 범위로 함께 살펴봅니다.',few:' 표준 기능으로 어려웠던 업무 한두 가지는 설정과 맞춤 개발 중 알맞은 방법을 찾아 드립니다.'}[a.hardTasks]||''}`:`선택하신 ${keywords.slice(0,3).map(k=>`‘${k}’`).join(', ')} 업무는 표준 기능에 우리 회사의 방식을 더해야 하므로 맞춤 구성으로 안내합니다.`,
  full:'업무 전반을 새로 설계하길 원하셔서, 규모와 관계없이 OmniEsol(ERP10) 설계 상담으로 연결합니다.',
 }[r.type];
 return [{title:'지금 가장 시간이 드는 업무부터',text:first+(roleFocus[a.role]||'')},{title:'회사 규모와 현재 시스템에 맞춰',text:scale},{title:'함께 성장할 다음 단계로',text:fit}];
}
function ctaButtons(r) {
 const list=[['report','상세 리포트 받기'],['consult','무료 상담 신청'],['demo','데모 요청']];
 if(r.consultFirst)list.unshift(list.splice(1,1)[0]);
 return list.map(([type,text],i)=>`<button class="button ${i?'secondary':'primary'}" type="button" data-lead="${type}">${text}</button>`).join('');
}
function resultPage() {
 const r=state.result,a=state.answers;
 const [concernTitle,concernText]=concernCopy[a.concern];
 mount(`<section class="results screen">
 <div class="result-hero"><span class="pill"><i></i> ERP RECOMMENDATION REPORT</span><p class="result-company">${esc(honorific[a.role])}께 드리는 우리 회사 진단 결과</p><h1>${esc(r.typeLabel)}</h1><p class="result-message">${esc(r.message)}</p><div class="result-chips"><span>${tierLabels[r.tier]} · ${r.tier}</span><span>${pathLabels[r.path]}</span><span>${{cloud:'클라우드 선호',onprem:'구축형 선호',unknown:'구축 방식 상담'}[a.deploy]}</span></div></div>
 ${r.consultFirst?`<div class="panel consult-first"><div><span class="eyebrow">RECOMMENDED NEXT STEP</span><h2>함께 확인하면 더 정확한 결과를 드릴 수 있습니다.</h2><p>‘잘 모르겠습니다’로 답하신 문항이 있어 기본 구성으로 안내합니다. 무료 상담에서 실제 조건을 함께 정리해 드립니다.</p></div><div class="cta-row">${ctaButtons(r)}</div></div>`:''}
 <div class="report-grid"><div class="summary-panel panel"><span class="eyebrow">COMPANY SUMMARY</span><h2>우리 회사 요약</h2><ul class="summary-lines">${summarize(state.answers,state.result).map(line=>`<li>${esc(line)}</li>`).join('')}</ul></div>
 <div class="recommend-panel panel"><span class="eyebrow">RECOMMENDATION</span><h2>주 추천</h2><strong class="route-title">${esc(r.main.name)}</strong><dl class="recommend-meta">${r.companion?`<div><dt>함께 제안</dt><dd>${esc(r.companion)}</dd></div>`:''}${r.proposal?`<div><dt>제안 방식</dt><dd>${esc(r.proposal)}</dd></div>`:''}<div><dt>모듈 구성</dt><dd>${esc(r.moduleList.join(' + '))}</dd></div><div><dt>구축 방식</dt><dd>${deployCopy[a.deploy]}</dd></div></dl></div></div>
 <div class="reasons panel"><h2>이렇게 추천했습니다</h2>${reasons().map((reason,i)=>`<div class="reason"><span>0${i+1}</span><div><h3>${reason.title}</h3><p>${esc(reason.text)}</p></div></div>`).join('')}</div>
 <div class="extra-grid"><div class="panel extra-card"><span class="eyebrow">ALSO WORTH A LOOK</span><h2>함께 보면 좋은 기능</h2><strong>${esc(r.feature)}</strong><p>${esc(label('industry',a.industry)==='잘 모르겠습니다'?'기본':label('industry',a.industry))} 업종에서 함께 살펴보시면 좋은 기능입니다. 핵심 모듈은 ${esc(r.modules.core)}입니다.</p></div><div class="panel extra-card"><span class="eyebrow">WE'LL SUPPORT YOU</span><h2>${concernTitle}</h2><p>${concernText}</p></div></div>
 ${r.products.length?`<div class="section-title"><div><span class="eyebrow">PRODUCT GUIDE</span><h2>제품 자료</h2></div><span>도입·교체를 확정하는 결과가 아닙니다</span></div><div class="product-grid ${r.products.length===1?'single-product':''}">${r.products.map(productCard).join('')}</div>`:''}
 <div class="next-panel panel cta-panel"><div><span class="eyebrow">NEXT STEP</span><h2>다음 단계를 선택해 주십시오.</h2><p>상세 리포트에는 예상 구성과 도입 절차가 담겨 있습니다. 결과 요약은 입력 없이 지금처럼 바로 보실 수 있습니다.</p></div><div class="cta-row">${ctaButtons(r)}</div></div>
 <div class="scope-notice">아이원소프트뱅크가 취급하는 더존 제품 범위 내의 예비 제안입니다. 규모 등급 기준은 기획 초안이며, 구체적인 구성·비용·일정은 상담에서 확인합니다.</div>
 <div class="result-actions">${button('이미지로 저장','download','secondary')}${button('PDF로 저장','print','secondary')}${button('동료에게 공유','share')}${button('다시 하기','restart','text-button')}</div><p class="save-status" id="save-status" role="status">${state.shared?'공유받은 결과입니다. 회사명·연락처 등 개인 정보는 포함되지 않습니다.':''}</p><p class="product-source">첨부 소개서는 기능 이해를 위한 자료이며, 계약 시점의 제품·에디션·모듈·요금은 별도로 확인해 주십시오.<br>제품 소개 참고: <a href="https://www.duzon119.co.kr/" target="_blank" rel="noopener">아이원소프트뱅크 ↗</a></p>
 </section>`);
 decorate();
 document.querySelectorAll('[data-lead]').forEach(btn=>btn.onclick=()=>openLead(btn.dataset.lead));
 document.querySelector('#restart').onclick=restart;
 document.querySelector('#print').onclick=()=>window.print();
 document.querySelector('#download').onclick=download;
 document.querySelector('#share').onclick=share;
}
function auditPage() {
 const r=state.result;
 mount(`<section class="results screen"><div class="result-hero audit-hero"><span class="pill"><i></i> THANK YOU</span><p class="result-company">${esc(honorific[state.answers.role])}께 드리는 인사</p><h1>더존 ERP와 함께해 주셔서<br>감사합니다.</h1><p class="result-message">앞으로도 많은 활용 부탁드립니다.${r.transfer?' 도입하신 곳을 통해 필요한 안내를 받으실 수 있도록 함께 돕겠습니다.':''}</p><div class="cta-row center">${`<button class="button primary" type="button" data-lead="newsletter">새 기능·무료 교육 소식 받기</button>`}${button('다시 하기','restart','text-button')}</div><p class="save-status" id="save-status" role="status">소식 받기를 누르지 않으셔도 그대로 마치실 수 있습니다.</p></div></section>`);
 decorate();
 document.querySelector('[data-lead]').onclick=()=>openLead('newsletter');
 document.querySelector('#restart').onclick=restart;
}
function decorate() {
 const characters=document.createElement('div');characters.className='result-characters';
 characters.innerHTML=resultCharacters.map(character=>`<img class="result-character" src="${character.src}" alt="결과를 안내하는 ${character.name} 캐릭터" width="1254" height="1254">`).join('');
 document.querySelector('.result-hero .pill').insertAdjacentElement('afterend',characters);
 const confetti=document.createElement('canvas');confetti.className='confetti-canvas';confetti.setAttribute('aria-hidden','true');
 app.prepend(confetti);stopCelebration=celebrate(confetti);
}
function restart(){state.answers={};state.result=null;state.shared=false;state.leads=[];state.lead=null;history.replaceState(null,'',location.pathname);home();}

// 리드 수집: 결과 요약은 입력 없이 공개하고, 상세 리포트·상담·데모·소식 받기를 고를 때만 연락처를 받습니다.
const leadCopy = {
 report:{ title:'상세 리포트 받기', note:'예상 구성과 도입 절차를 담은 상세 리포트를 메일로 보내 드립니다.', submit:'리포트 신청하기', done:'신청이 접수되었습니다. 입력하신 메일로 상세 리포트를 보내 드리겠습니다.' },
 consult:{ title:'무료 상담 신청', note:'담당자가 영업일 기준 1일 안에 연락드립니다.', submit:'상담 신청하기', done:'상담 신청이 접수되었습니다. 담당자가 영업일 기준 1일 안에 연락드리겠습니다.' },
 demo:{ title:'데모 요청', note:'추천 제품을 실제 화면으로 보여 드릴 일정을 담당자가 메일로 조율해 드립니다.', submit:'데모 요청하기', done:'데모 요청이 접수되었습니다. 담당자가 일정 조율을 위해 메일로 연락드리겠습니다.' },
 newsletter:{ title:'새 기능·무료 교육 소식 받기', note:'더존 ERP의 새 기능과 무료 교육 일정을 메일로 안내해 드립니다.', submit:'소식 받기', done:'신청이 완료되었습니다. 새 소식이 있을 때 메일로 안내해 드리겠습니다.' },
};
const leadDialog=document.querySelector('#lead-dialog');
leadDialog.querySelector('.dialog-close').onclick=()=>leadDialog.close();
function openLead(type) {
 const c=leadCopy[type],phone=type==='consult',named=phone||type==='demo',news=type==='newsletter';
 leadDialog.querySelector('.lead-body').innerHTML=`<p class="eyebrow">NEXT STEP</p><h2>${c.title}</h2><p>${c.note}</p><form id="lead-form" class="lead-form" novalidate><label class="field"><span>회사명${news?' <small>(선택)</small>':''}</span><input name="company" autocomplete="organization" maxlength="100" ${news?'':'required'}></label><label class="field">이메일 주소<input name="email" type="email" autocomplete="email" maxlength="254" placeholder="name@company.com" required></label>${named?`<div class="field-row"><label class="field">담당자명<input name="manager" autocomplete="name" maxlength="60" required></label>${phone?'<label class="field">전화번호<input name="phone" type="tel" autocomplete="tel" maxlength="20" placeholder="010-0000-0000" required></label>':''}</div>`:''}${news?'':'<label class="field"><span>직책 <small>(선택)</small></span><input name="job_title" autocomplete="organization-title" maxlength="40" placeholder="예: 재무팀 과장"></label>'}<div class="consent-block"><div class="consent-line"><label><input name="privacy" type="checkbox" required> <span>개인정보 수집·이용에 동의합니다. <b>(필수)</b></span></label><button type="button" class="text-button" id="lead-privacy">내용 보기</button></div><div class="consent-line"><label><input name="marketing" type="checkbox" ${news?'required':''}> <span>마케팅 정보 수신에 동의합니다. <b>${news?'(필수)':'(선택)'}</b></span></label></div></div><p class="error" id="lead-error" role="alert"></p><div class="button-row">${'<button class="button primary" type="submit">'+c.submit+'</button>'}<button class="text-button" type="button" id="lead-cancel">닫기</button></div></form>`;
 const form=leadDialog.querySelector('#lead-form');
 leadDialog.querySelector('#lead-privacy').onclick=()=>document.querySelector('#privacy-dialog').showModal();
 leadDialog.querySelector('#lead-cancel').onclick=()=>leadDialog.close();
 form.onsubmit=e=>{e.preventDefault();submitLead(type,form).catch(()=>{form.querySelector('#lead-error').textContent='신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주십시오.';form.querySelector('[type=submit]').disabled=false;});};
 leadDialog.showModal();
 form.querySelector('input').focus();
}
async function submitLead(type,form) {
 const error=form.querySelector('#lead-error');error.textContent='';
 for(const input of form.querySelectorAll('input:not([type=checkbox])'))input.value=input.value.trim();
 if(form.elements.phone&&!/^[0-9+\-\s()]{9,20}$/.test(form.elements.phone.value))form.elements.phone.setCustomValidity('전화번호를 숫자와 - 로 입력해 주십시오.');else form.elements.phone?.setCustomValidity('');
 if(!form.reportValidity())return;
 const data=new FormData(form),get=key=>String(data.get(key)||'');
 const now={type,company:get('company')||null,email:get('email'),job_title:get('job_title')||null,manager:get('manager')||null,phone:get('phone')||null,privacy_agreed:true,marketing_agreed:data.get('marketing')==='on',consented_at:new Date().toISOString()};
 // 같은 결과에서 여러 번 신청하면 한 행에 합칩니다: 더 적극적인 신청 유형을 남기고, 앞서 받은 이름·전화번호·동의는 지우지 않습니다.
 const prev=state.lead,rank={newsletter:0,report:1,demo:2,consult:3};
 const lead=prev?{...now,type:rank[prev.type]>rank[type]?prev.type:type,company:now.company||prev.company,job_title:now.job_title||prev.job_title,manager:now.manager||prev.manager,phone:now.phone||prev.phone,marketing_agreed:now.marketing_agreed||prev.marketing_agreed}:now;
 lead.requests=[...new Set([...(prev?.requests||[]),type])];
 if(lead.type!=='consult')lead.phone=null;if(!['consult','demo'].includes(lead.type))lead.manager=null;
 const cfg=window.ERP_CONFIG||{};
 form.querySelector('[type=submit]').disabled=true;
 if(cfg.endpoint){const response=await fetch(cfg.endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({id:state.id,answers:state.answers,lead})});if(!response.ok)throw Error();}
 state.leads.push(type);state.lead=lead;
 leadDialog.querySelector('.lead-body').innerHTML=`<p class="eyebrow">THANK YOU</p><h2>${leadCopy[type].title}</h2><p class="lead-done">${leadCopy[type].done}</p><div class="button-row"><button class="button primary" type="button" id="lead-close">확인</button></div>`;
 leadDialog.querySelector('#lead-close').onclick=()=>leadDialog.close();
 document.querySelectorAll(`[data-lead="${type}"]`).forEach(btn=>{btn.disabled=true;btn.textContent+=' · 접수 완료';});
}
// 응답 전체·결과 유형·규모 등급·진입 경로는 연락처 없이 자동 저장합니다(공유 링크로 연 결과는 저장하지 않습니다).
async function saveCompletion() {
 const cfg=window.ERP_CONFIG||{};
 if(state.shared||!cfg.endpoint)return;
 try{await fetch(cfg.endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({id:state.id,answers:state.answers})});}catch{/* 결과 화면은 저장 여부와 관계없이 보여 드립니다. */}
}
async function share() {
 const url=new URL(location.pathname,location.origin);url.searchParams.set('r',btoa(encodeURIComponent(JSON.stringify(state.answers))));
 const status=document.querySelector('#save-status');
 try{if(navigator.share)await navigator.share({title:'ERP 추천 테스트 결과',url:url.href});else{await navigator.clipboard.writeText(url.href);status.textContent='개인 정보가 제외된 결과 링크를 복사했습니다.';}}catch(error){if(error.name!=='AbortError')status.textContent='링크 복사 권한을 확인해 주십시오.';}
}
async function download() {
 savePng(await drawResultCard({answers:state.answers,result:state.result,summary:summarize(state.answers,state.result)}),'ERP-추천-테스트-결과.png');
}
const sharedParam=new URLSearchParams(location.search).get('r');
if(sharedParam){try{if(sharedParam.length>3000)throw Error();const answers=JSON.parse(decodeURIComponent(atob(sharedParam)));if(!validateAnswers(answers))throw Error();state.answers=normalizeAnswers(answers);state.result=calculate(state.answers);state.shared=true;state.id=crypto.randomUUID();state.result.type==='audit'?auditPage():resultPage();}catch{home();const note=document.createElement('p');note.className='link-error';note.textContent='결과 링크가 올바르지 않습니다. 새로운 진단을 시작해 주십시오.';app.prepend(note);}}else home();
