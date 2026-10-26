import { label } from './supabase/functions/_shared/erp-rules.js';
import { resultCharacters } from './erp-effects.js';
import { products } from './erp-products.js';

// 응답자가 받는 결과 이미지와 관리자 화면의 결과 이미지를 같은 모양으로 그립니다.
// contact를 넘기면(관리자 화면) 회사·담당자·진단일 줄을 추가합니다.
export async function drawReport({ answers, routeLabel, productIds, contact }) {
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1100;const ctx=canvas.getContext('2d');
 const grad=ctx.createLinearGradient(0,0,1200,1100);grad.addColorStop(0,'#eff8ff');grad.addColorStop(1,'#e9eaff');ctx.fillStyle=grad;ctx.fillRect(0,0,1200,1100);
 ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(60,60,1080,980,32);ctx.fill();
 ctx.fillStyle='#4478e8';ctx.font='600 20px Pretendard, sans-serif';ctx.fillText('ERP VIRTUAL CONSULTING REPORT',110,125);
 ctx.fillStyle='#14294b';ctx.font='700 42px Pretendard, sans-serif';ctx.fillText('우리 회사에 맞는 ERP 가상 컨설팅 진단',110,200);
 ctx.font='500 24px Pretendard, sans-serif';ctx.fillStyle='#61718d';ctx.fillText(label('industry',answers.industry)+' · 연 매출 '+label('revenue',answers.revenue),110,250);
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

export function savePng(canvas, filename) {
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
