import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';const file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep)||pathname.split('/').some(p=>p.startsWith('.'))||!types[extname(file)]||!(await stat(file)).isFile()){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'content-type':types[extname(file)],'cache-control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('ERP preview: http://127.0.0.1:4173'));
