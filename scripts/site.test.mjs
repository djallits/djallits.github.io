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
 assert.match(await readFile(path.join(root,'sitemap.xml'),'utf8'),/https:\/\/dan.jallits.com\/uses\//);
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
  const data=JSON.parse(await readFile(new URL('../content/site.json',import.meta.url),'utf8'));
  for(const route of ['/','/about/','/posts/','/uses/','/portfolio/','/projects/','/resume/',...data.posts.map(post=>`/posts/${post.slug}/`),'/missing/']){
   await new Promise((resolve,reject)=>get({hostname:'127.0.0.1',port:14321,path:route},res=>{
    let html='';res.on('data',chunk=>html+=chunk);res.on('end',()=>{
     try{assert.equal(res.statusCode,route==='/missing/'?404:200);assert.match(html,/<h1>/);resolve();}catch(error){reject(error);}
    });
   }).on('error',reject));
  }
 } finally {child.kill();}
});

test('all four edited articles are complete and listed without an empty-state message',async()=>{
 const data=JSON.parse(await readFile(new URL('../content/site.json',import.meta.url),'utf8'));
 assert.equal(data.posts.length,4);
 const index=await readFile(path.join(root,'posts/index.html'),'utf8');
 assert.doesNotMatch(index,/The first chapter is on its way/);
 const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 for(const post of data.posts){
  const html=await readFile(path.join(root,'posts',post.slug,'index.html'),'utf8');
  assert.match(index,new RegExp(`/posts/${post.slug}/`));
  assert.ok(html.includes(escape(post.sections.at(-1).paragraphs.at(-1))),`${post.slug}: conclusion missing`);
  assert.ok(html.includes(`content="${escape(post.excerpt)}"`),`${post.slug}: article description missing`);
  assert.ok(html.includes(post.sourceUrl),`${post.slug}: original attribution missing`);
  for(const section of post.sections){
   assert.ok(html.includes(`<h2`) && html.includes(escape(section.heading)),`${post.slug}: section missing`);
   for(const paragraph of [...section.paragraphs,...(section.after||[])])assert.ok(html.includes(escape(paragraph)),`${post.slug}: text truncated`);
   if(section.code)assert.ok(html.includes(escape(section.code.text)),`${post.slug}: code example missing`);
  }
 }
 const costs=await readFile(path.join(root,'posts/economics-enterprise-ai-hybrid-inference/index.html'),'utf8');
 assert.match(costs,/<table>/);assert.match(costs,/\$125,000–\$300,000/);assert.match(costs,/not vendor quotes/);
});

test('every LinkedIn teaser contains a working generated article path',async()=>{
 const data=JSON.parse(await readFile(new URL('../content/site.json',import.meta.url),'utf8'));
 const teasers=await readFile(path.join(root,'linkedin-extracts.txt'),'utf8');
 for(const post of data.posts){
  assert.ok(teasers.includes(post.linkedinExtract));
  assert.ok(teasers.includes(`https://dan.jallits.com/posts/${post.slug}/`));
  assert.ok(await stat(path.join(root,'posts',post.slug,'index.html')));
 }
});

test('custom domain is canonical and original publication dates are preserved',async()=>{
 const data=JSON.parse(await readFile(new URL('../content/site.json',import.meta.url),'utf8'));
 assert.equal(await readFile(path.join(root,'CNAME'),'utf8'),'dan.jallits.com\n');
 const dates={
  'economics-enterprise-ai-hybrid-inference':'2026-05-28',
  'why-talented-teams-move-slowly':'2026-05-27',
  'local-ai-workloads':'2026-05-26',
  'multi-agent-ai-control-planes':'2026-05-25'
 };
 const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
 for(const post of data.posts){
  const url=`https://dan.jallits.com/posts/${post.slug}/`;
  const html=await readFile(path.join(root,'posts',post.slug,'index.html'),'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
  assert.equal(post.date,dates[post.slug]);
  assert.ok(html.includes(`datetime="${dates[post.slug]}"`));
  assert.ok(sitemap.includes(`<loc>${url}</loc>`));
 }
 assert.doesNotMatch(sitemap,/djallits.github.io/);
});
