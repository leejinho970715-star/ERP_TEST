import { options, label, calculate, validateAnswers } from './supabase/functions/_shared/erp-rules.js';
import { randomMascot, celebrate } from './erp-effects.js';

const app = document.querySelector('#app');
let stopCelebration = () => {};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { step: -1, contact: { company: '', manager: '', email: '' }, answers: { needs: [] }, consent: false, id: '', result: null, saved: false };
const titles = ['우리 회사의 업무는\n어떻게 관리하고 있나요?', '우리 회사는\n어떤 업종에 속하나요?', '현재 사용 중인\nERP를 알려주세요.', '우리 회사의\n규모는 어느 정도인가요?', 'ERP로 가장 먼저\n해결하고 싶은 일은 무엇인가요?'];
const hints = ['지금의 업무 방식이 더 나은 시작점을 알려줘요.', '같은 매출이어도 업종에 따라 필요한 ERP는 달라요.', '현재 환경을 고려해 도입 또는 확장 방향을 찾아드려요.', '최근 연 매출과 현재 임직원 수를 기준으로 선택해 주세요.', '필요한 기능을 모두 고르고, 맞춤 개발 여부도 알려주세요.'];
const products = {
 wehago: { name: 'WEHAGO', ko: '위하고', tag: '가볍게 시작하는 경영 관리', desc: '회계·인사부터 협업까지. 기본 업무를 한곳에 모으고, 필요한 서비스부터 차근차근 시작해 보세요.', features: ['회계·인사 관리','클라우드 업무 환경','협업 서비스'], color:'sky', mark:'W' },
 amaranth: { name:'Amaranth 10', ko:'아마란스 10', tag:'연결할수록 커지는 업무의 가능성', desc:'ERP·그룹웨어·문서관리를 하나로 연결합니다. 부서 사이의 정보 흐름을 정리하고 전사 업무를 통합해 보세요.', features:['ERP·그룹웨어 통합','문서·결재 연결','전사 데이터 관리'], color:'violet',mark:'a' },
 omni: { name:'OmniEsol', ko:'옴니이솔', tag:'우리 회사의 방식에 맞춘 확장', desc:'복잡한 업무 프로세스와 시스템 연계 수요를 함께 검토할 수 있는 후보입니다. Amaranth 10과 구축 범위·연계 방식을 비교해 보세요.',features:['프로세스 통합','시스템 연계 검토','확장형 경영 관리'],color:'cyan',mark:'O' },
 oneai: { name:'ONE AI',ko:'원 AI',tag:'Amaranth 10과 함께 검토하는 AI',desc:'Amaranth 10에 생성형 AI 활용을 더하는 방향을 함께 제안합니다. 실제 제공 기능과 적용 범위는 상담에서 확인해 주세요.',features:['AI 업무 지원','문서 활용','Amaranth 10 연계 검토'],color:'pink',mark:'AI' },
 pms: { name:'PMS',ko:'프로젝트 관리 솔루션',tag:'이미 갖춘 ERP에 프로젝트의 깊이를',desc:'기존 더존 ERP를 바탕으로 프로젝트 일정·투입 인력·손익 관리의 확장을 제안합니다. 구체적인 PMS 제품과 ERP 연계 가능 여부는 상담에서 확인합니다.',features:['프로젝트별 손익','인력·일정 관리','기존 ERP 연계 검토'],color:'blue',mark:'P' },
};
function mount(html, focus = true) {
 stopCelebration();
 app.innerHTML = html;
 if (focus) { app.focus({ preventScroll: true }); window.scrollTo({top:0,behavior:'instant'}); }
}
function button(text, id, style='primary') { return `<button class="button ${style}" id="${id}" type="button">${text}</button>`; }
function home() {
 state.step=-1;
 mount(`<section class="hero screen"><div class="hero-copy"><span class="pill"><i></i> 우리 회사의 다음 성장을 위한 첫걸음</span><p class="eyebrow">FIND YOUR NEXT ERP</p><h1>우리 회사에 딱 맞는<br><span>ERP, 함께 찾아볼까요?</span></h1><p class="hero-description">업무 방식부터 우리 회사만의 고민까지.<br>5가지 질문으로 만나는 <strong>ERP 가상 컨설팅 진단</strong></p><div class="hero-actions">${button('우리 회사 ERP 진단하기 <span aria-hidden="true">↗</span>','start')}<span class="time-note">약 2분 · 5가지 질문</span></div><div class="hero-points"><span>01 <b>우리 회사 이해하기</b></span><span>02 <b>업무 니즈 분석하기</b></span><span>03 <b>맞춤 ERP 만나기</b></span></div></div><div class="hero-art"><div class="art-orbit"></div><img class="dashboard" src="assets/erp-dashboard.png" alt="회계, 프로젝트, 재고를 연결하는 3D ERP 대시보드" fetchpriority="high"><span class="float-card float-top"><i class="mini-dot"></i> 흩어진 업무를 하나로</span><span class="float-card float-bottom"><span class="spark">✦</span> 성장에 맞는 솔루션</span></div><div class="hero-bottom"><span class="scroll-line"></span> 복잡한 ERP 선택, 이제 쉽게 시작하세요.</div></section>`,false);
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
 return `<div class="choices ${compact?'compact':''} ${key==='industry'?'industry-grid':''}" role="group" aria-label="${esc({level:'더존 ERP 활용 레벨',category:'희망 ERP 카테고리',revenue:'연 매출',staff:'임직원 수',custom:'맞춤 개발 여부',needs:'필요한 기능'}[key]||titles[state.step-1])}">${options[key].map(([id,title,note],i)=>{const selected=multi?value?.includes(id):value===id;return `<button type="button" class="choice ${selected?'selected':''}" data-key="${key}" data-value="${id}" aria-pressed="${!!selected}"><span class="choice-number">${multi?(selected?'✓':'+'):String(i+1).padStart(2,'0')}</span><span><b>${title}</b>${note?`<small>${note}</small>`:''}</span><span class="choice-check" aria-hidden="true">${selected?'✓':'○'}</span></button>`;}).join('')}</div>`;
}
function complete(step) {
 const a=state.answers;
 return step===1?!!a.management:step===2?!!a.industry:step===3?!!a.erp&&(a.erp==='douzone'?!!a.level:!!a.category):step===4?!!a.revenue&&!!a.staff:!!a.needs?.length&&!!a.custom;
}
function question(focus=true) {
 const n=state.step;
 let content=n===1?choiceGroup('management'):n===2?choiceGroup('industry'):n===3?`${choiceGroup('erp')}${state.answers.erp?`<div class="subquestion"><h2>${state.answers.erp==='douzone'?'더존 ERP를 얼마나 활용하고 있나요?':'어떤 ERP 영역을 주로 사용하고 싶으신가요?'}</h2>${choiceGroup(state.answers.erp==='douzone'?'level':'category',false,true)}</div>`:''}`:n===4?`<div class="subquestion first"><h2>연 매출 규모</h2>${choiceGroup('revenue',false,true)}</div><div class="subquestion"><h2>임직원 수</h2>${choiceGroup('staff',false,true)}</div>`:`${choiceGroup('needs',true)}<div class="subquestion"><h2>우리 회사에 맞춘 별도 개발이 필요한가요?</h2>${choiceGroup('custom',false,true)}</div>`;
 mount(`<section class="flow question-flow screen"><div class="progress-meta"><span>우리 회사 알아보기</span><b><span class="current-step">0${n}</span> / 05</b></div><div class="progress" role="progressbar" aria-label="진단 진행률" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="5"><i style="width:${n*20}%"></i></div><div class="question-heading"><span class="eyebrow">QUESTION 0${n}</span><h1>${titles[n-1].replace('\n','<br>')}</h1><p>${hints[n-1]}</p>${n===5?'<span class="selection-note">복수 선택 가능</span>':''}</div><div class="panel question-panel">${content}<p id="question-error" class="error" role="alert"></p><div class="flow-actions">${button('← 이전','back','secondary')}<span class="step-caption">${n===5?'마지막 질문이에요':`${5-n}개 질문이 남았어요`}</span>${button(n===5?'맞춤 결과 확인하기 ↗':'다음 질문 →','next')}</div></div></section>`,focus);
 document.querySelectorAll('[data-key]').forEach(el=>el.onclick=()=>{
  const {key,value}=el.dataset;
  if(key==='needs'){const list=state.answers.needs;state.answers.needs=list.includes(value)?list.filter(x=>x!==value):[...list,value];}
  else {state.answers[key]=value;if(key==='erp'){delete state.answers.level;delete state.answers.category;}}
  const scroll=window.scrollY;question(false);window.scrollTo({top:scroll,behavior:'instant'});document.querySelector(`[data-key="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});
 });
 document.querySelector('#back').onclick=()=>{state.step--;state.step===0?contactPage():question();};
 document.querySelector('#next').onclick=()=>{if(!complete(n)){const error=document.querySelector('#question-error');error.textContent='선택하지 않은 항목을 확인해 주세요.';return;}if(n<5){state.step++;question();}else analyze();};
}
function analyze() {
 state.mascot=null;
 state.result=calculate(state.answers);state.id=crypto.randomUUID();state.saved=false;
 mount(`<section class="loading screen"><div class="analysis-orb"><span>✦</span></div><p class="eyebrow">CONNECTING THE DOTS</p><h1>우리 회사의 다음 ERP를<br>찾고 있어요.</h1><p id="loading-copy" role="status" aria-live="polite">업종과 업무 방식을 살펴보고 있어요</p><div class="analysis-bars"><i></i><i></i><i></i></div></section>`);
 setTimeout(()=>{const copy=document.querySelector('#loading-copy');if(copy)copy.textContent='성장 규모와 필요한 기능을 연결하고 있어요';},650);
 setTimeout(()=>{resultPage();saveResponse();},1600);
}
function productCard(id,index) {
 const p=products[id],icon=window.ERP_CONFIG?.productIcons?.[id];
 return `<article class="product-card ${p.color}" style="--delay:${index*80}ms"><div class="product-top"><span class="product-type">${id==='oneai'?'함께 추천하는 AI':id==='pms'?'ERP 확장 제안':'추천 솔루션'}</span><div class="product-icon">${icon?`<img src="${esc(icon)}" alt="${esc(p.name)} 제품 아이콘">`:`<span aria-label="프로젝트 관리">${p.mark}</span>`}</div></div><p class="product-tag">${p.tag}</p><h3>${p.name}</h3><span class="product-ko">${p.ko}</span><p class="product-description">${p.desc}</p><div class="tags">${p.features.map(t=>`<span>${t}</span>`).join('')}</div></article>`;
}
function reasons() {
 const a=state.answers;
 return [
  {title:'업종의 특성을 반영했어요',text:['ai','robotics','research'].includes(a.industry)?`${label('industry',a.industry)} 분야는 매출 규모보다 연구·개발, 인력, 프로젝트 관리 수요에 더 높은 비중을 두었어요.`:`${label('industry',a.industry)}의 업무 특성을 바탕으로 운영과 관리의 연결 수준을 살펴봤어요.`},
  {title:'현재 환경에서 다음 단계를 찾았어요',text:a.erp==='douzone'?'더존 ERP를 사용 중이므로 기존 시스템을 활용하면서 프로젝트 관리를 확장하는 PMS를 제안해요.':`선택하신 업무 방식과 연 매출 ${label('revenue',a.revenue)} 규모를 함께 고려했어요.`},
  {title:'우리 회사가 원하는 업무를 중심으로',text:a.custom==='custom'?'맞춤 개발·외부 시스템 연계가 필요해 Amaranth 10과 OmniEsol을 함께 비교하도록 제안했어요.':`${a.needs.map(id=>label('needs',id)).join(', ')}에 대한 수요를 반영했어요.`},
 ];
}
function resultPage() {
 state.mascot ||= randomMascot();
 const r=state.result,a=state.answers;
 const custom=a.custom==='custom',pms=!custom&&a.erp==='douzone';
 const heading=custom?'우리 회사의 방식에 맞춘\n유연한 확장이 필요해요.':pms?'익숙한 ERP에,\n프로젝트의 깊이를 더하세요.':r.score>=50?'흩어진 업무를 연결해,\n성장의 속도를 높여보세요.':'가볍게 시작하고,\n성장에 맞춰 넓혀가세요.';
 const company=state.contact.company||'우리 회사';
 mount(`<section class="results screen"><div class="result-hero"><span class="pill"><i></i> ERP CONSULTING REPORT</span><p class="result-company">${esc(company)}를 위한 맞춤 제안</p><h1>${heading.replace('\n','<br>')}</h1><p>업종과 업무 환경, 필요한 기능을 연결한 진단 결과입니다.</p><div class="result-chips"><span>${label('industry',a.industry)}</span><span>연 매출 ${label('revenue',a.revenue)}</span><span>${a.custom==='custom'?'맞춤 확장 필요':'표준 기능 중심'}</span></div>${r.thanks?'<div class="thanks">✦ 더존 ERP를 사용해주셔서 감사합니다.<br><span>앞으로도 많은 애용 부탁드립니다.</span></div>':''}</div><div class="report-grid"><div class="score-panel panel"><span class="eyebrow">ERP SOLUTION INDEX</span><h2>통합·확장 수요 지수</h2><div class="score-number"><strong>${r.score}</strong><span>/ 100</span></div><div class="score-track"><i style="width:${r.score}%"></i></div><p>점수가 높을수록 업무 통합과 확장에 대한 수요가 커요.</p><small>기업의 우열이나 실제 구매 확률을 의미하지 않습니다.</small></div><div class="reasons panel"><h2>이렇게 분석했어요</h2>${reasons().map((reason,i)=>`<div class="reason"><span>0${i+1}</span><div><h3>${reason.title}</h3><p>${esc(reason.text)}</p></div></div>`).join('')}</div></div><div class="section-title"><div><span class="eyebrow">YOUR NEXT SOLUTION</span><h2>우리 회사에 추천하는 솔루션</h2></div><span>${r.products.includes('oneai')?'Amaranth 10과 ONE AI를 함께 제안해요':'현재 업무에 맞는 다음 선택'}</span></div><div class="product-grid ${r.products.length===1?'single-product':''}">${r.products.map(productCard).join('')}</div><div class="next-panel panel"><div><span class="eyebrow">WHAT’S NEXT?</span><h2>이제, 우리 회사의 업무에<br>직접 대입해 보세요.</h2></div><ol><li><b>업무 정리</b><span>개선하고 싶은 업무와 현재 사용 도구를 정리해요.</span></li><li><b>적용 범위 확인</b><span>필요 모듈·데이터 이전·연계 범위를 상담에서 확인해요.</span></li><li><b>단계별 도입</b><span>우선순위에 따라 작은 범위부터 시작해요.</span></li></ol></div><details class="rules panel"><summary>추천 기준과 내 답변 자세히 보기</summary><p>기획에 따른 가중치 기반 추천입니다. 업무 방식 15점, 업종 25점, ERP 활용 10점, 규모 25점, 기능 수요 25점으로 산정합니다. 일반 추천 기준은 50점이며 맞춤 개발과 기존 더존 사용 여부를 우선 반영합니다.</p><dl>${Object.entries(r.breakdown).map(([key,n])=>`<div><dt>${{management:'업무 방식',industry:'업종 특성',erp:'ERP 활용',scale:'기업 규모',needs:'필요 기능'}[key]}</dt><dd>${n}점</dd></div>`).join('')}<div><dt>사용 ERP</dt><dd>${label('erp',a.erp)}</dd></div><div><dt>${a.erp==='douzone'?'활용 수준':'관심 영역'}</dt><dd>${label(a.erp==='douzone'?'level':'category',a.erp==='douzone'?a.level:a.category)}</dd></div></dl><p class="muted">최종 도입 제품·구축 비용·기능 지원 여부는 상세 상담을 통해 확인해 주세요.</p></details><div class="result-actions">${button('이미지로 저장','download','secondary')}${button('PDF로 저장','print','secondary')}${button('결과 링크 공유','share')}${button('다시 진단하기','restart','text-button')}</div><p class="save-status" id="save-status" role="status">${state.shared?'공유된 진단 결과입니다. 회사명·담당자·이메일은 포함되지 않습니다.':state.saved?'진단 응답이 안전하게 저장되었습니다.':'진단 결과는 현재 화면에서 확인할 수 있습니다.'}</p><p class="product-source">제품 소개 참고: <a href="https://www.douzone.com/solution/business.jsp" target="_blank" rel="noopener">더존 공식 제품 안내 ↗</a></p></section>`);
 const mascot=document.createElement('img');
 mascot.className='result-mascot';mascot.src=state.mascot.src;mascot.alt=`진단 완료를 축하하는 ${state.mascot.name} 캐릭터`;
 document.querySelector('.result-hero .pill').insertAdjacentElement('afterend',mascot);
 const confetti=document.createElement('canvas');confetti.className='confetti-canvas';confetti.setAttribute('aria-hidden','true');
 app.prepend(confetti);stopCelebration=celebrate(confetti);
 document.querySelector('#restart').onclick=()=>{state.answers={needs:[]};state.contact={company:'',manager:'',email:''};state.consent=false;state.result=null;state.mascot=null;state.shared=false;state.saved=false;history.replaceState(null,'',location.pathname);home();};
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
 ctx.fillStyle='#386ce5';ctx.font='800 100px Pretendard, sans-serif';ctx.fillText(String(state.result.score),110,395);ctx.font='500 26px Pretendard, sans-serif';ctx.fillText('/ 100  통합·확장 수요 지수',290,390);
 if(state.mascot){const dog=new Image();dog.src=state.mascot.src;try{await dog.decode();const scale=Math.min(155/dog.naturalWidth,195/dog.naturalHeight);ctx.drawImage(dog,940,260,dog.naturalWidth*scale,dog.naturalHeight*scale);}catch{/* 이미지가 없더라도 진단 결과는 저장합니다. */}}
 let y=485;for(const id of state.result.products){const p=products[id];ctx.fillStyle='#14294b';ctx.font='700 30px Pretendard, sans-serif';ctx.fillText(p.name,110,y);ctx.fillStyle='#61718d';ctx.font='400 21px Pretendard, sans-serif';ctx.fillText(p.tag,430,y);y+=78;}
 ctx.fillStyle='#61718d';ctx.font='400 20px Pretendard, sans-serif';ctx.fillText('업종·업무 환경·성장 규모·필요 기능을 반영한 가중치 기반 추천입니다.',110,920);ctx.fillText('구체적인 제품 기능과 도입 범위는 상세 상담에서 확인해 주세요.',110,955);ctx.fillStyle='#14294b';ctx.font='700 22px Pretendard, sans-serif';ctx.fillText('아이원소프트뱅크',110,1005);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ERP-컨설팅-진단결과.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
const shared=new URLSearchParams(location.search).get('r');
if(shared){try{if(shared.length>3000)throw Error();const answers=JSON.parse(decodeURIComponent(atob(shared)));if(!validateAnswers(answers))throw Error();state.answers=answers;state.result=calculate(answers);state.shared=true;resultPage();}catch{home();const note=document.createElement('p');note.className='link-error';note.textContent='결과 링크가 올바르지 않습니다. 새로운 진단을 시작해 주세요.';app.prepend(note);}}else home();
