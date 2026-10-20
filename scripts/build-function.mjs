import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const rules=await readFile(new URL('supabase/functions/_shared/erp-rules.js',root),'utf8');
const fn=await readFile(new URL('supabase/functions/erp-consulting/index.ts',root),'utf8');
await mkdir(new URL('.tmp/',root),{recursive:true});
await writeFile(new URL('.tmp/erp-consulting.ts',root),rules.replace(/^export /gm,'')+'\n'+fn.replace(/^import .*?;\s*/,'')+'\n');
console.log('Dashboard single-file bundle: .tmp/erp-consulting.ts');
