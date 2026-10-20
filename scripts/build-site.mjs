import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await mkdir(out,{recursive:true});
for(const file of ['index.html','erp.css','erp.js','erp-effects.js','erp-config.js','erp-admin.html','erp-admin.js'])await cp(new URL(file,root),new URL(file,out));
await mkdir(new URL('assets/',out),{recursive:true});
for(const name of ['result-poodle.png','result-pomeranian.png','result-shiba.png'])await cp(new URL('assets/'+name,root),new URL('assets/'+name,out));
for(const name of ['iwon-logo.png','erp-dashboard.png','erp-background.png','erp-og.png','erp-favicon.svg','erp-touch.png','product-wehago.png','product-amaranth.png','product-omni.png','product-oneai.png'])await cp(new URL('assets/'+name,root),new URL('assets/'+name,out));
await mkdir(new URL('supabase/functions/_shared/',out),{recursive:true});
await cp(new URL('supabase/functions/_shared/erp-rules.js',root),new URL('supabase/functions/_shared/erp-rules.js',out));
let html=await readFile(new URL('index.html',out),'utf8');
const host=process.env.SITE_URL||process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
if(host){const site=new URL(host.startsWith('http')?host:'https://'+host);html=html.replaceAll('content="/assets/erp-og.png"',`content="${new URL('assets/erp-og.png',site).href}"`);html=html.replace('</head>',`<meta property="og:url" content="${site.href}"><link rel="canonical" href="${site.href}"></head>`);}
await writeFile(new URL('index.html',out),html);
console.log('ERP static site built in dist/');
