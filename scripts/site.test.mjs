import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './build.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function htmlFiles(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await htmlFiles(p));else if(entry.name.endsWith('.html'))result.push(p);}return result;}
test('all required sections render accessible navigation and unique content',async()=>{
 for(const route of ['','about','posts','uses','portfolio','projects','resume']){
  const html=await readFile(path.join(root,route,'index.html'),'utf8');
  assert.match(html,/<html lang="en">/);assert.match(html,/<h1>/);assert.match(html,/id="main"/);
  assert.match(html,/aria-controls="navigation"/);
  if(route)assert.match(html,new RegExp(`href="/${route}/" aria-current="page"`));
 }
});
test('every generated internal link and local asset resolves',async()=>{
 for(const file of await htmlFiles(root)){
  const html=await readFile(file,'utf8');
  for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){
   const target=path.join(root,match[1]);assert.ok(await stat(target),`${file}: missing ${match[1]}`);
  }
 }
});
test('site includes print support, reduced motion, sitemap and Pages marker',async()=>{
 assert.match(await readFile(path.join(root,'style.css'),'utf8'),/@media print/);
 assert.match(await readFile(path.join(root,'site.js'),'utf8'),/prefers-reduced-motion/);
 assert.match(await readFile(path.join(root,'sitemap.xml'),'utf8'),/https:\/\/djallits.github.io\/uses\//);
 assert.equal(await readFile(path.join(root,'.nojekyll'),'utf8'),'');
});

test('development server serves all sections and a real 404 response',async()=>{
 const { spawn }=await import('node:child_process');
 const { get }=await import('node:http');
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:path.dirname(root),env:{...process.env,PORT:'14321'},stdio:['ignore','pipe','pipe']});
 try {
  await new Promise((resolve,reject)=>{
   let output='';const timer=setTimeout(()=>reject(new Error('Server startup timed out')),10000);
   child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited: ${code}`));});
   child.stdout.on('data',chunk=>{output+=chunk;if(output.includes('listening on port')){clearTimeout(timer);resolve();}});
  });
  for(const route of ['/','/about/','/posts/','/uses/','/portfolio/','/projects/','/resume/','/missing/']){
   await new Promise((resolve,reject)=>get({hostname:'127.0.0.1',port:14321,path:route},res=>{
    let html='';res.on('data',chunk=>html+=chunk);res.on('end',()=>{
     try{assert.equal(res.statusCode,route==='/missing/'?404:200);assert.match(html,/<h1>/);resolve();}catch(error){reject(error);}
    });
   }).on('error',reject));
  }
 } finally {child.kill();}
});
