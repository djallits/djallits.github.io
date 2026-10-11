const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
 const expanded = menu.getAttribute('aria-expanded') !== 'true';
 menu.setAttribute('aria-expanded', String(expanded));
 nav.classList.toggle('open', expanded);
});
document.addEventListener('keydown', event => {
 if(event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
  menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); menu.focus();
 }
});
document.querySelector('#print-resume')?.addEventListener('click', () => window.print());
const canvas = document.querySelector('#orbit');
if(canvas) {
 const ctx = canvas.getContext('2d');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let visible = true, frame, start = performance.now();
 const draw = (time = start) => {
  const rect = canvas.getBoundingClientRect(), scale = Math.min(devicePixelRatio || 1,2);
  if(canvas.width !== Math.round(rect.width*scale) || canvas.height !== Math.round(rect.height*scale)) { canvas.width = Math.round(rect.width*scale); canvas.height = Math.round(rect.height*scale); }
  ctx.setTransform(scale,0,0,scale,0,0); ctx.clearRect(0,0,rect.width,rect.height);
  const size = Math.min(rect.width,rect.height)*.39;
  const phase = motion.matches ? .4 : (time-start)*.00014;
  ctx.save();ctx.translate(rect.width/2,rect.height/2);
  for(let ring=0;ring<4;ring++) {
   ctx.save();ctx.rotate(-.6+ring*.65);ctx.strokeStyle=ring===1?'#d2ec9180':'#a8afa140';ctx.lineWidth=1;
   ctx.beginPath();ctx.ellipse(0,0,size,size*(.28+ring*.09),0,0,Math.PI*2);ctx.stroke();
   const angle=phase*(ring%2?-1:1)+ring*1.4;
   const x=Math.cos(angle)*size,y=Math.sin(angle)*size*(.28+ring*.09);
   ctx.fillStyle='#d2ec91';ctx.beginPath();ctx.arc(x,y,ring===1?5:3,0,Math.PI*2);ctx.fill();ctx.restore();
  }ctx.restore();
  if(!motion.matches && visible && !document.hidden) frame=requestAnimationFrame(draw);
 };
 const restart=()=>{cancelAnimationFrame(frame);draw();};
 new ResizeObserver(restart).observe(canvas);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();}).observe(canvas);
 motion.addEventListener('change',restart);document.addEventListener('visibilitychange',restart);draw();
}
