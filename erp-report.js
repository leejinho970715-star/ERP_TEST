import { label, tierLabels, pathLabels, legacyOptions } from './supabase/functions/_shared/erp-rules.js';
import { resultCharacters } from './erp-effects.js';
import { products } from './erp-products.js';

// 이전 규칙(v1·v2) 응답의 결과 이미지입니다. 관리자 화면에서 예전 응답을 볼 때만 씁니다.
export async function drawReport({ answers, routeLabel, productIds, contact }) {
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1100;const ctx=canvas.getContext('2d');
 const grad=ctx.createLinearGradient(0,0,1200,1100);grad.addColorStop(0,'#eff8ff');grad.addColorStop(1,'#e9eaff');ctx.fillStyle=grad;ctx.fillRect(0,0,1200,1100);
 ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(60,60,1080,980,32);ctx.fill();
 ctx.fillStyle='#4478e8';ctx.font='600 20px Pretendard, sans-serif';ctx.fillText('ERP VIRTUAL CONSULTING REPORT',110,125);
 ctx.fillStyle='#14294b';ctx.font='700 42px Pretendard, sans-serif';ctx.fillText('우리 회사에 맞는 ERP 가상 컨설팅 진단',110,200);
 ctx.font='500 24px Pretendard, sans-serif';ctx.fillStyle='#61718d';ctx.fillText((legacyOptions.industry[answers.industry]||'업종 미상')+' · 연 매출 '+(legacyOptions.revenue[answers.revenue]||'미상'),110,250);
 if(contact){ctx.font='500 20px Pretendard, sans-serif';ctx.fillStyle='#4478e8';ctx.fillText(contact,110,292,780);}
 ctx.fillStyle='#386ce5';ctx.font='700 40px Pretendard, sans-serif';ctx.fillText(routeLabel,110,350);ctx.font='400 22px Pretendard, sans-serif';ctx.fillText('업무 수요를 바탕으로 한 예비 검토 · 기업 등급 아님',110,400);
 for(const [index,character] of resultCharacters.entries()){
  const portrait=new Image();portrait.src=character.src;
  try{await portrait.decode();const scale=Math.min(85/portrait.naturalWidth,155/portrait.naturalHeight);const width=portrait.naturalWidth*scale,height=portrait.naturalHeight*scale;ctx.drawImage(portrait,920+index*85+(85-width)/2,275+(155-height)/2,width,height);}catch{/* 캐릭터 로딩 실패 시에도 결과를 저장합니다. */}
 }

 let y=485;if(!productIds.length){ctx.fillStyle='#61718d';ctx.font='500 26px Pretendard, sans-serif';ctx.fillText('기존 기능 점검 또는 요구사항 추가 확인을 먼저 권합니다.',110,y);}for(const id of productIds){const p=products[id];if(!p)continue;ctx.fillStyle='#14294b';ctx.font='700 30px Pretendard, sans-serif';ctx.fillText(p.name,110,y);ctx.fillStyle='#61718d';ctx.font='400 21px Pretendard, sans-serif';ctx.fillText(p.tag,430,y);y+=78;}
 ctx.fillStyle='#61718d';ctx.font='400 20px Pretendard, sans-serif';ctx.fillText('더존 제품 범위 내 예비 제안이며, 업종·매출에 가산점을 주지 않습니다.',110,920);ctx.fillText('구체적인 제품 기능과 도입 범위는 상세 상담에서 확인해 주세요.',110,955);ctx.fillStyle='#14294b';ctx.font='700 22px Pretendard, sans-serif';ctx.fillText('아이원소프트뱅크',110,1005);
 return canvas;
}

// 받침 여부에 맞춰 을/를 등을 고릅니다(영문은 읽는 소리 기준의 근사치).
function josa(word, withFinal, without) {
 const c = word.trim().slice(-1), code = c.charCodeAt(0);
 const final = code >= 0xAC00 && code <= 0xD7A3 ? (code - 0xAC00) % 28 > 0 : /[013678]|[LMN]$/i.test(c);
 return word + (final ? withFinal : without);
}

// 결과 페이지·이미지 카드의 “우리 회사 요약” 3줄(업종·규모·현재 시스템)
export function summaryLines(a,r) {
 const audit={external:', 외부감사 대상',listing:', 상장(예정) 기업'}[a.audit]||'';
 const system={excel:'현재 회계·경영 관리는 엑셀·수기로 하고 계십니다.',taxagent:'현재 회계·경영 관리는 세무사무소 기장으로 하고 계십니다.',douzone_switch:'더존 ERP를 쓰고 계시며, 교체를 검토하고 계십니다.',other_switch:'다른 회사 ERP를 쓰고 계시며, 교체를 검토하고 계십니다.',douzone_extend:`${josa(a.currentErp&&a.currentErp!=='unknown'?label('currentErp',a.currentErp):'더존 ERP','을','를')} 그대로 쓰면서 기능을 더하려고 하십니다.`,unknown:'현재 관리 방식은 상담에서 함께 확인하겠습니다.'}[a.system];
 return [a.industry==='unknown'?'업종은 상담에서 함께 확인하겠습니다.':`${label('industry',a.industry)} 업종의 회사입니다.`, r.consultFirst?`확인이 필요한 답변이 있어 ${tierLabels.T2}(T2) 기본값으로 안내합니다.`:`연 매출 ${label('revenue',a.revenue)}${audit} 기준으로 ${tierLabels[r.tier]}(${r.tier}) 단계입니다.`, system];
}
export function savePng(canvas, filename) {
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}

// 글자 단위로 줄을 나눠 그리고 다음 줄의 y를 돌려줍니다. draw=false면 높이만 잽니다.
function wrap(ctx, text, x, y, maxWidth, lineHeight, draw=true) {
 let line='';
 for (const ch of text) { if (ctx.measureText(line+ch).width > maxWidth && line) { if(draw)ctx.fillText(line.trimEnd(),x,y); y+=lineHeight; line=ch.trimStart(); } else line+=ch; }
 if (line) { if(draw)ctx.fillText(line,x,y); y+=lineHeight; }
 return y;
}
async function drawCharacters(ctx, x, y, w, h) {
 for (const [index,character] of resultCharacters.entries()) {
  const portrait=new Image();portrait.src=character.src;
  try{await portrait.decode();const scale=Math.min(w/portrait.naturalWidth,h/portrait.naturalHeight);const width=portrait.naturalWidth*scale,height=portrait.naturalHeight*scale;ctx.drawImage(portrait,x+index*w+(w-width)/2,y+(h-height)/2,width,height);}catch{/* 캐릭터 로딩 실패 시에도 결과를 저장합니다. */}
 }
}
// v3 공유용 이미지 카드: 유형 이름·한 줄 메시지·회사 요약·주 추천·함께 제안·함께 보면 좋은 기능.
// contact를 넘기면(관리자 화면) 회사·담당자·연락처 줄을 추가합니다.
export async function drawResultCard({ answers, result, summary, contact }) {
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1200;const ctx=canvas.getContext('2d');
 const grad=ctx.createLinearGradient(0,0,1200,1200);grad.addColorStop(0,'#eff8ff');grad.addColorStop(1,'#e9eaff');ctx.fillStyle=grad;ctx.fillRect(0,0,1200,1200);
 ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(60,60,1080,1080,32);ctx.fill();
 ctx.fillStyle='#4478e8';ctx.font='600 20px Pretendard, sans-serif';ctx.fillText(result.type==='audit'?'THANK YOU':'ERP RECOMMENDATION REPORT',110,125);
 await drawCharacters(ctx,930,90,90,160);
 let y=205;
 ctx.fillStyle='#2f63d8';ctx.font='800 54px Pretendard, sans-serif';ctx.fillText(result.typeLabel,110,y);y+=58;
 ctx.fillStyle='#14294b';ctx.font='500 26px Pretendard, sans-serif';y=wrap(ctx,result.message,110,y,780,38);
 if (result.type!=='audit') { ctx.fillStyle='#61718d';ctx.font='500 20px Pretendard, sans-serif';ctx.fillText(`${tierLabels[result.tier]} · ${result.tier}   |   ${pathLabels[result.path]}`,110,y+8);y+=40; }
 if (contact) { ctx.fillStyle='#4478e8';ctx.font='500 19px Pretendard, sans-serif';y=wrap(ctx,contact,110,y+6,980,28); }
 ctx.strokeStyle='#e6edf7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(110,y+14);ctx.lineTo(1090,y+14);ctx.stroke();y+=62;
 if (result.type==='audit') {
  ctx.fillStyle='#61718d';ctx.font='400 22px Pretendard, sans-serif';y=wrap(ctx,result.transfer?'도입하신 곳을 통해 필요한 안내를 받으실 수 있도록 함께 돕겠습니다.':'새 기능과 무료 교육 소식으로 계속 함께하겠습니다.',110,y,980,34);
 } else {
  ctx.fillStyle='#14294b';ctx.font='700 22px Pretendard, sans-serif';ctx.fillText('우리 회사 요약',110,y);y+=40;
  ctx.fillStyle='#4d6385';ctx.font='400 21px Pretendard, sans-serif';for(const line of summary)y=wrap(ctx,'·  '+line,110,y,980,32)+4;
  y+=26;const top=y-12;
  const rows=[['함께 제안',result.companion],['모듈 구성',(result.moduleList||[]).join(' + ')],['함께 보면 좋은 기능',result.feature]].filter(row=>row[1]);
  const box=draw=>{
   if(draw){ctx.fillStyle='#8a9bb3';ctx.font='600 19px Pretendard, sans-serif';ctx.fillText('주 추천',130,y+30);}
   ctx.fillStyle='#2f63d8';ctx.font='800 32px Pretendard, sans-serif';let by=wrap(ctx,result.main.name,130,y+76,920,44,draw);
   for (const [k,v] of rows) { ctx.fillStyle='#8a9bb3';ctx.font='600 19px Pretendard, sans-serif';if(draw)ctx.fillText(k,130,by+14);ctx.fillStyle='#14294b';ctx.font='600 22px Pretendard, sans-serif';by=wrap(ctx,v,330,by+14,740,32,draw)+8; }
   return by;
  };
  const bottom=box(false);ctx.fillStyle='#f3f8ff';ctx.beginPath();ctx.roundRect(100,top,1000,bottom-top+10,20);ctx.fill();box(true);
 }
 ctx.fillStyle='#61718d';ctx.font='400 19px Pretendard, sans-serif';ctx.fillText('더존 제품 범위 내 예비 제안입니다. 구체적인 구성·비용·일정은 상담에서 확인합니다.',110,1040);ctx.fillStyle='#14294b';ctx.font='700 22px Pretendard, sans-serif';ctx.fillText('아이원소프트뱅크',110,1090);
 return canvas;
}
