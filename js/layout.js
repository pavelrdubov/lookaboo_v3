/* раскладка коллажа: шаблоны MAGV (дуга, сетка, «слева крупно»…) остаются — они дают узнаваемые
   журнальные композиции и чередуются по набору и дню. Внутри шаблона раскладываем аккуратно:
   1) вещь вписывается в свой слот по самой вещи, без прозрачных полей картинки
      (CATALOG: b — где вещь в кадре, r — пропорция кадра);
   2) главное крупно, аксессуары мельче: крупные вещи — в крупные слоты, мелочь не раздувается;
   3) нахлёст лёгкий: сильнее — раздвигаем;
   4) никто не «улетает»: далёкую от соседей вещь чуть подтягиваем к группе;
   5) группа по центру, поля вокруг одинаковые, не заходит за скругление арки и под стрелки.
   Вещь держится за точку своего слота — двигаем только сколько нужно, композиция шаблона сохраняется.
   Пометка ставится ПОСЛЕ раскладки — только на свободное место, никогда не на вещь (см. fitNote). */

/* относительный размер вещи — какая вещь главнее */
const ROLE={ovWinter:1,ovDemi:1,ovFleece:.98,slip:.96,slipKnit:.96,romper:.92,dress:.92,dungarees:.92,
  bodyL:.84,bodyS:.8,bodyT:.78,wrapbody:.8,wrap:.76,cardigan:.84,sweater:.84,jacket:.88,vest:.76,tank:.74,
  pants:.8,shorts:.66,footpants:.78,muslin:.62,blanket:.66,hat:.46,hatWarm:.48,panama:.48,socks:.36,mittens:.38,toy:.38};
const roleOf=k=>ROLE[k]||.7;
const BOX={}; CATALOG.forEach(c=>{BOX[c.file]={b:c.b||[0,0,1,1],r:c.r||1};});

/* items: [{key, src}], W×H — поле для вещей; seed — какой шаблон; notes — пометки [{key, text, fs}];
   arch — скругление верха арки {r, ox, oy}: радиус и сдвиг поля от края арки.
   Возвращает вещи (rects) и rects.notes — где стоят пометки. */
const LAYOUT_CACHE={};
function layoutLook(items,W,H,seed,notes,arch){
  const n=Math.min(6,Math.max(2,items.length)), tpls=MAGV[n]||MAGV[4], tpl=tpls[seed%tpls.length];
  const ck=[items.map(i=>i.src).join(','),Math.round(W),Math.round(H),seed%tpls.length,(notes||[]).map(x=>x.key+x.text+x.fs).join(';'),arch&&arch.r].join('|');
  if(LAYOUT_CACHE[ck])return LAYOUT_CACHE[ck];
  let R=solveLayout(items,tpl,W,H,arch), placed=[];
  // 1) сначала вещи, 2) потом пометка — на свободное место; нет места — чуть уменьшаем коллаж (до 80%)
  for(const nt of (notes||[])){
    let p=null;
    for(let k=1;k>=.8&&!p;k-=.04){ const S2=k<1?scaleRects(R,k,W,H):R; p=fitNote(S2,nt,W,H,arch); if(p)R=S2; }
    if(p)placed.push(p);
  }
  return LAYOUT_CACHE[ck]=finishRects(R,placed);
}

function solveLayout(items,tpl,W,H,arch){
  const U=Math.min(W,H*.99);                       // базовый модуль шаблона, как раньше
  // крупные вещи — в крупные слоты шаблона
  const order=items.map((it,i)=>i).sort((a,b)=>roleOf(items[b].key)-roleOf(items[a].key));
  const slots=tpl.slice(0,items.length).sort((a,b)=>b.w*b.h-a.w*a.h);
  const R=items.map(()=>null);
  order.forEach((ii,rank)=>{
    const it=items[ii], sl=slots[Math.min(rank,slots.length-1)], bx=BOX[it.src]||{b:[0,0,1,1],r:1};
    const cw=bx.b[2]-bx.b[0], ch=bx.b[3]-bx.b[1], a=Math.max(.25,Math.min(4,cw*bx.r/ch));   // пропорция самой вещи
    const bw=sl.w*U, bh=sl.h*U, w0=Math.min(bw,bh*a);                                       // вписываем в слот
    R[ii]={key:it.key,src:it.src,f:roleOf(it.key),a,bx,w0,h0:w0/a,
      ax:sl.x*W, ay:sl.y*H-H*.05, x:sl.x*W, y:sl.y*H-H*.05,
      rot:sl.r, main:rank===0,
      z:sl.z+(FLAT.includes(it.key)?-3:(NOTLAYER.includes(it.key)?3:0))};
  });
  // мелочь не раздуваем: аксессуар не больше, чем положено ему рядом с главной вещью
  const main=R.find(r=>r.main), mainSide=Math.sqrt(main.w0*main.h0);
  R.forEach(r=>{ if(r.main)return; const lim=mainSide*r.f/main.f*1.08, side=Math.sqrt(r.w0*r.h0);
    if(side>lim){const k=lim/side; r.w0*=k; r.h0*=k;} });

  let g=1;                                           // общий масштаб
  const M=6, GAP=Math.min(W,H)*.05;
  const dims=r=>{r.w=r.w0*g; r.h=r.h0*g;};
  const allow=(a,b)=>.08*Math.min(a.w*a.h,b.w*b.h);
  const gapOf=(a,b)=>Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,Math.abs(a.y-b.y)-(a.h+b.h)/2);
  const clamp=r=>{
    r.x=Math.max(M+r.w/2,Math.min(W-M-r.w/2,r.x)); r.y=Math.max(M+r.h/2,Math.min(H-M-r.h/2,r.y));
    archOut(r,W,arch,M).forEach(c=>{const k=(c.d-c.rr)/c.d; r.x-=(c.px-c.cx)*k; r.y-=(c.py-c.cy)*k;}); };
  const groupBox=()=>({x0:Math.min(...R.map(r=>r.x-r.w/2)),x1:Math.max(...R.map(r=>r.x+r.w/2)),
                       y0:Math.min(...R.map(r=>r.y-r.h/2)),y1:Math.max(...R.map(r=>r.y+r.h/2))});
  const tooClose=()=>R.some((a,i)=>R.some((b,j)=>j>i&&overlap(a,b)>allow(a,b)*1.5))||R.some(r=>archOut(r,W,arch,M).length);

  for(let round=0;round<10;round++){
    R.forEach(dims);
    R.forEach(r=>{r.x=r.ax;r.y=r.ay;});            // каждый раунд — от точек шаблона
    for(let it=0;it<70;it++){
      // нахлёст: раздвигаем, мелкая вещь отходит больше
      for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){
        const a=R[i], b=R[j], ov=overlap(a,b)-allow(a,b); if(ov<=0)continue;
        let dx=b.x-a.x, dy=b.y-a.y; const d=Math.hypot(dx,dy)||1; dx/=d; dy/=d;
        const p=Math.sqrt(ov)*.25, wa=b.f/(a.f+b.f), wb=a.f/(a.f+b.f);
        a.x-=dx*p*wa; a.y-=dy*p*wa; b.x+=dx*p*wb; b.y+=dy*p*wb;
      }
      // «улетевшую» вещь — к ближайшему соседу
      R.forEach(a=>{ let nb=null,gm=1e9; R.forEach(b=>{if(b!==a){const gg=gapOf(a,b);if(gg<gm){gm=gg;nb=b;}}});
        if(nb&&gm>GAP){const k=Math.min(.08,(gm-GAP)/(Math.hypot(nb.x-a.x,nb.y-a.y)||1)); a.x+=(nb.x-a.x)*k; a.y+=(nb.y-a.y)*k;} });
      // держимся за точку шаблона
      R.forEach(r=>{ r.x+=(r.ax-r.x)*.06; r.y+=(r.ay-r.y)*.06; });
      R.forEach(clamp);
    }
    // группа по центру — поля вокруг одинаковые
    const gb=groupBox(), dx=W/2-(gb.x0+gb.x1)/2, dy=H/2-(gb.y0+gb.y1)/2;
    R.forEach(r=>{r.x+=dx;r.y+=dy;r.ax+=dx;r.ay+=dy;}); R.forEach(clamp);
    // масштаб: тесно — уменьшаем, есть место — чуть увеличиваем
    const fit=Math.min((W-2*M)/(gb.x1-gb.x0),(H-2*M)/(gb.y1-gb.y0));
    if(tooClose())g*=.95; else if(fit>1.03&&g<1.2)g*=Math.min(1.05,fit*.98); else break;
  }
  R.forEach(dims);
  return R.map(r=>({key:r.key,src:r.src,main:r.main,z:r.z,rot:r.rot,bx:r.bx,x:r.x,y:r.y,w:r.w,h:r.h}));
}

/* общие помощники: пересечение прямоугольников (по центру и размерам) и выход за скругление арки */
function overlap(a,b){
  return Math.max(0,Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2))
        *Math.max(0,Math.min(a.y+a.h/2,b.y+b.h/2)-Math.max(a.y-a.h/2,b.y-b.h/2));
}
/* верхние углы арки скруглены: угол прямоугольника (с запасом ins — вещи не прямоугольные) должен быть внутри дуги */
function archOut(r,W,arch,M,ins){
  if(!arch)return [];
  ins=ins==null?.18:ins;
  const rr=arch.r-M, cy=arch.r-(arch.oy||0), out=[];
  [[-1,arch.r-(arch.ox||0)],[1,W-(arch.r-(arch.ox||0))]].forEach(([sd,cx])=>{
    const px=r.x+sd*r.w*(.5-ins), py=r.y-r.h*(.5-ins);
    if(py<cy&&(sd<0?px<cx:px>cx)){const d=Math.hypot(px-cx,py-cy); if(d>rr)out.push({px,py,cx,cy,d,rr});}});
  return out;
}
/* уменьшить весь коллаж вокруг центра поля — чтобы освободить место под пометку */
function scaleRects(R,k,W,H){
  return R.map(r=>Object.assign({},r,{x:W/2+(r.x-W/2)*k,y:H/2+(r.y-H/2)*k,w:r.w*k,h:r.h*k}));
}

/* пометка — только на полностью свободное место: рядом с её вещью (под, над, сбоку, по углам),
   ни на какую вещь не заходит (с запасом PAD), внутри поля и арки. Нет такого места — null */
function fitNote(R,nt,W,H,arch){
  const m=R.find(r=>r.key===nt.key); if(!m)return null;
  const M=6, PAD=5, fs=nt.fs;
  const full=nt.text.length*fs*.5+8, maxW=W*.5, lines=Math.min(2,Math.ceil(full/maxW));   // длинное — в две строки
  const w=Math.min(maxW,full), h=fs*1.15*lines+2;
  const L=m.x-m.w/2, Rr=m.x+m.w/2, T=m.y-m.h/2, B=m.y+m.h/2, g=fs*.45;
  const cand=[                                     // центр текста
    [L+w/2,B+g+h/2,'b'],[Rr-w/2,B+g+h/2,'b'],[m.x,B+g+h/2,'b'],
    [Rr+g+w/2,m.y,'r'],[L-g-w/2,m.y,'l'],[Rr+g+w/2,B-h/2,'r'],[L-g-w/2,B-h/2,'l'],
    [Rr+g+w/2,T+h/2,'r'],[L-g-w/2,T+h/2,'l'],[L+w/2,T-g-h/2,'t'],[Rr-w/2,T-g-h/2,'t']];
  let best=null;
  cand.forEach(([cx,cy,side],i)=>{
    const c={x:cx,y:cy,w:w+2*PAD,h:h+2*PAD};
    if(cx-w/2<M||cx+w/2>W-M||cy-h/2<M||cy+h/2>H-M)return;               // за краем поля
    if(archOut({x:cx,y:cy,w,h},W,arch,M,0).length)return;                 // за скруглением арки
    if(R.some(r=>overlap(r,c)>0))return;                                  // заходит на вещь — нельзя
    const d=i*.5;                                                          // ближе к началу списка — лучше
    if(!best||d<best.d)best={d,cx,cy,side};
  });
  // вплотную места нет — ищем ближайшее свободное место подальше (линия будет длиннее), но не дальше 40% поля
  if(!best){
    const step=fs*.6, maxD=Math.max(W,H)*.4;
    for(let cy=M+h/2;cy<=H-M-h/2;cy+=step)for(let cx=M+w/2;cx<=W-M-w/2;cx+=step){
      const c={x:cx,y:cy,w:w+2*PAD,h:h+2*PAD};
      if(archOut({x:cx,y:cy,w,h},W,arch,M,0).length||R.some(r=>overlap(r,c)>0))continue;
      const dx=Math.max(0,Math.max(L-(cx+w/2),(cx-w/2)-Rr)), dy=Math.max(0,Math.max(T-(cy+h/2),(cy-h/2)-B)), d=Math.hypot(dx,dy);
      if(d>maxD)continue;
      const side=dy>=dx?(cy<m.y?'t':'b'):(cx<m.x?'l':'r');
      if(!best||d<best.d)best={d,cx,cy,side};
    }
  }
  if(!best)return null;
  const x0=best.cx-w/2, y0=best.cy-h/2;
  // линия от вещи (чуть внутрь — вещи не прямоугольные) к ближнему краю текста
  let ax,ay,ex,ey;
  if(best.side==='b'||best.side==='t'){
    ax=Math.max(L+m.w*.15,Math.min(Rr-m.w*.15,best.cx)); ex=ax;
    ay=best.side==='b'?B-m.h*.08:T+m.h*.08; ey=best.side==='b'?y0:y0+h;
  }else{
    ey=best.cy; ay=Math.max(T+m.h*.15,Math.min(B-m.h*.15,ey));
    ax=best.side==='r'?Rr-m.w*.08:L+m.w*.08; ex=best.side==='r'?x0-2:x0+w+2;
  }
  return {key:nt.key,text:nt.text,x:x0,y:y0,w,h,ax,ay,ex,ey,side:best.side};
}

/* в координаты картинки: вещь (без полей) — в прямоугольник r, картинка вокруг неё */
function finishRects(R,placed){
  const out=R.map(r=>{ const b=r.bx.b, iw=r.w/(b[2]-b[0]), ih=r.h/(b[3]-b[1]);
    return {key:r.key,src:r.src,main:r.main,z:r.z,rot:r.rot,
      cx:r.x,cy:r.y,w:r.w,h:r.h,                                   // сама вещь
      left:r.x-iw*(b[0]+b[2])/2, top:r.y-ih*(b[1]+b[3])/2, iw, ih, // весь кадр картинки
      ox:iw*(b[0]+b[2])/2, oy:ih*(b[1]+b[3])/2}; });               // центр вещи внутри кадра
  out.notes=placed;
  return out;
}

/* ===== пометки на коллаже — как выноски в журнальном разборе образа =====
   Пишем только то, чего не видно на картинке: граммы утеплителя, «на резинке», «швы наружу», совет.
   Одна на образ — самая важная; нечего сказать — текста нет. */
function lookNotes(items,eff){
  const has=k=>items.some(x=>x[0]===k), out=[];
  const add=(k,text,pr)=>{ if(has(k)&&!out.some(n=>n.key===k))out.push({key:k,text,pr}); };
  if(has('ovWinter')||has('ovDemi')){ const g=insFor(eff).g; add(has('ovWinter')?'ovWinter':'ovDemi',/пух/.test(g)?g:g+' утеплителя',10); }
  if(S.ctx==='car')add('blanket','поверх ремней, не под них',9);
  if(S.ctx==='stroller'&&strollerKind()==='seat'&&eff<=6)add('blanket','укрыть ножки — в прогулочной дует',9);
  add('wrap','швы наружу — коже мягко',8);
  add('wrapbody','на запах — не через голову',8);
  add('mittens','на резинке — не потеряются',7);
  if(eff>=22){ add('muslin','коляску целиком не накрывать — внутри жарче',6); add('panama','закрывает шею от солнца',5); add('socks','в жару можно без носков',2); }
  else if(eff>=7)add('muslin','накрыть, если подует',3);
  if(eff<=6)add('blanket','поверх комбинезона',3);
  add('ovFleece',eff<=1?'флис — тёплый слой, дышит':'флис вместо свитера',6);
  if(eff>=11&&eff<=16)add('hat','тонкая шапочка — до +16',4);
  if(eff<=-5){ add('hatWarm','закрывает уши',4); add('socks','тёплые — стопы мёрзнут первыми',3); }
  if(eff<=1)add('slipKnit','вязаный — греет под комбинезоном',3);
  add('cardigan','снять в магазине за секунду',2);
  return out.sort((a,b)=>b.pr-a.pr).slice(0,1);
}
