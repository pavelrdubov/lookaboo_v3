/* план: события, календарь, карточка события */
/* ================= ТАЙМЛАЙН ================= */
const MONF=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function fmtF(d){const x=new Date(d);return x.getDate()+' '+MONF[x.getMonth()];}
function dISO(y,m,day){return y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');}
function locISO(dt){return dISO(dt.getFullYear(),dt.getMonth(),dt.getDate());}
function monthsUntil(dateStr){return (new Date(dateStr)-new Date(S.dob))/MS/MDAYS;}
function sizeOn(dateStr){return sizeFor(heightAt(Math.max(0,monthsUntil(dateStr))));}
function inFuture(d){return new Date(d)>=new Date(todayStr());}

const SEASONS=[
  {m:9, d:15, mid:[0,15], midY:1, name:'Готовность к зиме',  need:['зимний комбинезон 250–300 г','тёплая шапка','варежки','шерстяное боди','тёплые носки'],
   keys:[['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки'],['bodyL','шерстяное боди'],['socks','тёплые носки']],
   why:'Зимние вещи разбирают к ноябрю, а в октябре ещё есть выбор и скидки. Смотрите не только на размер, но и на граммы утеплителя.'},
  {m:2, d:1,  mid:[3,15], midY:0, name:'Готовность к весне', need:['демисезонный комбинезон 100–150 г','непромокаемые штаны','флисовая кофта','тонкая шапка'],
   keys:[['ovDemi','демисезонный комбинезон'],['pants','непромокаемые штаны'],['ovFleece','флисовый комбинезон'],['hat','тонкая шапка']],
   why:'Весной главное не тепло, а то, что всё мокрое: лужи, мокрый снег, грязь.'},
  {m:4, d:1,  mid:[6,15], midY:0, name:'Готовность к лету',  need:['боди к/р','панамка','муслиновая пелёнка','лёгкие штанишки'],
   keys:[['bodyS','боди к/р'],['panama','панамка'],['muslin','муслиновая пелёнка'],['shorts','лёгкие шорты']],
   why:'До полугода крем от солнца не нужен — защищают тень и ткань; с полугода — детский SPF 50+ с минеральным фильтром.'},
  {m:7, d:10, mid:[9,5],  midY:0, name:'Готовность к осени', need:['флисовый комбинезон','демисезонный 100–150 г','боди д/р','дождевик на коляску'],
   keys:[['ovFleece','флисовый комбинезон'],['ovDemi','демисезонный'],['bodyL','боди д/р'],['blanket','плед']],
   why:'В сентябре разница между утром и днём доходит до десяти градусов.'}
];
const HOLIDAYS=[
  {m:9, d:31,name:'Хэллоуин',     need:['костюм'], themed:d=>halloweenItems(d), why:'Тыква, тигрёнок или привидение — костюм надевают поверх одежды, так что берите на размер больше: и наденется легко, и на фото не тесно.'},
  {m:11,d:31,name:'Новый год',    need:['новогодний образ'], themed:d=>newyearItems(d), why:'Фотографий будет много — нарядное стоит заказать за пару недель: к концу декабря нужных размеров уже нет.'},
  {m:1, d:23, name:'23 февраля',  need:['нарядный комплект'], fancy:1, why:'Повод для фотографий с папой — и для нарядного, которое потом пойдёт в садик.'},
  {m:2, d:8,  name:'8 марта',     need:['нарядный комплект'], fancy:1, why:'Весенний праздник — нарядное пригодится и на майские.'}
];
/* домашний гардероб — то, что заканчивается первым при смене размера */
const HOMEKIT=[['bodyL','боди д/р'],['bodyS','боди к/р'],['slip','слип'],['footpants','ползунки'],['socks','носки'],['hat','шапочка']];
/* нарядное, «официальное» — к праздникам, дню рождения и фото по месяцам (вместе с костюмами).
   Девочкам — платья, боди и песочники с рюшами; мальчикам — рубашка, поло, жилет; всем — слипы с воротничком,
   брюки в клетку. Эти вещи носят и в обычные дни, поэтому в образах по погоде они остаются */
const DRESSY={8990:'нарядное боди-платье',8991:'платье с рюшами',8992:'платье с воротничком',8998:'сарафан в клетку',
  9091:'боди-платье с рюшами',9095:'боди-платье с рюшами',8993:'боди с рюшами',9096:'песочник с рюшами',9017:'песочник с воротничком',
  8996:'боди-рубашка',8984:'боди-поло',8987:'боди-поло',8988:'жилет к рубашке',8997:'брюки в клетку',
  8989:'слип с воротничком',9200:'слип с воротничком',9203:'слип с воротничком',9204:'слип с воротничком',9205:'слип с воротничком'};
function fancyItems(d,n){
  const g=S.gender, em=d?Math.max(0,monthsUntil(d)):ageMonthsExact();
  const num=id=>(id.match(/__(\d{4})(_|$)/)||[])[1];
  const NM={bodyL:'нарядное боди',bodyS:'нарядное боди',dress:'нарядное платье',romper:'нарядный песочник',pants:'нарядные штанишки'};
  let pool=Object.keys(IMG).filter(id=>(FANCY[id]||DRESSY[num(id)])&&okFor(id,g));
  const fit=pool.filter(id=>{const a=AGE[id];return !a||(em>=a[0]&&em<a[1]);}); if(fit.length)pool=fit;
  // своё для пола — вперёд; порядок сдвигается от даты, чтобы к разным праздникам были разные вещи
  const tag=g==='girl'?'g':(g==='boy'?'b':'_');
  pool.sort((a,b)=>(GT[b]===tag)-(GT[a]===tag)||a.localeCompare(b));
  const own=pool.filter(id=>GT[id]===tag), rest=pool.filter(id=>GT[id]!==tag);
  const sh=d?new Date(d).getMonth()+new Date(d).getDate():0, rot=L=>L.length?L.slice(sh%L.length).concat(L.slice(0,sh%L.length)):L;
  const out=rot(own).concat(rot(rest)).slice(0,n||4);
  // подпись — как у стилей фотосессии: что это за образ, а потом сама вещь
  return out.map(id=>[id,'праздничный наряд: '+(DRESSY[num(id)]||NM[(CAND_KINDS[id]||[]).find(k=>NM[k])]||'нарядный комплект')]);
}

/* фотосессии по месяцам и праздничные костюмы. В имени картинки — тема и месяцы года, когда её показывать:
   photo__g__0-6__9384_tulip_m3 — тюльпаны в марте. До 6 месяцев — боди и слипы, старше — костюм из кофты и штанишек.
   Девочкам — цветы, мальчикам — супергерои, фрукты — всем */
const THEME_RU={superman:'Супермен',batman:'Бэтмен',spiderman:'Человек-паук',flash:'Флэш',deadpool:'Дэдпул',hulk:'Халк',
  captain:'Капитан Америка',ironman:'Железный человек',wolverine:'Росомаха',panther:'Чёрная пантера',aquaman:'Аквамен',thor:'Тор',
  carrot:'морковка',watermelon:'арбуз',blueberry:'черника',tomato:'помидор',lemon:'лимон',orange:'апельсин',apple:'яблоко',
  pear:'груша',kiwi:'киви',banana:'банан',avocado:'авокадо',pomegranate:'гранат',
  lily:'ландыши',sakura:'сакура',lavender:'лаванда',forgetmenot:'незабудки',peony:'пионы',daisy:'ромашки',poppy:'маки',
  sunflower:'подсолнух',chrysanthemum:'хризантемы',tulip:'тюльпаны',alstroemeria:'альстромерия',aster:'астры',
  ghost:'привидение',skeleton:'скелетик',pumpkin:'тыква',tree:'ёлочка',snowman:'снеговик',reindeer:'оленёнок',santa:'Дед Мороз'};
function themeOf(id){ const cap=(id.split('__')[3]||'').split('_'); const t=cap.find(x=>THEME_RU[x]);
  return {name:t?THEME_RU[t]:'', months:(cap.join('_').match(/m\d{1,2}/g)||[]).map(x=>+x.slice(1))}; }
/* картинки вида kind к дате: по полу малыша, возрасту на эту дату и месяцу года */
function themedPick(kind,d,label,lim,only){
  const em=Math.max(0,monthsUntil(d)), mon=new Date(d).getMonth()+1, g=S.gender;
  const all=(CAND[kind]||[]).filter(n=>IMG[n]&&okFor(n,g)&&(!only||only(n)));
  const ageOk=n=>{const a=AGE[n];return !a||(em>=a[0]&&em<a[1]);};
  // насколько тема далека от этого месяца (0 — как раз её время)
  const md=n=>{const m=themeOf(n).months; if(!m.length)return 0; return Math.min(...m.map(x=>Math.min(Math.abs(x-mon),12-Math.abs(x-mon))));};
  let pool=all.filter(n=>md(n)===0);
  const fit=pool.filter(ageOk);
  if(fit.length>=3)pool=fit;
  else if(em<6){                                   // малышам — только боди и слипы: берём ближайшие по сезону темы своего возраста
    const near=all.filter(ageOk).sort((a,b)=>md(a)-md(b)).filter(n=>md(n)<=1);
    pool=fit.concat(near.filter(n=>!fit.includes(n)));
    if(!pool.length){const y=all.filter(ageOk); const best=Math.min(...y.map(md)); pool=y.filter(n=>md(n)===best);}   // ближайший сезон, но формат по возрасту
  }else pool=fit.concat(pool.filter(n=>!fit.includes(n)));   // постарше — тема месяца, даже если вещь «малышовая»
  if(!pool.length)pool=all;
  // своё для пола (цветы девочке, герои мальчику) — до 5, остальное — общее (фрукты, привидение)
  const tag=g==='girl'?'g':(g==='boy'?'b':'_');
  const own=pool.filter(n=>GT[n]===tag).slice(0,5), rest=pool.filter(n=>GT[n]!==tag);
  return own.concat(rest).slice(0,lim||8).map(n=>{const t=themeOf(n).name; return [n,label(t,n)];});
}
/* фотосессия: по одному варианту на стиль — цветы или супергерои (по полу) и фрукты.
   Какой именно костюм — меняется от месяца к месяцу */
const PHOTO_STYLE={flowers:['lily','sakura','lavender','forgetmenot','peony','daisy','poppy','sunflower','chrysanthemum','tulip','alstroemeria','aster'],
  heroes:['superman','batman','spiderman','flash','deadpool','hulk','captain','ironman','wolverine','panther','aquaman','thor'],
  fruits:['carrot','watermelon','blueberry','tomato','lemon','orange','apple','pear','kiwi','banana','avocado','pomegranate']};
const PHOTO_NAME={flowers:'цветы',heroes:'супергерои',fruits:'фрукты'};
function styleOf(id){const cap=(id.split('__')[3]||'').split('_'); return Object.keys(PHOTO_STYLE).find(st=>cap.some(c=>PHOTO_STYLE[st].includes(c)));}
function photoItems(d,mo,used){
  const order=S.gender==='girl'?['flowers','fruits']:(S.gender==='boy'?['heroes','fruits']:['fruits']);
  const out=[];
  order.forEach(st=>{ const L=themedPick('photo',d,t=>t,99,n=>styleOf(n)===st); if(!L.length)return;
    // каждый месяц — новый костюм: сначала те, что ещё не предлагали, по кругу от номера месяца
    const start=((mo||0)+new Date(d).getFullYear())%L.length, rot=L.slice(start).concat(L.slice(0,start));
    const [n,t]=rot.find(([id])=>!(used&&used.has(id)))||rot.find(([id])=>!(used&&used.last&&used.last.has(id)))||rot[0];
    if(used){used.add(n);}
    out.push([n,`в стиле «${PHOTO_NAME[st]}»: ${t}`]); });
  if(used)used.last=new Set(out.map(x=>x[0]));
  return out;
}
const halloweenItems=d=>themedPick('halloween',d,t=>t?`костюм: ${t}`:'костюм');
const newyearItems=d=>themedPick('newyear',d,t=>t?`«${t}»`:'новогодний образ',3).concat(fancyItems(d,3));

/* что покупать к зиме — зависит от того, насколько холодно в городе (разгар зимы, среднесуточная) */
function winterGear(t){
  if(t<=-15)return {grams:'от 300 г',keys:[['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки'],['bodyL','шерстяное боди'],['socks','тёплые носки']],
    note:`В разгар зимы у вас около ${t}° — нужен тёплый пуховый комбинезон и варежки.`};
  if(t<=-8)return {grams:'250–300 г',keys:[['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки'],['bodyL','шерстяное боди'],['socks','тёплые носки']],
    note:`Разгар зимы около ${t}° — зимний комбинезон 250–300 г и варежки.`};
  if(t<=-2)return {grams:'150–250 г',keys:[['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки'],['bodyL','шерстяное боди'],['socks','тёплые носки']],
    note:`Зима у вас мягкая, около ${t}° — хватит комбинезона 150–250 г.`};
  if(t<=4)return {grams:'100–150 г',keys:[['ovDemi','утеплённый комбинезон'],['hat','тёплая шапка'],['cardigan','вязаная кофта'],['bodyL','боди д/р'],['socks','тёплые носки']],
    note:`Зима тёплая, около +${t}° — пуховик не нужен, достаточно демисезонного 100–150 г.`};
  return {grams:'',keys:[['ovFleece','флисовый комбинезон'],['cardigan','вязаная кофта'],['hat','тонкая шапка'],['bodyL','боди д/р'],['socks','носки']],
    note:`Настоящей зимы у вас почти нет (около +${t}°) — хватит флиса и тёплой кофты.`};
}

function tlEvents(){
  const ev=[], today=new Date(todayStr()), horizon=new Date(today); horizon.setMonth(horizon.getMonth()+6);
  // поездки
  TRIPS.filter(t=>t.from&&inFuture(t.to||t.from)).forEach(t=>{
    const total=(()=>{try{return tripCount(t);}catch(e){return null;}})();
    ev.push({d:t.from,to:t.to,type:'trip',title:t.city,sub:`${fmtD(t.from)} — ${fmtD(t.to)} · размер ${sizeOn(t.from)}`,
      chips:Object.keys(t.wish||{}).length?['в вишлисте: '+Object.keys(t.wish).length]:[],id:t.id});
  });
  // смена размера
  let cur=sizeFor(heightNow());
  for(let k=1;k<=18*4;k++){
    const m=ageMonthsExact()+k/4;
    const sz=sizeFor(heightAt(m));
    if(sz!==cur){
      const dt=new Date(S.dob); dt.setDate(dt.getDate()+Math.round(m*MDAYS));
      if(dt>horizon)break;
      ev.push({d:locISO(dt),type:'size',title:'Размер '+sz,
        sub:`Малыш дорастёт примерно до ${Math.round(heightAt(m))} см — вещи ${cur} станут малы.`,chips:[],
        size:sz,items:HOMEKIT,
        why:`Верхняя одежда ещё поносится, а домашнее заканчивается первым: боди, слипы и ползунки малыш носит каждый день и перерастает их раньше всего. К этому времени берите ${sz}.`});
      cur=sz;
    }
  }
  // сезоны и праздники
  const y0=today.getFullYear();
  // сезоны: если подгрузили историю города — даты и экипировка по климату, иначе по фикс-датам
  SEASONS.forEach(x=>{
    const cs=climoSeason(x.name);
    if(cs){
      if(!inFuture(cs.card)||new Date(cs.card)>horizon)return;
      let keys=x.keys, need=x.need, why=x.why;
      if(x.name==='Готовность к зиме'){const g=winterGear(cs.peakT);keys=g.keys;
        need=g.keys.map(k=>k[1]+(k[0]==='ovWinter'&&g.grams?' '+g.grams:''));why=g.note+' '+x.why;}
      const sz=sizeOn(cs.peak);
      ev.push({d:cs.card,type:'season',title:x.name,szDate:cs.peak,onset:cs.onset,
        sub:`${why} Берите размер ${sz} — такой будет к середине сезона, а не сегодня.`,
        chips:need,size:sz,why:why,items:keys});
    }else{
      for(const y of [y0,y0+1]){
        const d=dISO(y,x.m,x.d);
        if(!inFuture(d)||new Date(d)>horizon)continue;
        const szDate=x.mid?dISO(y+x.midY,x.mid[0],x.mid[1]):d;
        const sz=sizeOn(szDate);
        ev.push({d,type:'season',title:x.name,szDate,
          sub:`${x.why} Берите размер ${sz} — такой будет к середине сезона, а не сегодня.`,
          chips:x.need,size:sz,why:x.why,items:x.keys||[]});
      }
    }
  });
  HOLIDAYS.forEach(x=>{
    for(const y of [y0,y0+1]){
      const d=dISO(y,x.m,x.d);
      if(!inFuture(d)||new Date(d)>horizon)continue;
      const sz=sizeOn(d);
      ev.push({d,type:'holiday',title:x.name,szDate:d,
        sub:x.why||`Размер к этому времени — ${sz}.`,chips:x.need,size:sz,why:x.why,
        items:x.themed?x.themed(d):(x.fancy?fancyItems(d,3):(x.keys||[])),fancy:!!(x.fancy||x.themed)});
    }
  });
  // день рождения
  const b=new Date(S.dob);
  for(const y of [y0,y0+1]){
    const d=dISO(y,b.getMonth(),b.getDate());
    if(!inFuture(d)||new Date(d)>horizon)continue;
    const age=Math.round(monthsUntil(d)/12);
    ev.push({d,type:'holiday',title:age<=1?'Первый день рождения':`День рождения · ${age} года`,
      sub:`Размер к празднику — ${sizeOn(d)}.`,chips:['нарядный комплект'],size:sizeOn(d),
      why:'Главный день года — и главные фотографии. Нарядное берите на размер, который будет к празднику, а не на сегодняшний.',
      items:fancyItems(d,3),fancy:true});
  }
  // «месяцики» первого года — повод для фотосессии
  const usedPhoto=new Set();
  for(let mo=1;mo<=11;mo++){
    // 30 апреля + 10 мес = 28 февраля, а не «30 февраля» → 2 марта: берём последний день месяца
    const b0=new Date(S.dob), y=b0.getFullYear(), m=b0.getMonth()+mo;
    const d=dISO(new Date(y,m,1).getFullYear(),new Date(y,m,1).getMonth(),Math.min(b0.getDate(),new Date(y,m+1,0).getDate()));
    if(!inFuture(d)||new Date(d)>horizon||monthsUntil(d)>12.5)continue;
    ev.push({d,type:'month',title:`${mo} ${monthsWord(mo)}`,
      sub:`Фотосессия «${mo} мес» — образ к размеру ${sizeOn(d)}.`,chips:['образ для фото'],size:sizeOn(d),
      why:'Фото по месяцам: два стиля на выбор — каждый месяц новый костюм. Девочкам — цветы этого времени года, мальчикам — супергерои, фрукты подойдут всем. До полугода — боди и слипы, потом — кофта со штанишками.',
      items:(()=>{const ph=photoItems(d,mo,usedPhoto); return ph.concat(fancyItems(d,3-ph.length));})(),fancy:true});
  }
  // свои события
  CUSTEV.forEach(c=>{
    if(!c.d||!inFuture(c.d)||new Date(c.d)>horizon)return;
    ev.push({d:c.d,type:'custom',custom:c.id,title:c.name,
      sub:`Размер к дате — ${sizeOn(c.d)}.`,chips:['нарядный комплект'],size:sizeOn(c.d),
      why:'Ваше событие — нарядное берите на размер, который будет к этой дате.',
      items:fancyItems(c.d,3),fancy:true});
  });
  return ev.filter(e=>!EVHIDE.includes(evKey(e))).sort((a,b)=>a.d<b.d?-1:1);
}
function tripCount(t){return Object.keys(t.done||{}).length;}

/* ---- карточка события: что именно покупать ---- */
const EVGRAD={size:'linear-gradient(168deg,#C4613C,#E8A87C)',season:'linear-gradient(168deg,#7A8C5A,#C3D3A6)',
  holiday:'linear-gradient(168deg,#8C6E9E,#D6BFDF)',trip:'linear-gradient(168deg,#6E8FA8,#B9CDD8)',
  month:'linear-gradient(168deg,#C98AA6,#EAC7D8)',custom:'linear-gradient(168deg,#8C6E9E,#D6BFDF)'};
let EVCUR=null;
function evOpen(i){EVCUR=TLEV[i];if(!EVCUR)return;go('ev');evRender();}
let EVLAST=null;
function evRender(){
  const keep=EVLAST===EVCUR?evIdx():0; EVLAST=EVCUR;   // сердечко перерисовывает экран — остаёмся на той же вещи
  const e=EVCUR; if(!e)return;
  const days=Math.round((new Date(e.d)-new Date(todayStr()))/MS);
  const when=days<=0?'сегодня':(days<7?`через ${days} дн.`:(days<45?`через ${Math.round(days/7)} нед.`:`через ${Math.round(days/30)} мес.`));
  document.getElementById('evHead').style.background=EVGRAD[e.type]||EVGRAD.season;
  document.getElementById('evTitle').textContent=e.title;
  document.getElementById('evSub').textContent=`${TLKIND[e.type]||'Событие'} · ${fmtF(e.d)} · ${when}`;

  const sz=e.size||sizeOn(e.d);
  const em=Math.max(0,monthsUntil(e.szDate||e.d));
  // вещи — каруселью (свайп вбок), карточки крупные
  const items=(e.items||[]);
  const isLook=!!e.fancy||evCanDel(e);          // праздник, месяц, своё событие — образами; план (сезон, размер) — списком
  // картинка каждой вещи — по ней подбираем аксессуары в тон
  EVIDS=items.map(([k])=>IMG[k]?k:(CAND[k]?(pickImg(k,0,em).split('/').pop()||'').replace(/\.webp$/,''):''));
  const accRow=isLook&&items.length?`<div class="evacc"><span>к образу</span><div id="evAcc">${evAccHtml(0)}</div></div>`:'';
  const cells=items.map(([k,label])=>{
    const direct=!!IMG[k];                       // прямое имя картинки (нарядное)
    const src=direct?IMG[k]:(CAND[k]?pickImg(k,0,em):null);
    const id='plan'+e.d+':'+k;
    const on=!!WISH[id];
    const isz=direct?sz:sizeForItem(k,em,sz);
    return `<div class="evcell${on?' in':''}" onclick="evWish('${k}','${String(label).replace(/'/g,'')}',${direct?1:0})">
      ${src?`<img src="${src}" alt="" onerror="this.remove()">`:'<div class="ph">♡</div>'}
      <b>${label}</b>${isz?`<s>${szTxt(isz)}</s>`:''}
      ${on?'<div class="heart" style="right:4px;top:4px">♥</div>':''}
    </div>`;}).join('');

  document.getElementById('evBody').innerHTML=`
    <div class="card">
      <h3>${e.type==='size'?'Что закончится первым':'Что пригодится'}</h3>
      <div class="sub">${personize(e.why||e.sub)}</div>
      ${items.length&&!isLook?`<div class="evlist">${items.map(([k,label])=>{
          const direct=!!IMG[k], src=direct?IMG[k]:(CAND[k]?pickImg(k,0,em):null), on=!!WISH['plan'+e.d+':'+k], isz=direct?sz:sizeForItem(k,em,sz);
          return `<div class="item${on?' wl':''}" onclick="evWish('${k}','${String(label).replace(/'/g,'')}',${direct?1:0})">
            ${src?`<img class="th" src="${src}" alt="" loading="lazy" onerror="this.remove()">`:'<span class="th"></span>'}
            <div class="nm">${label}${isz?`<s>${szTxt(isz)}</s>`:''}</div>
            <button class="add${on?' in':''}" aria-label="${on?'убрать из вишлиста':'в вишлист'}"><svg width="15" height="15" viewBox="0 0 24 24" fill="${on?'currentColor':'none'}" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path></svg></button></div>`;}).join('')}</div>
        <div class="pfnote">Нажмите на вещь — она попадёт в вишлист с размером ${sz}.</div>`
      :items.length?`<div class="evwrap"><div class="evgrid" id="evGrid" onscroll="evDots()">${cells}</div>
        ${items.length>1?`<button class="nav" style="left:-6px" aria-label="Предыдущая вещь" onclick="evFlip(-1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#40372F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>
        <button class="nav" style="right:-6px" aria-label="Следующая вещь" onclick="evFlip(1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#40372F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg></button>`:''}</div>
        ${items.length>1?`<div class="dots evdots" id="evDots">${items.map((_,i)=>`<i class="${i?'':'a'}"></i>`).join('')}</div>`:''}${accRow}
        <div class="pfnote">Нажмите на вещь — она попадёт в вишлист с размером ${sz}.</div>
        ${e.fancy?`<div class="pfnote" style="margin-top:6px">${COSTUME_TIP}</div>`:''}`
        :`<div class="pfnote" style="margin-top:10px">Картинок для этого события пока нет. Размер к этой дате: <b>${sz}</b>.</div>`}
    </div>
    <div class="card">
      <h3>${e.type==='season'?'Размер к середине сезона':'Размер к этой дате'}${szI(sz)}</h3>
      <div class="sub">${e.type==='season'&&e.szDate&&e.szDate!==e.d?`К середине сезона, ${fmtF(e.szDate)}, `:''}${personize('малышу будет')} ${ageWordAt(e.szDate||e.d)} — берите <b>${sz}</b>, а не тот, что впору сейчас.</div>
    </div>
    ${e.type==='size'?`<button class="ghost2" onclick="wdOpen(${sz},'ev')">Отметить, что уже есть в ${sz}</button>`:''}
    ${evCanDel(e)?`<button class="ghost2" style="color:#C06A4A;border-color:#E8CBBF" onclick="evDel()">Удалить событие</button>`:''}
    <button class="ghost2" onclick="go('tl')">Назад в план</button>
    <div style="height:14px"></div>`;
  const g=document.getElementById('evGrid');
  if(g&&keep&&g.children[keep])g.scrollLeft=g.children[keep].offsetLeft-g.firstElementChild.offsetLeft;
  evDots();
}
/* карнавальные и нарядные вещи часто из синтетики — к праздничным образам */
const COSTUME_TIP='Посмотрите состав на ярлыке: карнавальные костюмы часто из синтетики, кожа под ней не дышит. Такой костюм — только на время фотосессии, а потом снова хлопок. Под костюм — хлопковое боди, без мелких пайеток и бусин, которые можно оторвать.';
/* стрелки и точки — как на главном экране: по одной вещи, по кругу */
function evIdx(){ const g=document.getElementById('evGrid'); return g?Math.round(g.scrollLeft/(g.firstElementChild?g.firstElementChild.offsetWidth+34:1)):0; }
function evFlip(d){
  const g=document.getElementById('evGrid'); if(!g)return;
  const n=g.children.length, i=((evIdx()+d)%n+n)%n, c=g.children[i];
  g.scrollTo({left:c.offsetLeft-g.firstElementChild.offsetLeft,behavior:'smooth'});
}
function evDots(){ const i=evIdx(), el=document.getElementById('evDots');
  if(el)[...el.children].forEach((x,j)=>x.className=j===i?'a':'');
  const ac=document.getElementById('evAcc'); if(ac&&ac.dataset.i!=String(i)){ac.innerHTML=evAccHtml(i);ac.dataset.i=i;} }
/* аксессуары к вещи, которая сейчас на экране: в тон ей по цвету. Девочке — повязки и игрушки, мальчику — игрушки */
let EVIDS=[];
/* насколько аксессуар в тон вещи: тот же или соседний оттенок — лучше всего, спокойный нейтральный — всегда можно,
   «через четверть круга» (розовый к оливковому) — спорит */
function accTone(base,n){
  const bc=(COLOR[base]||[]).map(hexHsl), a=(COLOR[n]||[])[0]; if(!bc.length||!a)return 0;
  const x=hexHsl(a), tint=c=>c.c>=.06;
  if(!tint(x))return .6-Math.abs(x.l-bc[0].l)*.5;                      // молочный, серый, беж — ко всему
  let best=-9;
  bc.forEach(b=>{ let v;
    if(!tint(b))v=.4-x.c;                                                // к нейтральной вещи — приглушённый акцент
    else{ const d=hueDist(x.h,b.h); v=d<=35?1.6-d/50:(d>=150?.2:-1.2); }
    best=Math.max(best,v-Math.abs(x.l-b.l)*.4); });
  return best;
}
function evAccHtml(i){
  const e=EVCUR, base=EVIDS[i]; if(!e)return '';
  const pool=(S.gender==='girl'?(CAND.headband||[]):[]).concat(CAND.toy||[]).filter(n=>IMG[n]&&(S.gender!=='boy'||GT[n]!=='g'));
  const kind=n=>(CAND_KINDS[n]||[]).includes('headband')?'headband':'toy';
  const sc=n=>accTone(base,n);
  const ranked=pool.map(n=>({n,s:sc(n)})).sort((a,b)=>b.s-a.s).map(x=>x.n);
  // девочке — 2 повязки и 2 игрушки, лучшие по цвету; мальчику — 4 игрушки
  const hb=ranked.filter(n=>kind(n)==='headband').slice(0,2), ty=ranked.filter(n=>kind(n)==='toy').slice(0,4-hb.length);
  return hb.concat(ty).map(n=>{const on=!!WISH['plan'+e.d+':'+n], lb=kind(n)==='headband'?'повязка с бантиком':'игрушка';
    return `<div class="ac${on?' in':''}" onclick="evWish('${n}','${lb}',1)"><img src="${IMG[n]}" alt="" onerror="this.remove()"></div>`;}).join('');
}
function ageWordAt(d){
  const am=Math.max(0,monthsUntil(d)), f=Math.floor(am);
  if(am-f>=0.6)return 'почти '+(f+1)+' '+monthsWord(f+1);
  return f+' '+monthsWord(f);
}
function evWish(k,label,direct){
  const e=EVCUR; if(!e)return;
  const sz=e.size||sizeOn(e.d);
  const em=Math.max(0,monthsUntil(e.szDate||e.d));
  const id='plan'+e.d+':'+k;
  const acc=(CAND_KINDS[k]||[]).some(x=>x==='headband'||x==='toy');       // повязка, игрушка — без размера одежды
  const added=wishToggle(id,{label:label,size:acc?'':(direct?sz:sizeForItem(k,em,sz)),
    src:(evCanDel(e)?'Событие · ':'План · ')+e.title,ev:evKey(e),d:e.d,
    img:(direct?IMG[k]:(CAND[k]?pickImg(k,0,em):null))||null,key:k});
  toast(added?`«${label}» — в вишлисте`:`«${label}» убрали из вишлиста`);
  evRender();
}

const TLCOL={trip:'#6E8FA8',size:'#7A8C5A',season:'#7A8C5A',   // размер и сезон — один «План», один цвет
 holiday:'#B87A9C',month:'#C98AA6',custom:'#B87A9C'};
/* три рода записей: события (праздники, месяцы, свои) — можно удалить; поездки; план (смена размера/сезона) — не удаляется */
const TLKIND={trip:'Поездка',size:'План',season:'План',holiday:'Событие',month:'Событие',custom:'Событие'};
const evCanDel=e=>['holiday','month','custom'].includes(e.type);
const evKey=e=>e.type+'|'+e.title+'|'+e.d;
let EVHIDE=[]; (function(){try{const a=JSON.parse(store.get('mpp-evhide')||'[]');if(Array.isArray(a))EVHIDE=a;}catch(e){}})();
function evHideSave(){try{store.set('mpp-evhide',JSON.stringify(EVHIDE));}catch(e){}}
function evDel(){
  const e=EVCUR; if(!e||!evCanDel(e))return;
  if(!confirm(`Удалить событие «${e.title}» из плана?`))return;
  if(e.custom){CUSTEV=CUSTEV.filter(c=>c.id!==e.custom);custSave();}
  else{EVHIDE.push(evKey(e));evHideSave();}
  go('tl');toast('Событие удалено');
}
/* открыть событие по ключу (из вишлиста) */
function evOpenKey(k){TLEV=tlEvents();const i=TLEV.findIndex(e=>evKey(e)===k);
  if(i<0){toast('Этого события уже нет в плане');return;}evOpen(i);}
function evUnhide(){EVHIDE=[];evHideSave();tlRender();toast('События вернулись');}
let CUSTEV=[]; (function(){try{const a=JSON.parse(store.get('mpp-custev')||'[]');if(Array.isArray(a))CUSTEV=a;}catch(e){}})();
function custSave(){try{store.set('mpp-custev',JSON.stringify(CUSTEV));}catch(e){}}
function evNew(){
  const box=document.getElementById('evAddBox'); if(!box)return;
  box.innerHTML=`<div class="card"><h3>Своё событие</h3>
    <div class="fld"><span>Название</span><input id="ceName" placeholder="например, крестины" maxlength="40"></div>
    <div class="fld"><span>Дата</span><input type="date" id="ceDate" min="${todayStr()}"></div>
    <button class="ghost2" style="margin-top:10px;border-color:var(--accent);color:var(--accent)" onclick="evAddSave()">Добавить событие</button></div>`;
  box.style.display='block';
}
function evAddSave(){
  const nm=(document.getElementById('ceName').value||'').trim(), d=document.getElementById('ceDate').value;
  if(!nm){document.getElementById('ceName').focus();return;}
  if(!d){toast('Выберите дату');return;}
  CUSTEV.push({id:'ce'+Date.now(),d,name:nm}); custSave();
  document.getElementById('evAddBox').style.display='none'; tlRender(); toast('Событие добавлено');
}
let TLEV=[];
let TLVIEW=(()=>{try{return store.get('mpp-tlview')||'list';}catch(e){return 'list';}})(), TLCM=0, TLDAY=null;
function tlView(v){TLVIEW=v;TLDAY=null;try{store.set('mpp-tlview',v);}catch(e){}tlRender();}
function tlMonth(dlt){TLCM=Math.max(0,Math.min(6,TLCM+dlt));TLDAY=null;tlRender();}
function tlDay(d){TLDAY=TLDAY===d?null:d;tlRender();}
/* календарь: месяц сеткой, кружочки цветом типа; поездка отмечена на все свои дни */
function tlCal(ev,card){
  const t0=new Date(todayStr()), base=new Date(t0.getFullYear(),t0.getMonth()+TLCM,1);
  const y=base.getFullYear(), m=base.getMonth(), nd=new Date(y,m+1,0).getDate(), lead=(base.getDay()+6)%7;
  const MONN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const by={};
  ev.forEach((e,i)=>{
    const last=e.type==='trip'&&e.to?e.to:e.d;
    for(let dt=new Date(e.d);locISO(dt)<=last;dt.setDate(dt.getDate()+1))(by[locISO(dt)]=by[locISO(dt)]||[]).push(i);
  });
  let cells='';
  for(let i=0;i<lead;i++)cells+='<div></div>';
  for(let d=1;d<=nd;d++){
    const iso=dISO(y,m,d), l=by[iso]||[];
    const KC={'Событие':TLCOL.holiday,'Поездка':TLCOL.trip,'План':TLCOL.season};   // по точке на род записи
    const dots=[...new Set(l.map(i=>TLKIND[ev[i].type]))].map(k=>`<i style="background:${KC[k]}"></i>`).join('');
    cells+=`<button class="cd${iso===todayStr()?' today':''}${iso===TLDAY?' sel':''}${l.length?' has':''}"${l.length?` onclick="tlDay('${iso}')"`:''}>${d}<span>${dots}</span></button>`;
  }
  const dayList=TLDAY&&by[TLDAY]?by[TLDAY].map(i=>card(ev[i],i)).join(''):'';
  const legend=[['holiday','Событие'],['trip','Поездка'],['season','План']]
    .map(([t,n])=>`<span><i style="background:${TLCOL[t]}"></i>${n}</span>`).join('');
  return `<div class="cal">
      <div class="calh"><button onclick="tlMonth(-1)"${TLCM?'':' disabled'}>‹</button><b>${MONN[m]} ${y}</b><button onclick="tlMonth(1)"${TLCM<6?'':' disabled'}>›</button></div>
      <div class="calw">${['пн','вт','ср','чт','пт','сб','вс'].map(x=>`<span>${x}</span>`).join('')}</div>
      <div class="calg">${cells}</div>
      <div class="call">${legend}</div>
    </div>
    ${dayList?`<div style="margin-top:12px">${dayList}</div>`:`<div class="sub" style="text-align:center;margin:10px 6px 0">Нажмите на день с кружочком — покажу, что в этот день.</div>`}`;
}
function tlRender(){
  climoFetch();                       // подтянет историю города и перерисует, когда готово
  const ev=TLEV=tlEvents();
  const now=new Date(todayStr());
  const card=(e,i)=>{
    const days=Math.round((new Date(e.d)-now)/MS);
    const when=days<=0?'сегодня':(days<7?`через ${days} дн.`:(days<45?`через ${Math.round(days/7)} нед.`:`через ${Math.round(days/30)} мес.`));
    const soon=S.rem>0&&days>=0&&days<=S.rem;
    return `<div class="tlrow">
      <div class="tldot" style="background:${TLCOL[e.type]}"></div>
      <div class="tlcard tap${soon?' soon':''}" ${e.type==='trip'?`onclick="tripOpen(${e.id})"`:`onclick="evOpen(${i})"`}>
        <div class="tldate"><span class="tlkind" style="color:${TLCOL[e.type]};background:${TLCOL[e.type]}1F">${TLKIND[e.type]}</span>${fmtF(e.d).toUpperCase()} · <span class="tlnow">${when}</span>${soon?' · <span class="tlnow" style="color:#B0705A">ПОРА ПОКУПАТЬ</span>':''}</div>
        <h4>${e.title}</h4>
        <div class="d">${personize(e.sub)}</div>
        ${e.chips.length?`<div class="chips">${e.chips.map(c=>`<span>${c}</span>`).join('')}</div>`:''}
      </div></div>`;
  };
  document.querySelectorAll('#tlViewRow .c').forEach(b=>b.classList.toggle('on',b.dataset.v===(TLVIEW==='cal'?'cal':'list')));
  const html=TLVIEW==='cal'?(ev.length?tlCal(ev,card):''):ev.map(card).join('');
  document.getElementById('tlBody').innerHTML=
    `<div style="display:flex;gap:8px;margin-bottom:12px">
       <button class="ghost2" style="margin:0;flex:1" onclick="tripNew()">+ Поездка</button>
       <button class="ghost2" style="margin:0;flex:1" onclick="evNew()">+ Своё событие</button>
     </div>
     <div id="evAddBox" style="display:none;margin-bottom:12px"></div>`
    + (html||`<div class="card"><div class="sub">Пока пусто. Добавьте поездку или своё событие — и здесь появятся напоминания про размеры и сезоны.</div></div>`)
    + `<div class="sub" style="text-align:center;margin:14px 6px ${EVHIDE.length?6:20}px">Окно двигается вперёд вместе с малышом — новые события появляются сами.</div>`
    + (EVHIDE.length?`<div style="text-align:center;margin-bottom:20px"><button class="swlink" style="width:auto" onclick="evUnhide()">Вернуть удалённые события (${EVHIDE.length})</button></div>`:'');
}
