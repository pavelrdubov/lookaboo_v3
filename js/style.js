/* сочетание цветов: из картинок каждой вещи собираем «журнальный» образ, а не случайный набор.
   Правила (как у стилистов, принцип 60-30-10):
   - база нейтральная: молочный, белый, бежевый, серый, тёмно-синий;
   - акцентных оттенков не больше двух;
   - цвета рядом на цветовом круге (тон в тон, соседние) — хорошо;
     противоположные — только если хотя бы один приглушённый; «через четверть круга» — спорят;
   - яркое с пастельным рядом не ставим;
   - тёплые нейтральные (молочный, беж) с холодными (голубовато-серый) — хуже;
   - аксессуар в цвет одной из вещей — плюс: образ выглядит собранным.
   Цвет каждой картинки определяет tools/catalog.py (COLOR[id] = [основной, второй?]). */

function hexHsl(hex){
  const n=parseInt(String(hex).slice(1),16), r=(n>>16&255)/255, g=(n>>8&255)/255, b=(n&255)/255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, c=mx-mn;
  let h=0;
  if(c){ if(mx===r)h=((g-b)/c)%6; else if(mx===g)h=(b-r)/c+2; else h=(r-g)/c+4; h=(h*60+360)%360; }
  return {h,l,c};                          // c — насыщенность «по-честному» (хрома), 0..1
}
const HSL_CACHE={};
function colOf(id){
  if(!HSL_CACHE[id]){const c=(COLOR[id]||[])[0]; HSL_CACHE[id]=c?hexHsl(c):{h:0,l:.85,c:0};}
  return HSL_CACHE[id];
}
/* нейтральные: молочный, белый, серый, бежевый — и из тёмных только тёмно-синий и графит
   (тёмно-бордовый, шоколадный — уже цвет) */
function isNeutral(x){ return x.c<.13 || x.l>.9 || (x.l<.3&&x.c<.35&&(x.c<.15||(x.h>=190&&x.h<=250))); }
/* розовый — светлый и пыльно-розовый (и розоватая «карамель»).
   Не розовый: бордовый и тёмно-малиновый (тёмные), фиолетовый, терракота и рыжий — их мальчику можно */
function isPinkC(x){ return x.c>=.1&&x.l>=.5&&(x.h>=320||(x.h<=16&&x.c<=.35)); }
function isBlueC(x){ return x.c>=.1&&x.h>=185&&x.h<=250&&x.l>=.3; }
const PINK_CACHE={};
function pinkish(id){ if(!(id in PINK_CACHE))PINK_CACHE[id]=(COLOR[id]||[]).some(c=>isPinkC(hexHsl(c))); return PINK_CACHE[id]; }
function hueDist(a,b){ const d=Math.abs(a-b)%360; return d>180?360-d:d; }
/* насколько вещь «весит» в образе: верх и основная одежда — главное, аксессуары и игрушка — акцент */
const LOOKW={ovWinter:1.3,ovDemi:1.3,ovFleece:1.2,jacket:1.2,vest:1,hat:.6,hatWarm:.6,panama:.6,socks:.5,mittens:.5,
  muslin:.5,blanket:.5,toy:.3};
const lookW=k=>LOOKW[k]||1;

function lookScore(ids,keys){
  const it=ids.map((id,i)=>Object.assign({w:lookW(keys[i])},colOf(id)));
  const chrom=it.filter(x=>!isNeutral(x));
  // нейтральная вещь — всегда спокойная база (60-30-10: основа образа — нейтральная)
  let s=it.filter(isNeutral).reduce((t,x)=>t+.5*x.w,0);
  // сколько разных акцентных оттенков (соседние в пределах 35° — один оттенок)
  const fam=[]; chrom.forEach(x=>{if(!fam.some(h=>hueDist(h,x.h)<=35))fam.push(x.h);});
  s-=Math.max(0,fam.length-2)*3;
  if(fam.length===1&&chrom.length<it.length)s+=.5;      // один акцент на нейтральной базе
  // пары акцентных цветов
  for(let i=0;i<chrom.length;i++)for(let j=i+1;j<chrom.length;j++){
    const a=chrom[i], b=chrom[j], w=a.w*b.w, d=hueDist(a.h,b.h);
    if(d<=35)s+=.6*w;                                     // тон в тон, соседние
    else if(d>=140)s+=(Math.min(a.c,b.c)<.35?.1:-1)*w;    // противоположные: можно, если приглушённые
    else s-=1.5*w*Math.min(1,a.c+b.c);                    // «через четверть круга» — спорят
    if(Math.abs(a.c-b.c)>.4)s-=.5*w;                      // яркое рядом с пастельным
  }
  // тёплые и холодные нейтральные вместе
  const warm=it.filter(x=>isNeutral(x)&&x.c>.04&&x.h>=15&&x.h<=60&&x.l>.45).length;
  const cool=it.filter(x=>isNeutral(x)&&x.c>.04&&x.h>=180&&x.h<=260&&x.l>.45).length;
  s-=.3*Math.min(warm,cool);
  // главная вещь (самая «весомая») нейтральная — база
  let top=it[0]; it.forEach(x=>{if(x.w>top.w)top=x;});
  if(isNeutral(top))s+=.8;
  // аксессуар перекликается по цвету с одеждой
  it.forEach(a=>{ if(a.w>=1||isNeutral(a))return;
    if(it.some(b=>b!==a&&b.w>=1&&!isNeutral(b)&&hueDist(a.h,b.h)<=25))s+=.6; });
  // девочке голубое можно отдельными вещами, но не весь образ: голубого не больше половины одежды
  if(S.gender==='girl'){ const cl=it.filter(x=>x.w>=1), all=cl.reduce((t,x)=>t+x.w,0);
    const blue=cl.filter(isBlueC).reduce((t,x)=>t+x.w,0); if(all&&blue/all>.5)s-=3; }
  // слишком много цвета в целом
  const loud=chrom.reduce((t,x)=>t+x.w*Math.min(1,x.c*2),0);
  if(loud>2.5)s-=(loud-2.5);
  return s;
}

/* картинки для образа: keys — виды вещей. Перебираем сочетания, берём лучшие и разные между собой;
   стрелки «другой образ» сначала листают наборы, потом — следующий удачный вариант картинок. */
const LOOK_CACHE={};
let LASTLOOK={};
function lookImgs(keys){
  const n=setsFor(bandFor(effTemp())).length||1, variant=Math.floor(S.setIdx/n);
  const ck=[keys.join(','),S.gender,Math.floor(ageMonthsExact())].join('|');
  if(!LOOK_CACHE[ck])LOOK_CACHE[ck]=bestLooks(keys);
  const looks=LOOK_CACHE[ck];
  const pick=looks.length?looks[variant%looks.length]:[];
  const out={}; keys.forEach((k,i)=>{out[k]=pick[i]?IMG[pick[i]]:pickImg(k);});
  return LASTLOOK=out;
}
function bestLooks(keys){
  let lists=keys.map(k=>{const l=candFor(k), daily=l.filter(id=>!FANCY[id]); return (daily.length?daily:l).slice(0,8);});
  if(lists.some(l=>!l.length))return [];
  // ограничиваем перебор: урезаем самые длинные списки
  const prod=()=>lists.reduce((p,l)=>p*l.length,1);
  while(prod()>20000){let mi=0;lists.forEach((l,i)=>{if(l.length>lists[mi].length)mi=i;});lists[mi]=lists[mi].slice(0,lists[mi].length-1);}
  const all=[]; const cur=[];
  (function walk(i){
    if(i===lists.length){all.push({ids:cur.slice(),s:lookScore(cur,keys)});return;}
    for(const id of lists[i]){cur[i]=id;walk(i+1);}
  })(0);
  all.sort((a,b)=>b.s-a.s);
  // 4 лучших, заметно отличающихся друг от друга (хотя бы половина вещей — другие)
  const need=Math.max(1,Math.ceil(keys.length/2)), picked=[];
  for(const c of all){
    if(picked.length>=4)break;
    if(picked.every(p=>p.ids.filter((id,i)=>id!==c.ids[i]).length>=need))picked.push(c);
  }
  for(const c of all){ if(picked.length>=4)break; if(!picked.includes(c))picked.push(c); }
  return picked.map(c=>c.ids);
}
