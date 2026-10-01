/* раскладка коллажа: шаблоны MAGV (дуга, сетка, «слева крупно»…) остаются — они дают узнаваемые
   журнальные композиции и чередуются по набору и дню. Внутри шаблона раскладываем аккуратно:
   1) вещь вписывается в свой слот по самой вещи, без прозрачных полей картинки
      (CATALOG: b — где вещь в кадре, r — пропорция кадра);
   2) главное крупно, аксессуары мельче: крупные вещи — в крупные слоты, мелочь не раздувается;
   3) нахлёст лёгкий: сильнее — раздвигаем;
   4) никто не «улетает»: далёкую от соседей вещь чуть подтягиваем к группе;
   5) группа по центру, поля вокруг одинаковые, не заходит за скругление арки и под стрелки.
   Вещь держится за точку своего слота — двигаем только сколько нужно, композиция шаблона сохраняется. */

/* относительный размер вещи — какая вещь главнее */
const ROLE={ovWinter:1,ovDemi:1,ovFleece:.98,slip:.96,slipKnit:.96,romper:.92,dress:.92,dungarees:.92,
  bodyL:.84,bodyS:.8,bodyT:.78,wrapbody:.8,wrap:.76,cardigan:.84,sweater:.84,jacket:.88,vest:.76,tank:.74,
  pants:.8,shorts:.66,footpants:.78,muslin:.62,blanket:.66,hat:.46,hatWarm:.48,panama:.48,socks:.36,mittens:.38,toy:.38};
const roleOf=k=>ROLE[k]||.7;
const BOX={}; CATALOG.forEach(c=>{BOX[c.file]={b:c.b||[0,0,1,1],r:c.r||1};});

/* items: [{key, src}], W×H — поле для вещей; seed — какой шаблон; cap — подпись под главной {text, fs};
   arch — скругление верха арки {r, ox, oy}: радиус и сдвиг поля от края арки */
const LAYOUT_CACHE={};
function layoutLook(items,W,H,seed,cap,arch){
  const n=Math.min(6,Math.max(2,items.length)), tpls=MAGV[n]||MAGV[4], tpl=tpls[seed%tpls.length];
  const ck=[items.map(i=>i.src).join(','),Math.round(W),Math.round(H),seed%tpls.length,cap&&cap.text,arch&&arch.r].join('|');
  return LAYOUT_CACHE[ck]||(LAYOUT_CACHE[ck]=solveLayout(items,tpl,W,H,cap,arch));
}

function solveLayout(items,tpl,W,H,cap,arch){
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
  const inter=(a,b)=>Math.max(0,Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2))
                   *Math.max(0,Math.min(a.y+a.h/2,b.y+b.h/2)-Math.max(a.y-a.h/2,b.y-b.h/2));
  const allow=(a,b)=>.08*Math.min(a.w*a.h,b.w*b.h);
  const gapOf=(a,b)=>Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,Math.abs(a.y-b.y)-(a.h+b.h)/2);
  const capRect=()=>{ if(!cap)return null; const m=R.find(r=>r.main);
    const w=Math.min(W*.6,cap.text.length*cap.fs*.46+8), h=cap.fs*1.25;
    return {x:m.x-m.w/2+w/2+2,y:m.y+m.h/2+h/2-2,w,h}; };
  /* верхние углы арки скруглены: угол вещи (с запасом — вещи не прямоугольные) должен быть внутри дуги */
  const corners=r=>{ if(!arch)return [];
    const rr=arch.r-M, cy=arch.r-(arch.oy||0), ins=.18, out=[];
    [[-1,arch.r-(arch.ox||0)],[1,W-(arch.r-(arch.ox||0))]].forEach(([sd,cx])=>{
      const px=r.x+sd*r.w*(.5-ins), py=r.y-r.h*(.5-ins);
      if(py<cy&&(sd<0?px<cx:px>cx)){const d=Math.hypot(px-cx,py-cy); if(d>rr)out.push({px,py,cx,cy,d,rr});}});
    return out; };
  const clamp=r=>{
    r.x=Math.max(M+r.w/2,Math.min(W-M-r.w/2,r.x)); r.y=Math.max(M+r.h/2,Math.min(H-M-r.h/2,r.y));
    corners(r).forEach(c=>{const k=(c.d-c.rr)/c.d; r.x-=(c.px-c.cx)*k; r.y-=(c.py-c.cy)*k;}); };
  const groupBox=()=>{ const c=capRect(), all=c?R.concat([c]):R;
    return {x0:Math.min(...all.map(r=>r.x-r.w/2)),x1:Math.max(...all.map(r=>r.x+r.w/2)),
            y0:Math.min(...all.map(r=>r.y-r.h/2)),y1:Math.max(...all.map(r=>r.y+r.h/2))}; };
  const tooClose=()=>R.some((a,i)=>R.some((b,j)=>j>i&&inter(a,b)>allow(a,b)*1.5))||R.some(r=>corners(r).length);

  for(let round=0;round<10;round++){
    R.forEach(dims);
    R.forEach(r=>{r.x=r.ax;r.y=r.ay;});            // каждый раунд — от точек шаблона
    for(let it=0;it<70;it++){
      // нахлёст: раздвигаем, мелкая вещь отходит больше
      for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){
        const a=R[i], b=R[j], ov=inter(a,b)-allow(a,b); if(ov<=0)continue;
        let dx=b.x-a.x, dy=b.y-a.y; const d=Math.hypot(dx,dy)||1; dx/=d; dy/=d;
        const p=Math.sqrt(ov)*.25, wa=b.f/(a.f+b.f), wb=a.f/(a.f+b.f);
        a.x-=dx*p*wa; a.y-=dy*p*wa; b.x+=dx*p*wb; b.y+=dy*p*wb;
      }
      // подпись главной вещи — препятствие для остальных
      const c=capRect();
      if(c)R.forEach(r=>{ if(r.main)return; const ov=inter(r,c); if(ov)r.y+=(r.y<c.y?-1:1)*Math.min(5,Math.sqrt(ov)*.3); });
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
  return R.map(r=>{ const b=r.bx.b, iw=r.w/(b[2]-b[0]), ih=r.h/(b[3]-b[1]);
    return {key:r.key,src:r.src,main:r.main,z:r.z,rot:r.rot,
      cx:r.x,cy:r.y,w:r.w,h:r.h,                                   // сама вещь
      left:r.x-iw*(b[0]+b[2])/2, top:r.y-ih*(b[1]+b[3])/2, iw, ih, // весь кадр картинки
      ox:iw*(b[0]+b[2])/2, oy:ih*(b[1]+b[3])/2}; });               // центр вещи внутри кадра
}
