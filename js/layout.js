/* раскладка коллажа: не фиксированные слоты, а подгонка по правилам —
   1) главное крупно, аксессуары мельче (размер по роли вещи);
   2) вещи почти не залезают друг на друга (допускаем лёгкий нахлёст);
   3) никто не «улетает»: до ближайшего соседа — не дальше небольшого зазора;
   4) группа по центру, поля вокруг одинаковые; группа занимает арку, но не упирается в края.
   Считаем по самой вещи, без прозрачных полей картинки (CATALOG: b — где вещь в кадре, r — пропорция кадра).
   Шаблоны MAGV дают стартовые точки и наклоны, чтобы композиции были разными. */

/* относительный размер вещи (сторона квадрата той же площади) */
const ROLE={ovWinter:1,ovDemi:1,ovFleece:.98,slip:.96,slipKnit:.96,romper:.92,dress:.92,dungarees:.92,
  bodyL:.84,bodyS:.8,bodyT:.78,wrapbody:.8,wrap:.76,cardigan:.84,sweater:.84,jacket:.88,vest:.76,tank:.74,
  pants:.8,shorts:.66,footpants:.78,muslin:.62,blanket:.66,hat:.46,hatWarm:.48,panama:.48,socks:.36,mittens:.38,toy:.38};
const roleOf=k=>ROLE[k]||.7;
const BOX={}; CATALOG.forEach(c=>{BOX[c.file]={b:c.b||[0,0,1,1],r:c.r||1};});

/* items: [{key, src}], W×H — поле для вещей; cap — подпись под главной вещью {text, fs};
   arch — скругление верха арки {r, ox, oy}: радиус и сдвиг поля от края арки */
const LAYOUT_CACHE={};
function layoutLook(items,W,H,seed,cap,arch){
  const ck=[items.map(i=>i.src).join(','),Math.round(W),Math.round(H),seed%2,cap&&cap.text,arch&&arch.r].join('|');
  if(LAYOUT_CACHE[ck])return LAYOUT_CACHE[ck];
  return LAYOUT_CACHE[ck]=layoutSolve(items,W,H,seed,cap,arch);
}
function layoutSolve(items,W,H,seed,cap,arch){
  const n=Math.min(6,Math.max(2,items.length)), tpls=MAGV[n]||MAGV[4];
  const runs=tpls.map(t=>solveLayout(items,t,W,H,cap,arch)).sort((a,b)=>b.score-a.score);
  // разнообразие: чередуем два лучших шаблона (по набору и дню), если второй не сильно хуже
  const alt=runs[1]&&runs[1].score>runs[0].score-1.2?runs[1]:runs[0];
  return (seed%2?alt:runs[0]).rects;
}

function solveLayout(items,tpl,W,H,cap,arch){
  // крупные вещи — в крупные слоты шаблона
  const order=items.map((it,i)=>i).sort((a,b)=>roleOf(items[b].key)-roleOf(items[a].key));
  const slots=tpl.slice(0,items.length).map((s,i)=>Object.assign({i},s)).sort((a,b)=>b.w*b.h-a.w*a.h);
  const R=items.map(()=>null);
  order.forEach((ii,rank)=>{
    const it=items[ii], sl=slots[rank]||slots[slots.length-1], bx=BOX[it.src]||{b:[0,0,1,1],r:1};
    const cw=bx.b[2]-bx.b[0], ch=bx.b[3]-bx.b[1], a=Math.max(.25,Math.min(4,cw*bx.r/ch));   // пропорция самой вещи
    R[ii]={key:it.key,src:it.src,f:roleOf(it.key),a,bx,x:sl.x*W,y:sl.y*H,
      rot:sl.r*(roleOf(it.key)<.6?1.3:1),main:rank===0,
      z:(rank===0?6:5-Math.min(2,rank>>1))+(FLAT.includes(it.key)?-3:(NOTLAYER.includes(it.key)?3:0))};
  });
  const sumF2=R.reduce((t,r)=>t+r.f*r.f,0);
  let s=Math.sqrt(W*H*.40/sumF2);                // стартовый масштаб: вещи ~40% площади
  const GAP=Math.min(W,H)*.045, M=6;              // допустимый зазор до соседа, поле у края
  const dims=r=>{r.w=s*r.f*Math.sqrt(r.a); r.h=s*r.f/Math.sqrt(r.a);};
  const capRect=()=>{const m=R.find(r=>r.main); if(!cap||!m)return null;
    const w=Math.min(W*.6,cap.text.length*cap.fs*.46+8), h=cap.fs*1.25;
    return {x:m.x-m.w/2+w/2+2,y:m.y+m.h/2+h/2-2,w,h};};
  const inter=(a,b)=>Math.max(0,Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2))
                   *Math.max(0,Math.min(a.y+a.h/2,b.y+b.h/2)-Math.max(a.y-a.h/2,b.y-b.h/2));
  const gapOf=(a,b)=>Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,Math.abs(a.y-b.y)-(a.h+b.h)/2);
  const groupBox=()=>{const c=capRect(), all=c?R.concat([c]):R;
    return {x0:Math.min(...all.map(r=>r.x-r.w/2)),x1:Math.max(...all.map(r=>r.x+r.w/2)),
            y0:Math.min(...all.map(r=>r.y-r.h/2)),y1:Math.max(...all.map(r=>r.y+r.h/2))};};

  /* верхние углы арки скруглены: угол вещи (с запасом — вещи не прямоугольные) должен быть внутри дуги */
  const archFit=r=>{ if(!arch)return;
    const rr=arch.r-M, cy=arch.r-(arch.oy||0), ins=.18;
    [[-1,arch.r-(arch.ox||0)],[1,W-(arch.r-(arch.ox||0))]].forEach(([sd,cx])=>{
      const px=r.x+sd*r.w*(.5-ins), py=r.y-r.h*(.5-ins);
      if(py>=cy||(sd<0?px>=cx:px<=cx))return;
      const d=Math.hypot(px-cx,py-cy); if(d<=rr)return;
      const k=(d-rr)/d; r.x-=(px-cx)*k; r.y-=(py-cy)*k; }); };
  const archOut=r=>{ if(!arch)return 0; let o=0; const rr=arch.r-M, cy=arch.r-(arch.oy||0), ins=.18;
    [[-1,arch.r-(arch.ox||0)],[1,W-(arch.r-(arch.ox||0))]].forEach(([sd,cx])=>{
      const px=r.x+sd*r.w*(.5-ins), py=r.y-r.h*(.5-ins);
      if(py<cy&&(sd<0?px<cx:px>cx))o+=Math.max(0,Math.hypot(px-cx,py-cy)-rr);}); return o; };

  for(let round=0;round<14;round++){
    R.forEach(dims);
    for(let it=0;it<60;it++){
      // 1) растаскиваем сильные нахлёсты (мелкая вещь отходит больше)
      for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){
        const a=R[i], b=R[j], ov=inter(a,b), allow=.07*Math.min(a.w*a.h,b.w*b.h);
        if(ov<=allow)continue;
        let dx=b.x-a.x, dy=b.y-a.y; const d=Math.hypot(dx,dy)||1; dx/=d; dy/=d;
        const push=Math.sqrt(ov-allow)*.25, wa=b.f/(a.f+b.f), wb=a.f/(a.f+b.f);
        a.x-=dx*push*wa; a.y-=dy*push*wa; b.x+=dx*push*wb; b.y+=dy*push*wb;
      }
      // подпись главной вещи — тоже препятствие
      const c=capRect();
      if(c)R.forEach(r=>{ if(r.main)return; const ov=inter(r,c); if(!ov)return;
        const dy=r.y<c.y?-1:1; r.y+=dy*Math.min(6,Math.sqrt(ov)*.3); });
      // 2) одинокие подтягиваем к группе
      const gx=R.reduce((t,r)=>t+r.x*r.f,0)/R.reduce((t,r)=>t+r.f,0), gy=R.reduce((t,r)=>t+r.y*r.f,0)/R.reduce((t,r)=>t+r.f,0);
      R.forEach(a=>{ const g=Math.min(...R.filter(b=>b!==a).map(b=>gapOf(a,b)));
        if(g>GAP){const k=Math.min(.15,(g-GAP)/(Math.hypot(gx-a.x,gy-a.y)||1)); a.x+=(gx-a.x)*k; a.y+=(gy-a.y)*k;} });
      // не выходим за поле и за скругление арки
      R.forEach(r=>{ r.x=Math.max(M+r.w/2,Math.min(W-M-r.w/2,r.x)); r.y=Math.max(M+r.h/2,Math.min(H-M-r.h/2,r.y)); archFit(r); });
    }
    // 4) центрируем группу и подгоняем масштаб под поле
    const g=groupBox(), gw=g.x1-g.x0, gh=g.y1-g.y0;
    const dx=W/2-(g.x0+g.x1)/2, dy=H/2-(g.y0+g.y1)/2; R.forEach(r=>{r.x+=dx;r.y+=dy;});
    R.forEach(archFit);
    const fit=Math.min((W-2*M)/gw,(H-2*M)/gh), bad=R.some(r=>archOut(r)>2)||R.some((a,i)=>R.some((b,j)=>j>i&&inter(a,b)>.12*Math.min(a.w*a.h,b.w*b.h)));
    s*=bad?.95:Math.max(.9,Math.min(1.06,Math.pow(fit*.94,.5)));
  }
  R.forEach(dims);
  // оценка: нахлёсты, «улетевшие», крупность, ровность полей
  let pen=0;
  for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){
    const a=R[i], b=R[j]; pen+=Math.max(0,inter(a,b)-.07*Math.min(a.w*a.h,b.w*b.h))/(W*H)*40;}
  R.forEach(a=>{const gg=Math.min(...R.filter(b=>b!==a).map(b=>gapOf(a,b))); pen+=Math.max(0,gg-GAP)/Math.min(W,H)*12;});
  const g=groupBox();
  pen+=Math.max(0,g.x0<0?-g.x0:0,g.x1>W?g.x1-W:0,g.y0<0?-g.y0:0,g.y1>H?g.y1-H:0)/Math.min(W,H)*20;
  pen+=(Math.abs(g.x0-(W-g.x1))+Math.abs(g.y0-(H-g.y1)))/Math.min(W,H)*2;
  pen+=R.reduce((t,r)=>t+archOut(r),0)/Math.min(W,H)*20;
  const fill=R.reduce((t,r)=>t+r.w*r.h,0)/(W*H);
  const score=fill*6-pen;
  // в координаты картинки: вещь (без полей) — в прямоугольник r, картинка вокруг неё
  const rects=R.map(r=>{ const b=r.bx.b, iw=r.w/(b[2]-b[0]), ih=r.h/(b[3]-b[1]);
    return {key:r.key,src:r.src,main:r.main,z:r.z,rot:r.rot,
      cx:r.x,cy:r.y,w:r.w,h:r.h,                                   // сама вещь
      left:r.x-iw*(b[0]+b[2])/2, top:r.y-ih*(b[1]+b[3])/2, iw, ih, // весь кадр картинки
      ox:iw*(b[0]+b[2])/2, oy:ih*(b[1]+b[3])/2};});                // центр вещи внутри кадра
  return {rects,score};
}
