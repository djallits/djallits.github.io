import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './build.mjs';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT || 4321);
createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  const file=path.resolve(root,`.${decodeURIComponent(url.pathname)}`);
  if(file!==root && !file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let target=file;
  if((await stat(file)).isDirectory()) target=path.join(file,'index.html');
  const body=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(body);
 } catch {
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')));
 }
}).listen(port,'0.0.0.0',()=>console.log(`Development server listening on port ${port}. Re-run npm run dev after edits.`));
