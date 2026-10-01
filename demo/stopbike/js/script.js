/* =========================================================
   STOP BIKE — script.js
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* raios das rodas (entrelaçamento tangencial) */
  document.querySelectorAll('.spokes').forEach(g=>{
    const n=32;
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2, off=(i%2?1:-1)*0.42;
      const l=document.createElementNS(NS,'line');
      l.setAttribute('x1',(17*Math.cos(a+off)).toFixed(2));
      l.setAttribute('y1',(17*Math.sin(a+off)).toFixed(2));
      l.setAttribute('x2',(152*Math.cos(a)).toFixed(2));
      l.setAttribute('y2',(152*Math.sin(a)).toFixed(2));
      l.setAttribute('stroke', i%8===0 ? '#3ddc57' : '#c3c9ce');
      l.setAttribute('stroke-width', i%8===0 ? '1.8' : '1.3');
      l.setAttribute('opacity','.78');
      g.appendChild(l);
    }
  });

  /* menu mobile */
  const mnav=document.getElementById('mnav'), burger=document.getElementById('burger');
  const setMenu=o=>{mnav.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';};
  burger.addEventListener('click',()=>setMenu(true));
  document.getElementById('mclose').addEventListener('click',()=>setMenu(false));
  mnav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});

  /* anos de oficina e ano do rodapé */
  const now=new Date();
  document.getElementById('years').textContent = now.getFullYear()-1998;
  document.getElementById('yr').textContent = now.getFullYear();

  /* header ao rolar */
  const nav=document.getElementById('nav');
  const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>30);
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  /* parallax por mouse e scroll */
  const hero=document.querySelector('.hero');
  const stage=document.getElementById('stage');
  const bg=hero.querySelector('.bg');
  let mx=0,my=0,sy=0;
  function applyPar(){
    stage.style.setProperty('--tx',(mx*-18)+'px');
    stage.style.setProperty('--ty',(my*-10 + sy*0.18)+'px');
    stage.style.setProperty('--bx',(mx*26)+'px');
    stage.style.setProperty('--by',(my*16 - sy*0.12)+'px');
    stage.style.setProperty('--br',(mx*2.2)+'deg');
    hero.style.setProperty('--bgx',(mx*-34)+'px');
    hero.style.setProperty('--bgy',(my*-20 + sy*0.3)+'px');
  }
  if(!reduce){
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      mx=(e.clientX-r.left)/r.width*2-1; my=(e.clientY-r.top)/r.height*2-1; applyPar();
    });
    hero.addEventListener('pointerleave',()=>{mx=0;my=0;applyPar();});
    window.addEventListener('scroll',()=>{sy=Math.min(window.scrollY,900);applyPar();},{passive:true});
  }

  /* spotlight nos cards */
  document.querySelectorAll('.svc,.cat').forEach(c=>c.addEventListener('pointermove',e=>{
    const r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px'); c.style.setProperty('--my',(e.clientY-r.top)+'px');
  }));

  /* ===== FUMAÇA NAS RODAS + PARTÍCULAS ===== */
  const cv=document.getElementById('fx'); if(!cv||reduce) return;
  const ctx=cv.getContext('2d');
  const pRear=document.getElementById('probeRear'), pFront=document.getElementById('probeFront');
  let W=0,H=0,dpr=1;
  function size(){
    const r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2);
    W=r.width; H=r.height; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  size(); window.addEventListener('resize',size);

  const smoke=[], dust=[];
  for(let i=0;i<70;i++) dust.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.4,v:Math.random()*.25+.05,t:Math.random()*6.28});
  const start=performance.now();

  function contact(el){
    const c=cv.getBoundingClientRect(), r=el.getBoundingClientRect();
    return {x:r.left-c.left+r.width*0.5, y:r.bottom-c.top-r.height*0.05, w:r.width};
  }
  function emit(p,rate,scale){
    for(let i=0;i<rate;i++){
      if(smoke.length>260) smoke.shift();
      smoke.push({
        x:p.x-Math.random()*p.w*0.28, y:p.y-Math.random()*p.w*0.06,
        vx:-(1.2+Math.random()*2.6), vy:-(0.15+Math.random()*0.7),
        r:(8+Math.random()*14)*scale, g:1.012+Math.random()*0.012,
        a:0, max:(0.16+Math.random()*0.16), life:0, ttl:70+Math.random()*70,
        green:Math.random()<0.18
      });
    }
  }
  function frame(t){
    const el=(t-start)/1000;
    ctx.clearRect(0,0,W,H);

    /* poeira verde flutuando */
    for(const d of dust){
      d.y-=d.v/H*6; d.t+=0.02; if(d.y<0){d.y=1;d.x=Math.random();}
      const a=(0.25+0.35*Math.sin(d.t))*Math.min(1,el/2.5);
      ctx.fillStyle='rgba(97,236,120,'+Math.max(0,a).toFixed(3)+')';
      ctx.beginPath(); ctx.arc(d.x*W+Math.sin(d.t)*6,d.y*H,d.r,0,6.283); ctx.fill();
    }

    /* fumaça começa depois da entrada da bike */
    if(el>1.9){
      const rear=contact(pRear), front=contact(pFront);
      const s=Math.max(.6,rear.w/360);
      emit(rear,3,s); if(Math.random()<.7) emit(front,1,s*.8);
    }
    for(let i=smoke.length-1;i>=0;i--){
      const p=smoke[i]; p.life++;
      p.x+=p.vx; p.y+=p.vy; p.vx*=0.985; p.vy-=0.006; p.r*=p.g;
      const k=p.life/p.ttl;
      p.a = k<0.15 ? p.max*(k/0.15) : p.max*(1-(k-0.15)/0.85);
      if(p.life>=p.ttl){smoke.splice(i,1);continue;}
      const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      const c=p.green?'90,225,110':'205,214,210';
      grd.addColorStop(0,'rgba('+c+','+p.a.toFixed(3)+')');
      grd.addColorStop(1,'rgba('+c+',0)');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
