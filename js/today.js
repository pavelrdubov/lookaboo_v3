/* «Сегодня»: главный экран, слои, коллаж */
/* ================= главный экран ================= */
function bandFor(eff){for(const b of BANDS){if(eff<=b.max)return b;}return BANDS[BANDS.length-1];}
function setsFor(b){
  const m=ageMonths();
  const l=b.sets.filter(s=>(!s.only||s.only===S.gender)&&(!s.min||m>=s.min)&&(!s.max||m<=s.max));
  return l.length?l:b.sets.slice(0,1);
}
const CTX={
  stroller:{d:-3, why:'малыш лежит в коляске'},
  sling:   {d:+3, why:'в слинге малышу достаётся ваше тепло'},
  car:     {d:+6, why:'в машине малышу быстро становится жарко'}
};
/* коляска бывает разной: в люльке малыш лежит закрытый от ветра (капюшон, накидка), в прогулочной —
   сидит открыто, ветер достаёт до ног. По умолчанию: до 6 месяцев люлька, потом прогулочная; можно выбрать в профиле */
function strollerKind(){ const s=kid().stroller||'auto'; return s==='auto'?(ageMonths()<6?'cot':'seat'):s; }
function ctxNow(){
  if(S.ctx!=='stroller')return CTX[S.ctx];
  return strollerKind()==='cot'?{d:-2,why:'малыш лежит в люльке'}:{d:-4,why:'малыш сидит в прогулочной коляске'};
}
function setCtx(c){S.ctx=c;store.set('mpp-ctx',c);
  document.querySelectorAll('#ctxRow .c').forEach(b=>b.classList.toggle('on',b.dataset.c===c));
  S.setIdx=0;paintMain();}
function effTemp(){
  let e=(S.live?S.feels:S.temp);
  e+=ctxNow().d;
  if(S.weather==='sun')e+=2;
  if(S.weather==='rain')e-=1;
  return Math.round(e);
}

/* в машине объёмную верхнюю одежду не надеваем — салон тёплый, её везут отдельно и накрывают пледом */
/* в прогулочной коляске ветер достаёт до ног: в прохладу добавляем плед на ножки
   (потом — конверт или накидку, когда будут картинки) */
function legsFilter(items){
  if(S.ctx!=='stroller'||strollerKind()!=='seat'||effTemp()>6||items.some(x=>x[0]==='blanket'))return items;
  return items.concat([['blanket','плед на ножки']]);
}
/* вещи образа с поправками на то, где малыш: машина, прогулочная коляска */
function lookItems(it){ return oneCloth(legsFilter(carFilter(it))); }
/* пелёнка и плед вместе — две одинаковые «тряпочки» в образе: оставляем плед, вместо пелёнки — игрушка */
function oneCloth(items){
  if(!(items.some(x=>x[0]==='muslin')&&items.some(x=>x[0]==='blanket')))return items;
  const r=items.filter(x=>x[0]!=='muslin');
  if(!r.some(x=>x[0]==='toy'))r.push(['toy','игрушка']);
  return r;
}
function carFilter(items){
  if(S.ctx!=='car')return items;
  const OUT=['ovWinter','ovDemi','ovFleece','jacket'];
  let r=items.filter(x=>!OUT.includes(x[0]));
  if(!r.some(x=>x[0]==='blanket'))r.push(['blanket','плед']);
  if(!r.some(x=>!NOTLAYER.includes(x[0])))r.unshift(['bodyL','боди д/р']);
  return r;
}
/* время суток меняется — раз в 10 минут перерисовываем шапку, если экран открыт */
setInterval(()=>{if(S.screen==='main'&&document.visibilityState==='visible')paintMain();},600000);
function paintMain(){
  const sc=SCENES[S.weather]||SCENES.cloud, sky=skyFor(S.weather);
  document.getElementById('wband').style.background=sky.grad;
  document.getElementById('bband').style.background=sc.band;
  document.getElementById('wart').innerHTML=sceneArt(S.weather,sky.ph,seasonNow());

  const m=ageMonths(), sz=sizeFor(heightNow()), k=kid();
  /* аватарка и имя в углу */
  const av=document.getElementById('mav');
  av.className='av'+(k.photo||kidName(k)?'':' none');
  av.innerHTML = k.photo ? `<img src="${k.photo}" alt="">` : (kidName(k)?kidLabel(k)[0].toUpperCase():'');
  document.getElementById('mchipT').textContent=(kidName(k)?kidName(k)+' · ':'')+`${m} мес · ${sz}`;

  const tT=document.getElementById('tTemp'), tF=document.getElementById('tFeels');
  document.getElementById('tPlace').textContent=S.city||'город не выбран';
  const wind=S.wind>=5?` · ветер ${S.wind} м/с`:'';
  if(S.wx==='live'){
    tT.textContent=(S.temp>0?'+':'')+S.temp+'°';
    tF.textContent=sc.word+wind;
  }else if(S.wx==='loading'){
    tT.textContent='…'; tF.textContent='ищем погоду';
  }else if(S.wx==='manual'){
    tT.textContent=(S.temp>0?'+':'')+S.temp+'°';
    tF.textContent=sc.word+' · вручную';
  }else{
    tT.textContent='—'; tF.textContent='погода не загрузилась';
  }
  if(S.screen==='main')setTheme(themeFor('main'));

  /* объяснение с причиной: почему малышу там ощущается иначе */
  const ef0=effTemp();
  const why=personize(ctxNow().why);
  const named=!!kidName(kid());                       // без имени «малыш … для неё» звучит странно
  const pron=!named?'это как':S.gender==='girl'?'для неё это как':S.gender==='boy'?'для него это как':'это как';
  // погода («облачно») уже написана рядом с температурой — здесь только про малыша
  const whyFull=`${why.charAt(0).toUpperCase()+why.slice(1)} — ${pron} ${ef0>0?'+':''}${ef0}°`;
  const tw=document.getElementById('tWhy');
  if(S.wx==='live'||S.wx==='manual'){tw.textContent=whyFull;}
  else if(S.wx==='loading'){tw.textContent='секунду…';}
  else{tw.innerHTML=(S.wxErr||'Не получилось взять погоду автоматически')+'. <u>Указать вручную</u>';}
  /* подробное объяснение живёт в карточке для бабушки */
  const full=[];
  if(S.wind>=5)full.push(`ветер ${S.wind} м/с`);
  if(S.weather==='rain')full.push('дождь');
  if(S.weather==='sun')full.push('на солнце теплее');
  full.push(personize(ctxNow().why));
  S.whyText=`${full.join(' · ')} — для ${babyCases().gen} это как ${ef0>0?'+':''}${ef0}°`;
  document.querySelectorAll('#ctxRow .c').forEach(b=>b.classList.toggle('on',b.dataset.c===S.ctx));

  const b=bandFor(effTemp());
  const list=setsFor(b);
  const set0=list[S.setIdx%list.length];
  const set={name:set0.name, it:lookItems(set0.it)};   // машина — без объёмного комбинезона, прогулочная — плед на ножки
  const nl=set.it.filter(x=>!NOTLAYER.includes(x[0])).length;
  document.getElementById('tLayers').textContent=`${nl} ${nl===1?'слой':(nl<5?'слоя':'слоёв')}`;
  document.getElementById('bTitle').textContent=b.title;
  document.getElementById('bName').textContent=personize(set.name);
  const ins=insFor(effTemp());
  document.getElementById('items').textContent=
    set.it.map(([k,l])=>l+(INSKEYS.includes(k)?' '+ins.g:'')).join(' · ');
  const ef=effTemp();
  let tipTxt=(ef<=-8||ef>=22)?b.tip:(WTIPS[S.weather]||b.tip);
  const insN=insFor(ef).note;
  if(insN&&set.it.some(x=>INSKEYS.includes(x[0])))tipTxt=insN;
  if(S.ctx==='car')tipTxt='Объёмный комбинезон в машину не надевают: под ремнями он сминается, и они не затянутся плотно. В салоне тепло — тонкие слои, ремни впритык. Согреть можно пледом поверх пристёгнутых ремней (не под спину и не за лямки) — и не закрывая лицо.';
  if(S.ctx==='stroller'&&strollerKind()==='seat'&&ef<=6)tipTxt='В прогулочной коляске ветер достаёт до ног — укройте ножки пледом или накидкой, даже если комбинезон тёплый.';
  if(S.ctx==='sling')tipTxt='В слинге малыша греет ваше тело — проверяйте шею сзади, чтобы он не перегрелся под курткой.';
  tipTxt=personize(tipTxt);
  S.tipText=tipTxt;
  const tpEl=document.getElementById('tipText'); if(tpEl)tpEl.textContent=tipTxt;

  /* сколько всего образов: наборы × удачные сочетания картинок к каждому */
  const tot=list.length*LOOK_VARIANTS, cur=S.setIdx%tot;
  const dots=document.getElementById('setDots');
  dots.innerHTML=tot<=8?Array.from({length:tot},(_,i)=>`<i class="${i===cur?'a':''}"></i>`).join('')
    :`<span class="cnt">${cur+1} / ${tot}</span>`;
  drawStage(set,sz);
}

function dayWish(key,label,quiet){
  if(SWIPED)return;                       // это был свайп, а не тап по вещи
  const sz=sizeFor(heightNow());
  const added=wishToggle('day:'+key,{label:label,size:sizeForItem(key,ageMonths(),sz),
    src:'На каждый день',img:LASTLOOK[key]||pickImg(key),key:key});
  if(!quiet)toast(added?`«${label}» — в вишлисте`:`«${label}» убрали из вишлиста`);
  paintMain();
}
function flip(d){
  const p=document.getElementById('tipPop');if(p)p.classList.remove('on');
  const tb=document.getElementById('tipBtn');if(tb)tb.classList.remove('act');
  // стрелки листают и наборы, и другие сочетания картинок (см. lookImgs)
  const n=setsFor(bandFor(effTemp())).length*LOOK_VARIANTS;
  S.setIdx=(S.setIdx+d+n)%n;
  paintMain();
}

/* ---- журнальная раскладка коллажа ----
   не сетка и не список: вещи разного размера, с наложением и лёгким наклоном.
   Координаты — доли арки, размеры — доли базового модуля, поэтому композиция
   одинаково собирается и на коротком экране, и на длинном.
   Порядок слотов: от крупного к мелкому, поэтому одежда всегда крупнее аксессуаров. */
/* Журнальная раскладка: вещи накладываются друг на друга, размеры сильно разные,
   движение по диагонали. Нижний левый угол всегда свободен — там подпись.
   z-порядок: плоское (муслин, плед) уходит вниз, аксессуары ложатся сверху. */
/* НЕСКОЛЬКО шаблонов на каждое количество — чередуем по набору и дню,
   чтобы не было ощущения копипейста. Нахлёст небольшой, только лёгкий перекрёст. */
const MAGV={
 2:[
   /* рядом */
   [{x:.40,y:.52,w:.56,h:.66,r:-4,z:6,cap:1},{x:.66,y:.44,w:.48,h:.56,r:7,z:5}],
   /* диагональ */
   [{x:.38,y:.44,w:.54,h:.64,r:-4,z:6,cap:1},{x:.64,y:.64,w:.46,h:.54,r:6,z:5}],
   /* крупно + мелко справа */
   [{x:.44,y:.50,w:.58,h:.68,r:-3,z:6,cap:1},{x:.71,y:.66,w:.36,h:.40,r:8,z:5}],
   /* крупно + мелко слева (зеркальный) */
   [{x:.56,y:.50,w:.58,h:.68,r:3,z:6,cap:1},{x:.29,y:.66,w:.36,h:.40,r:-8,z:5}]
 ],
 3:[
   /* дуга3 */
   [{x:.34,y:.52,w:.48,h:.56,r:-5,z:6,cap:1},{x:.62,y:.42,w:.44,h:.50,r:8,z:5},{x:.72,y:.72,w:.32,h:.30,r:-4,z:4}],
   /* слева + столбик */
   [{x:.35,y:.50,w:.50,h:.60,r:-3,z:6,cap:1},{x:.70,y:.36,w:.42,h:.48,r:5,z:5},{x:.72,y:.68,w:.34,h:.32,r:-5,z:4}],
   /* справа + столбик (зеркальный) */
   [{x:.65,y:.50,w:.50,h:.60,r:3,z:6,cap:1},{x:.30,y:.36,w:.42,h:.48,r:-5,z:5},{x:.28,y:.68,w:.34,h:.32,r:5,z:4}],
   /* строка3 */
   [{x:.24,y:.50,w:.46,h:.56,r:-3,z:6,cap:1},{x:.54,y:.46,w:.42,h:.48,r:5,z:5},{x:.80,y:.54,w:.34,h:.36,r:-4,z:4}]
 ],
 4:[
   /* Дуга */
   [{x:.34,y:.52,w:.48,h:.56,r:-5,z:6,cap:1},{x:.63,y:.42,w:.42,h:.48,r:8,z:4},{x:.78,y:.73,w:.32,h:.28,r:-4,z:5},{x:.47,y:.80,w:.26,h:.28,r:6,z:5}],
   /* Сетка 2×2 */
   [{x:.33,y:.40,w:.44,h:.52,r:-3,z:6,cap:1},{x:.68,y:.37,w:.42,h:.50,r:4,z:4},{x:.33,y:.73,w:.34,h:.30,r:-4,z:5},{x:.69,y:.75,w:.28,h:.30,r:5,z:5}],
   /* Слева крупно */
   [{x:.33,y:.50,w:.50,h:.62,r:-3,z:6,cap:1},{x:.72,y:.30,w:.40,h:.46,r:5,z:4},{x:.74,y:.62,w:.32,h:.28,r:-5,z:5},{x:.71,y:.85,w:.24,h:.26,r:6,z:5}],
   /* Справа крупно */
   [{x:.66,y:.50,w:.50,h:.62,r:3,z:6,cap:1},{x:.28,y:.30,w:.40,h:.46,r:-5,z:4},{x:.26,y:.63,w:.32,h:.28,r:5,z:5},{x:.30,y:.86,w:.24,h:.26,r:-6,z:5}],
   /* Уголок */
   [{x:.35,y:.44,w:.50,h:.60,r:-4,z:6,cap:1},{x:.70,y:.41,w:.40,h:.46,r:7,z:4},{x:.66,y:.72,w:.30,h:.28,r:-5,z:5},{x:.87,y:.69,w:.22,h:.24,r:6,z:5}]
 ],
 5:[
   /* сетка5 */
   [{x:.44,y:.46,w:.46,h:.54,r:-3,z:6,cap:1},{x:.24,y:.30,w:.34,h:.40,r:-7,z:4},{x:.72,y:.30,w:.36,h:.42,r:7,z:5},{x:.24,y:.70,w:.30,h:.32,r:6,z:4},{x:.74,y:.70,w:.30,h:.32,r:-6,z:5}],
   /* пирамида5 */
   [{x:.44,y:.60,w:.46,h:.52,r:-3,z:6,cap:1},{x:.24,y:.36,w:.34,h:.40,r:-7,z:4},{x:.50,y:.26,w:.34,h:.40,r:4,z:5},{x:.76,y:.36,w:.32,h:.38,r:7,z:4},{x:.72,y:.68,w:.28,h:.30,r:-5,z:5}],
   /* слева + веер */
   [{x:.30,y:.52,w:.46,h:.56,r:-4,z:6,cap:1},{x:.62,y:.28,w:.38,h:.44,r:5,z:5},{x:.80,y:.46,w:.32,h:.38,r:-3,z:4},{x:.66,y:.66,w:.30,h:.32,r:7,z:5},{x:.84,y:.78,w:.24,h:.26,r:-5,z:4}],
   /* справа + веер (зеркальный) */
   [{x:.70,y:.52,w:.46,h:.56,r:4,z:6,cap:1},{x:.38,y:.28,w:.38,h:.44,r:-5,z:5},{x:.20,y:.46,w:.32,h:.38,r:3,z:4},{x:.34,y:.66,w:.30,h:.32,r:-7,z:5},{x:.16,y:.78,w:.24,h:.26,r:5,z:4}],
   /* дуга5 — 3 сверху дугой, 2 снизу */
   [{x:.32,y:.64,w:.44,h:.52,r:-4,z:6,cap:1},{x:.22,y:.34,w:.34,h:.40,r:-7,z:4},{x:.50,y:.27,w:.36,h:.42,r:1,z:5},{x:.78,y:.34,w:.34,h:.40,r:7,z:4},{x:.66,y:.68,w:.34,h:.38,r:5,z:5}]
 ],
 6:[
   /* сетка6 */
   [{x:.40,y:.44,w:.42,h:.50,r:-3,z:6,cap:1},{x:.22,y:.30,w:.32,h:.38,r:-7,z:4},{x:.70,y:.28,w:.34,h:.40,r:7,z:5},{x:.74,y:.60,w:.30,h:.34,r:-5,z:4},{x:.24,y:.66,w:.28,h:.30,r:6,z:5},{x:.50,y:.80,w:.26,h:.28,r:-6,z:4}],
   /* пирамида6 (ряды 1-2-3) */
   [{x:.50,y:.72,w:.38,h:.44,r:-3,z:6,cap:1},{x:.29,y:.51,w:.32,h:.38,r:-5,z:5},{x:.71,y:.51,w:.32,h:.38,r:5,z:5},{x:.22,y:.30,w:.30,h:.36,r:-7,z:4},{x:.50,y:.26,w:.30,h:.36,r:2,z:4},{x:.78,y:.30,w:.30,h:.36,r:7,z:4}],
   /* россыпь */
   [{x:.30,y:.64,w:.40,h:.46,r:-3,z:6,cap:1},{x:.24,y:.33,w:.30,h:.36,r:-6,z:4},{x:.51,y:.27,w:.30,h:.36,r:0,z:5},{x:.77,y:.34,w:.30,h:.36,r:6,z:4},{x:.63,y:.62,w:.28,h:.32,r:4,z:5},{x:.86,y:.67,w:.24,h:.26,r:-5,z:4}],
   /* дуга6 — 4 сверху дугой, 2 снизу */
   [{x:.32,y:.66,w:.42,h:.50,r:-4,z:6,cap:1},{x:.18,y:.36,w:.32,h:.38,r:-7,z:4},{x:.40,y:.27,w:.34,h:.40,r:-2,z:5},{x:.62,y:.27,w:.34,h:.40,r:3,z:4},{x:.84,y:.38,w:.32,h:.38,r:7,z:5},{x:.66,y:.70,w:.34,h:.38,r:5,z:4}]
 ]
};
const FLAT=['muslin','blanket','wrap','wrapbody'];      // плоское кладём под низ стопки
function stageBox(){
  const st=document.getElementById('stage');
  return {w:st.clientWidth||362, h:st.clientHeight||300};
}
function drawStage(set,sz){
  const st=document.getElementById('stage');
  const B=stageBox();

  let items=set.it.slice();
  /* одну вещь никогда не показываем в одиночку — добавляем аксессуар или игрушку по контексту */
  if(items.length<2){
    const hot=effTemp()>=22;
    let fill = S.ctx==='car' ? ['toy','грызунок']       // в машине чепчик не нужен
             : hot ? ['panama','панамка']                // жаркое лето на улице — от солнца
             : ['toy','грызунок'];
    if(items.some(x=>x[0]===fill[0]))fill=swaddleFor(effTemp());
    items.push(fill);
  }

  const heroes=items.filter(x=>!NOTLAYER.includes(x[0]));
  const acc   =items.filter(x=>NOTLAYER.includes(x[0]));
  let list0=heroes.concat(acc).slice(0,6);
  if(!heroes.length)list0=items.slice(0,6);

  const {list,LOOK}=lookWithImgs(list0);       // картинки подобраны по сочетанию цветов
  const SHADOW='drop-shadow(6px 12px 15px rgba(90,74,58,.26))';
  const noteFs=Math.max(19,Math.min(24,Math.min(B.w,B.h)*0.072));
  /* раскладка по правилам (js/layout.js); по бокам место под стрелки */
  const SIDE=18, ARCH={r:140,ox:SIDE,oy:0};
  const NOTES=pickNotes(list,effTemp(),S.setIdx).map(n=>Object.assign({fs:n.style==='fact'?noteFs*.86:noteFs},n));
  const rects=layoutLook(list.map(x=>({key:x[0],src:LOOK[x[0]]})),B.w-2*SIDE,B.h-14,(S.setIdx||0)+new Date().getDate(),NOTES,ARCH);
  let html='';
  rects.forEach(r=>{
    const key=r.key, label=(list.find(x=>x[0]===key)||[key,key])[1];
    const inW=!!WISH['day:'+key];
    const lack=wdHave(key,sz)===0;             // мама отметила, что такого нет
    const tap=`onclick="dayWish('${key}','${String(label).replace(/'/g,'')}')"`;
    html+=`<div class="gitem" ${tap} style="left:${Math.round(SIDE+r.left)}px;top:${Math.round(r.top)}px;`
      +`width:${Math.round(r.iw)}px;height:${Math.round(r.ih)}px;transform-origin:${Math.round(r.ox)}px ${Math.round(r.oy)}px;`
      +`transform:rotate(${r.rot}deg);z-index:${r.z}">`
      +`<img src="${r.src}" alt="" style="width:100%;height:100%;max-width:none;max-height:none;filter:${SHADOW}${lack?';opacity:.5':''}">`
      +`${lack?`<div class="gap">нет в ${sz}</div>`:''}${inW?'<div class="heart">♥</div>':''}</div>`;
  });
  /* пометки-выноски: только то, чего не видно на картинке (js/layout.js) */
  const notes=rects.notes||[];
  if(notes.length){
    html+=`<svg class="gnotes" width="${B.w}" height="${B.h}" viewBox="0 0 ${B.w} ${B.h}">`
      +notes.map(n=>{ const a=noteArrow(n,SIDE);
        return `<path class="ln" d="${a.curve}"></path><path class="hd" d="${a.head}"></path>`; }).join('')
      +`</svg>`
      +notes.map(n=>`<div class="gnote" style="left:${Math.round(SIDE+n.x)}px;top:${Math.round(n.y)}px;width:${Math.round(n.w)}px;font-size:${n.fs.toFixed(1)}px">${n.text}</div>`).join('');
  }
  if(!rects.length)html='<div class="gempty">Картинки к этому образу скоро добавим</div>';
  st.innerHTML=html;
}


/* картинка в шапке: погода × время суток (рассвет, день, закат, ночь) × сезонные детали
   (осенью листья, зимой снежинки и сугроб, весной цветы, летом ромашки). Детали чуть меняются по дням */
function sceneArt(w,ph,season){
  ph=ph||'day';
  const night=ph==='night', low=ph==='dawn'||ph==='dusk';
  const svg='<svg width="390" height="244" viewBox="0 0 390 244" fill="none" style="position:absolute;left:0;top:0">';
  const day0=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,1))/864e5);
  const rnd=k=>{const x=Math.sin((day0+1)*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};   // своё на каждый день
  const cA=night?'#6C789F':(ph==='dawn'?'#FCE7DC':(ph==='dusk'?'#F7D3C4':'#EDF1F3'));
  const cB=night?'#7D88AD':(low?'#FFF1EA':'#fff');
  const clouds=(op)=>`<path d="M250 76a28 28 0 0 1 0-56 34 34 0 0 1 62 9 24 24 0 0 1 15 47z" fill="${cA}" opacity="${op||1}"></path><path d="M312 96a22 22 0 0 1 0-44 26 26 0 0 1 48 7 19 19 0 0 1 11 37z" fill="${cB}" opacity="${(op||1)*.88}"></path>`;
  const stars=n=>{let o='<g fill="#fff">';for(let k=0;k<n;k++)o+=`<circle cx="${(170+rnd(k)*210).toFixed(0)}" cy="${(14+rnd(k+40)*150).toFixed(0)}" r="${(1.4+rnd(k+80)*1.6).toFixed(1)}" opacity="${(.5+rnd(k+90)*.45).toFixed(2)}"></circle>`;return o+'</g>';};
  const moon='<mask id="mn"><rect width="390" height="244" fill="#fff"></rect><circle cx="288" cy="54" r="26" fill="#000"></circle></mask><circle cx="300" cy="62" r="29" fill="#F3D891" mask="url(#mn)"></circle>';
  const lowSun=c=>`<circle cx="300" cy="206" r="66" fill="${c}" opacity=".22"></circle><circle cx="300" cy="206" r="40" fill="${c}"></circle>`;
  const sunC=ph==='dawn'?'#F9C98E':'#F5A472';
  let a='';

  // небо и погода
  if(w==='rain'||w==='snow'){
    a+=clouds();
    if(w==='rain')a+=`<g stroke="${night?'#A9BBD6':'#E9EEF1'}" stroke-width="3" stroke-linecap="round" opacity=".76"><path d="M262 98l-9 26M286 106l-9 26M310 116l-9 26M334 102l-9 26M358 118l-9 26M274 144l-7 18M322 156l-7 18M350 164l-7 18"></path></g>`;
    else a+='<g fill="#fff" opacity=".92"><circle cx="266" cy="112" r="4"></circle><circle cx="300" cy="140" r="3.4"></circle><circle cx="338" cy="118" r="4.4"></circle><circle cx="356" cy="156" r="3.2"></circle><circle cx="242" cy="152" r="3.6"></circle><circle cx="286" cy="182" r="4"></circle><circle cx="322" cy="196" r="3"></circle><circle cx="204" cy="132" r="3"></circle><circle cx="180" cy="176" r="3.6"></circle><circle cx="252" cy="212" r="3.2"></circle></g>';
  }else if(night){
    a+=stars(w==='cloud'?7:13)+moon;
    if(w==='cloud')a+='<path d="M214 118a22 22 0 0 1 0-44 27 27 0 0 1 49 7 18 18 0 0 1 12 37z" fill="#6C789F" opacity=".85"></path><path d="M318 128a20 20 0 0 1 0-40 24 24 0 0 1 44 6 16 16 0 0 1 11 34z" fill="#7D88AD" opacity=".75"></path>';
  }else if(low){
    a+=lowSun(sunC);
    if(w==='cloud')a+=`<path d="M300 60a26 26 0 0 1 0-52 31 31 0 0 1 57 8 22 22 0 0 1 14 44z" fill="${cB}" opacity=".9"></path><path d="M214 110a22 22 0 0 1 0-44 27 27 0 0 1 49 7 18 18 0 0 1 12 37z" fill="${cA}" opacity=".85"></path>`;
    else a+=`<path d="M190 120a20 20 0 0 1 0-40 25 25 0 0 1 45 6 17 17 0 0 1 11 34z" fill="${cB}" opacity=".7"></path>`;
  }else if(w==='sun'){
    a+='<g stroke="#F2A03C" stroke-width="5" stroke-linecap="round"><path d="M300 14v18M300 128v18M240 80h18M342 80h18M258 38l12 12M330 110l12 12M342 38l-12 12M270 110l-12 12"></path></g>'
      +'<circle cx="300" cy="80" r="36" fill="#F2A03C"></circle>'
      +'<path d="M150 170a22 22 0 0 1 0-44 27 27 0 0 1 49 7 18 18 0 0 1 12 37z" fill="#fff" opacity=".92"></path>';
  }else if(w==='frost'){                     // ясный мороз днём — бледное зимнее солнце
    a+='<g stroke="#F6DFA4" stroke-width="4" stroke-linecap="round" opacity=".8"><path d="M300 24v12M300 120v12M246 78h12M342 78h12M262 40l8 8M330 108l8 8M338 40l-8 8M270 108l-8 8"></path></g>'
      +'<circle cx="300" cy="78" r="30" fill="#F6DFA4"></circle>';
  }else{
    a+='<path d="M300 60a26 26 0 0 1 0-52 31 31 0 0 1 57 8 22 22 0 0 1 14 44z" fill="#fff" opacity=".9"></path>'
      +'<path d="M214 110a22 22 0 0 1 0-44 27 27 0 0 1 49 7 18 18 0 0 1 12 37z" fill="#fff" opacity=".7"></path>'
      +'<g stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"><path d="M176 156c24-11 48 7 72-3M206 182c22-10 44 6 66-3"></path></g>';
  }

  // сезонные детали: по краям, чтобы не мешать тексту
  const dim=night?.55:1;
  const hill=c=>`<path d="M0 244c0-26 18-44 40-44-10 16-4 32 10 44z" fill="${c}" opacity="${.6*dim}"></path>`;
  const spots=[[208,36],[352,134],[238,176],[334,200],[186,104],[372,62]];
  const pick=n=>{const o=[];for(let k=0;k<spots.length&&o.length<n;k++){const q=spots[(k+day0)%spots.length];o.push([q[0]+(rnd(k+5)-.5)*16,q[1]+(rnd(k+15)-.5)*16,(rnd(k+25)-.5)*140]);}return o;};
  if(season==='autumn'){
    a+=hill('#D9A25B');
    if(w!=='snow'){const L=['#D9813E','#C4613C','#E2A846','#B5562F'];
      pick(3+Math.floor(rnd(1)*2)).forEach(([x,y,r],k)=>{a+=`<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${r.toFixed(0)})" opacity="${.92*dim}"><path d="M0 -10C7 -6 8 4 0 10C-8 4 -7 -6 0 -10z" fill="${L[(k+day0)%L.length]}"></path><path d="M0 -8V12" stroke="#8C4426" stroke-width="1.3" stroke-linecap="round" opacity=".6"></path></g>`;});}
  }else if(season==='winter'){
    a+=`<path d="M0 244c30-40 62-40 92 0z" fill="#EEF1FA" opacity="${.5*dim}"></path>`;
    if(w!=='snow')pick(3+Math.floor(rnd(2)*2)).forEach(([x,y,r])=>{a+=`<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${r.toFixed(0)})" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="${.8*dim}"><path d="M0 -7V7M-6 -3.5L6 3.5M-6 3.5L6 -3.5"></path></g>`;});
  }else if(season==='spring'){
    a+=hill('#B9CBA8');
    const fl=(x,y,c,k)=>`<g transform="translate(${x} ${y}) scale(${k})" opacity="${dim}">${[0,72,144,216,288].map(d=>`<circle cx="${(4*Math.cos(d*Math.PI/180)).toFixed(1)}" cy="${(4*Math.sin(d*Math.PI/180)).toFixed(1)}" r="3.3" fill="${c}"></circle>`).join('')}<circle r="2.2" fill="#F2C14E"></circle></g>`;
    a+=fl(16,222,'#F4B6C2',1)+fl(34,232,'#FFF4F6',.85)+fl(56,238,'#F4B6C2',.75);
    if(w!=='rain'&&w!=='snow')pick(2).forEach(([x,y,r])=>{a+=`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="4.5" ry="2.6" transform="rotate(${r.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="#F7C5CF" opacity="${.85*dim}"></ellipse>`;});
  }else{                                       // лето — ромашки на пригорке
    a+=hill('#A9C98F');
    const dz=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})" opacity="${dim}">${[0,45,90,135,180,225,270,315].map(d=>`<ellipse cx="${(4.6*Math.cos(d*Math.PI/180)).toFixed(1)}" cy="${(4.6*Math.sin(d*Math.PI/180)).toFixed(1)}" rx="2.6" ry="1.5" transform="rotate(${d} ${(4.6*Math.cos(d*Math.PI/180)).toFixed(1)} ${(4.6*Math.sin(d*Math.PI/180)).toFixed(1)})" fill="#fff"></ellipse>`).join('')}<circle r="2.2" fill="#F2B33C"></circle></g>`;
    a+=dz(18,224,1)+dz(40,234,.8);
  }
  return svg+a+'</svg>';
}
