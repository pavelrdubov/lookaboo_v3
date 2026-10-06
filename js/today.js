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
  car:     {d:+6, why:'в машине малышу быстро становится жарко'},
  home:    {d:0,  why:'дома тепло'}
};
/* коляска бывает разной: в люльке малыш лежит закрытый от ветра (капюшон, накидка), в прогулочной —
   сидит открыто, ветер достаёт до ног. По умолчанию: до 6 месяцев люлька, потом прогулочная; можно выбрать в профиле */
function strollerKind(){ const s=kid().stroller||'auto'; return s==='auto'?(ageMonths()<6?'cot':'seat'):s; }
function ctxNow(){
  // в слинге греется только тело: ножки, стопы и голова снаружи, на ветру. В холод тепло мамы почти не помогает
  // в машине до +12 малыша всё равно несут от двери до двери: одеваем на эти минуты, а не только на тёплый салон
  if(S.ctx==='car'&&airTemp()<=12)return {d:+3,why:'в машине тепло, но до неё и от неё — по улице'};
  if(S.ctx==='sling'&&airTemp()<=10)return {d:+1,why:'в слинге греется только тело — ножки и голова на ветру'};
  if(S.ctx!=='stroller')return CTX[S.ctx];
  // в тепло всё наоборот: в люльке воздух стоит, бортики и матрасик держат тепло — малышу жарче, чем на улице
  const a=airTemp(), cot=strollerKind()==='cot';
  if(a>=20)return cot?{d:+2,why:'в люльке в жару душнее, чем на улице'}:{d:0,why:'малыш сидит в прогулочной коляске'};
  if(a>=16)return cot?{d:0,why:'малыш лежит в люльке'}:{d:-2,why:'малыш сидит в прогулочной коляске'};
  return cot?{d:-2,why:'малыш лежит в люльке'}:{d:-4,why:'малыш сидит в прогулочной коляске'};
}
function setCtx(c){S.ctx=c;store.set('mpp-ctx',c);store.set('mpp-ctx-at',String(Date.now()));if(c!=='home')store.set('mpp-ctx-out',c);
  document.querySelectorAll('#ctxRow .c').forEach(b=>b.classList.toggle('on',b.dataset.c===c));
  S.setIdx=0;paintMain();}
function airTemp(){ return S.live?S.feels:S.temp; }
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
function lookItems(it){ return bootiesLabel(newbornFilter(oneCloth(sunFilter(coverFilter(headFilter(legsFilter(density(socksFilter(suitFilter(envFilter(legLayer(carFilter(it))))))))))),ageMonthsExact())); }
/* в холод на ножки — тёплые пинетки, а не просто носки */
function bootiesLabel(items){ return effTemp()>3?items:items.map(x=>x[0]==='socks'?['socks','тёплые пинетки']:x); }
/* что с какого возраста. Первые 2 месяца — только слипы, распашонки (и боди-распашонки на запах) и ползунки:
   ничего через голову, никаких «взрослых» раздельных вещей. Дальше — по мере того, как малыш держит голову,
   сидит и ползает. Вещь «не по возрасту» заменяем на подходящую того же назначения (или убираем) */
const OVERHEAD=['bodyL','bodyS','bodyT','tank'];
const AGE_MIN={bodyL:2,bodyS:2,bodyT:2,tank:2,dress:2,romper:2,      // через голову, боди-платье, песочник — с 2 мес
  pants:3,suit:3,sweater:3,shorts:3,                                    // раздельные вещи — с 3 мес (штанишки — с носками)
  dungarees:4, jacket:6, vest:6};                                       // полукомбинезон — когда держит спинку; куртка, жилет — сидя в прогулочной
function ageSwap(x,m){
  const [k,l]=x, warm=/тёпл|начёс|шерст/.test(l), dense=/футер|плотн/.test(l);
  if(OVERHEAD.includes(k)||k==='dress'||k==='romper')return ['wrapbody',warm?'шерстяная боди-распашонка':(k==='bodyL'?'боди-распашонка д/р':'боди-распашонка')];
  if(k==='pants'||k==='dungarees')return ['footpants',warm?'тёплые ползунки':(dense||k==='dungarees'?'плотные ползунки':'ползунки')];
  if(k==='suit')return m<2?['slip',warm?'тёплый слип (начёс)':'слип из футера']:['footpants',warm?'тёплые ползунки':'плотные ползунки'];
  if(k==='sweater')return ['cardigan',warm?'тёплая вязаная кофта':'кофта на кнопках'];
  if(k==='shorts')return effTemp()>=24?null:['footpants','тонкие ползунки'];
  if(k==='jacket')return ['ovDemi','демисезонный комбинезон'];
  if(k==='vest')return null;
  return x;
}
function newbornFilter(items,m){
  // распашонка — до 3 месяцев включительно; старше — обычное боди
  if(m>=4)items=items.map(x=>x[0]==='wrap'?['bodyL','боди д/р']:x);
  // до 2 месяцев кофта — только на кнопках (как распашонка)
  if(m<2)items=items.map(x=>x[0]==='cardigan'&&!/кнопк|распаш/.test(x[1])?['cardigan',/тёпл|вязан/.test(x[1])?'тёплая кофта на кнопках':'кофта на кнопках']:x);
  const r=[];
  items.forEach(x=>{ let y=x; for(let n=0;n<3&&y&&AGE_MIN[y[0]]>m;n++)y=ageSwap(y,m);
    if(y&&!r.some(z=>z[0]===y[0]))r.push(y); });
  // если после замен ножки остались открыты (был песочник/шорты) — в прохладу ползунки
  return r;
}
/* насколько плотные нижние слои: зависит от погоды и от того, что сверху.
   Под зимним комбинезоном можно потоньше, под одним флисом или демисезонным — потеплее */
function density(items){
  const top=['ovWinter','envelope','ovDemi','ovFleece','jacket'].find(k=>items.some(x=>x[0]===k));
  const shift={ovWinter:6,envelope:5,ovDemi:3}[top]||0, v=effTemp()+shift;
  const lv=v<=-6?2:(v<=9?1:0);                                      // 0 — тонкие, 1 — плотные, 2 — тёплые
  const L={pants:['хлопковые штанишки','штанишки из футера','тёплые штанишки (начёс, флис)'],
    cardigan:['тонкая кофта','плотная кофта','тёплая вязаная кофта'],
    sweater:['тонкий свитшот','свитер','тёплый шерстяной свитер'],
    slip:['хлопковый слип','слип из футера','тёплый слип (начёс)'],
    footpants:['ползунки','плотные ползунки','тёплые ползунки'],
    suit:['хлопковый костюм','костюм из футера','тёплый костюм (начёс)']};
  if(!top&&effTemp()>16)return items;                                // летом подписи из набора
  return items.map(x=>{
    if(L[x[0]])return [x[0],L[x[0]][lv]];
    if(x[0]==='bodyL'&&lv===2)return ['bodyL','шерстяное боди'];
    if(x[0]==='bodyL'&&lv<2&&/шерст/.test(x[1]))return ['bodyL','боди д/р'];
    return x;
  });
}
/* штанишки без стопы — к ним носки. Под комбинезон на синтепоне (демисезонный, зимний) — тоже:
   иначе это как обувь на голую ногу. Не нужны, только если стопу уже закрывает слип, ползунки
   или флисовый комбинезон со стопой поверх штанишек */
/* конверт — для новорождённых в люльке (до 3 месяцев включительно): в каждом втором образе вместо
   зимнего или демисезонного комбинезона, если есть картинка. В машину и слинг конверт не берём */
function envFilter(items){
  if(ageMonthsExact()>=4||S.ctx!=='stroller'||S.setIdx%2!==1||!(CAND.envelope||[]).some(n=>IMG[n]&&okFor(n,S.gender)))return items;
  return items.map(x=>x[0]==='ovWinter'?['envelope','зимний конверт']:(x[0]==='ovDemi'?['envelope','демисезонный конверт']:x));
}
/* спортивный костюм (кофта + штаны одним комплектом) — с 3 месяцев, в каждом втором образе вместо пары «кофта/свитер + штанишки» */
function suitFilter(items){
  if(ageMonthsExact()<3||S.setIdx%2!==0||!(CAND.suit||[]).some(n=>IMG[n]&&okFor(n,S.gender)))return items;
  const ti=items.findIndex(x=>x[0]==='sweater'||x[0]==='cardigan'), pi=items.findIndex(x=>x[0]==='pants');
  if(ti<0||pi<0)return items;
  return items.map((x,i)=>i===ti?['suit','спортивный костюм']:x).filter((x,i)=>i!==pi);
}
function socksFilter(items){
  if(!items.some(x=>x[0]==='pants'||x[0]==='suit')||items.some(x=>x[0]==='socks'))return items;
  if(items.some(x=>['ovFleece','slip','slipKnit','footpants'].includes(x[0])))return items;
  if(effTemp()>22)return items;
  const at=items.findIndex(x=>x[0]==='pants'||x[0]==='suit'); const r=items.slice(); r.splice(at+1,0,['socks',effTemp()<=5?'тёплые носки':'носки']); return r;
}
/* слои считаем и на теле, и на ножках: боди ножки не закрывает. Под комбинезон или куртку всегда
   что-то на ножки; в прохладу на ногах столько же слоёв, сколько на теле */
const TORSO=['envelope','suit','bodyL','bodyS','bodyT','wrap','wrapbody','tank','cardigan','sweater','slip','slipKnit','romper','dress','dungarees','ovFleece','ovDemi','ovWinter','jacket','vest'];
const LEGS=['envelope','suit','slip','slipKnit','footpants','pants','dungarees','ovFleece','ovDemi','ovWinter'];
function layerCount(items){ const t=items.filter(x=>TORSO.includes(x[0])&&x[0]!=='vest').length, l=items.filter(x=>LEGS.includes(x[0])).length;
  return {torso:t, legs:l, n:Math.max(t,l)}; }
function legLayer(items){
  /* три слоя: низ — боди (боди-майка), середина — кофта со штанишками, слип или флис, верх — комбинезон.
     Ножкам нужен хотя бы один слой под самым верхним: если ноги закрывает только верхний комбинезон
     (боди + комбинезон) — добавляем ползунки или штанишки */
  const OUTER=['ovWinter','envelope','ovDemi','ovFleece','jacket'];                    // от тёплого к лёгкому
  const top=OUTER.find(k=>items.some(x=>x[0]===k));
  const under=items.filter(x=>LEGS.includes(x[0])&&x[0]!==top).length;
  const t=S.ctx==='sling'?airTemp():effTemp(), c=layerCount(items);
  const needed=top?under===0:(t<=14&&c.legs===0);           // без комбинезона — если ножки совсем ничем не закрыты
  if(!needed||items.some(x=>x[0]==='pants'||x[0]==='footpants'||x[0]==='suit'))return items;
  // с 3 месяцев — штанишки (и носки), раньше — ползунки со стопой
  const add=ageMonths()>=3?['pants','штанишки']:['footpants','ползунки'];
  const at=items.findIndex(x=>!['bodyL','bodyS','bodyT','wrap','wrapbody','tank'].includes(x[0]));   // сразу после боди
  const r=items.slice(); r.splice(at<0?r.length:at,0,add);
  if(add[0]==='pants'&&!r.some(x=>x[0]==='socks'))r.splice(r.findIndex(x=>x[0]==='pants')+1,0,['socks','носки']);
  return r;
}
/* в коляске до +16 малыш лежит без движения — пелёнки мало, нужен тонкий плед */
function coverFilter(items){
  if(S.ctx!=='stroller'||effTemp()>16||items.some(x=>x[0]==='blanket'))return items;
  const cov=swaddleFor(effTemp()), at=items.findIndex(x=>x[0]==='muslin');
  if(at<0)return items.concat([cov]);
  const r=items.slice(); r[at]=cov; return r;
}
/* голова: до +16 по ощущению малышу нужна шапочка, где бы он ни был (кроме тёплой машины) —
   голова у него большая и отдаёт много тепла. Толщину шапки подбираем по погоде и пишем словами;
   в солнце и теплее +16 — панамка или чепчик от солнца */
function headFilter(items){
  if(S.ctx==='car'&&airTemp()>12)return items;           // в тёплый день в машине шапка не нужна; в холод — на дорогу до машины
  // в коляске — по тому, как ощущается малышу; в слинге и по дороге к машине голова снаружи — по воздуху
  const t=S.ctx==='stroller'?effTemp():airTemp(), sunny=S.weather==='sun'||uvNow()>=3;
  const want=t<=3?['hatWarm','тёплая шапка']:(t<=10?['hatWarm','шапка потолще, вязаная']
    :(t<=16?(uvNow()>=6?['panama','панамка с полями — от солнца']:['hat','тонкая шапочка или чепчик']):(sunny?['panama','панамка или чепчик — от солнца']:null)));
  const at=items.findIndex(x=>x[0]==='hat'||x[0]==='hatWarm'||x[0]==='panama');
  if(!want)return items;
  if(at<0)return items.concat([want]);
  if(t>16&&items[at][0]==='panama')return items;                  // панамка уже есть
  const r=items.slice(); r[at]=want; return r;
}
/* УФ-индекс: из живой погоды; вручную выбрано «солнце» днём — примерно по сезону */
function uvNow(){
  if(S.live&&typeof S.uv==='number')return S.uv;
  if(S.weather!=='sun'||dayPhase()!=='day')return 0;
  return {summer:7,spring:4,autumn:3,winter:1}[seasonNow()]||3;
}
const uvWord=u=>u>=11?'экстремальный':u>=8?'очень высокий':u>=6?'высокий':u>=3?'умеренный':'низкий';
/* солнце в коляске: муслин накрыть ножки (а не коляску целиком) */
function sunFilter(items){
  if(S.ctx!=='stroller'||uvNow()<3||effTemp()<17||items.some(x=>x[0]==='muslin'||x[0]==='blanket'))return items;
  return items.concat([['muslin','муслиновая пелёнка']]);
}
/* что взять с собой, кроме одежды: дождевик или зонт в дождь, крем от солнца при УФ от 3 (с полугода) */
function extrasNow(){
  if(S.ctx==='home')return [];
  const r=[], u=uvNow(), dt=wxDetail();
  if(['drizzle','rain','shower','heavy','thunder','sleet'].includes(dt.kind)||S.weather==='rain')
    r.push(S.ctx==='stroller'?['raincover','дождевик на коляску']:S.ctx==='sling'?['umbrella','зонт или слингокуртка']:['umbrella','зонт — дойти до машины']);
  if(u>=3&&S.ctx!=='car'&&ageMonths()>=6)r.push(['spf','детский крем SPF 50+']);
  return r;
}
function uvTip(u){
  const lead=u>=8?`УФ ${u} — ${uvWord(u)}: с 11 до 16 лучше переждать дома или в густой тени, гулять утром и вечером.`
    :u>=6?`УФ ${u} — высокий: гуляйте в тени, панамка с полями — обязательно.`
    :`УФ ${u}: панамка и тень — и солнцу малыша не подставлять.`;
  const age=ageMonths()<6?' До полугода крем от солнца не нужен — защищают тень, козырёк коляски и лёгкая одежда с рукавами.'
    :' На открытые места — детский крем SPF 50+ с минеральным фильтром за 15 минут до выхода, обновлять каждые 2 часа.';
  return lead+age;
}
/* аксессуары: девочке с 3 месяцев — бантик (повязка) в двух образах из трёх, когда шапка не нужна
   (тепло, в машине, без солнца — тогда и панамка не обязательна); в остальных — игрушка в каждом втором.
   Больше 5 вещей в коллаж не помещается: бантик встаёт вместо игрушки */
function accFilter(items){
  if(items.some(x=>x[0]==='headband'))return items;
  const sunny=S.weather==='sun'||uvNow()>=3, warm=effTemp()>16||(S.ctx==='car'&&airTemp()>12);
  const hbOK=S.gender==='girl'&&ageMonthsExact()>=3&&(CAND.headband||[]).length&&warm&&!sunny&&!items.some(x=>x[0]==='hat'||x[0]==='hatWarm');
  if(hbOK&&S.setIdx%3!==0){
    let r=items.filter(x=>x[0]!=='panama');
    if(r.length>4)r=r.filter(x=>x[0]!=='toy');
    if(r.length<=4)return r.concat([['headband','повязка с бантиком']]);
  }
  if(S.setIdx%2!==1||items.length>4||items.some(x=>x[0]==='toy'))return items;
  return items.concat([[ 'toy', S.ctx==='sling'?'грызунок':S.ctx==='car'?'игрушка в дорогу':'игрушка в коляску' ]]);
}
/* пелёнка и плед вместе — две одинаковые «тряпочки» в образе: оставляем плед, вместо пелёнки — игрушка */
function oneCloth(items){
  if(!(items.some(x=>x[0]==='muslin')&&items.some(x=>x[0]==='blanket')))return items;
  const r=items.filter(x=>x[0]!=='muslin');
  if(!r.some(x=>x[0]==='toy'))r.push(['toy','игрушка']);
  return r;
}
function carFilter(items){
  if(S.ctx!=='car')return items;
  const OUT=['ovWinter','ovDemi','jacket'];       // тонкий флис под ремнями можно — он не сминается
  let r=items.filter(x=>!OUT.includes(x[0]));
  if(!r.some(x=>x[0]==='blanket'))r.push(['blanket','плед']);
  if(!r.some(x=>!NOTLAYER.includes(x[0])))r.unshift(['bodyL','боди д/р']);
  // до +5 без тёплого слоя до машины не донести — тонкий флис (он под ремни можно)
  if(airTemp()<=5&&!r.some(x=>['ovFleece','slipKnit','cardigan','sweater'].includes(x[0]))){const at=r.findIndex(x=>NOTLAYER.includes(x[0])); r.splice(at<0?r.length:at,0,['ovFleece','флисовый комбинезон']);}
  return r;
}
/* время суток меняется — раз в 10 минут перерисовываем шапку, если экран открыт */
setInterval(()=>{if(S.screen==='main'&&document.visibilityState==='visible')paintMain();},600000);
/* праздник сегодня (из «Плана»: Хэллоуин, Новый год, 23 февраля, 8 марта, день рождения, «месяцовщина», своё событие) —
   тогда на главной появляется вкладка «дома» с праздничным образом */
let HOLCACHE={k:'',v:null};
function holidayToday(){
  const t=todayStr(), key=[t,S.dob,S.gender,(typeof CUSTEV!=='undefined'?CUSTEV.length:0)].join('|');
  if(HOLCACHE.k===key)return HOLCACHE.v;
  let v=null; try{ v=tlEvents().find(e=>e.d===t&&['holiday','month','custom'].includes(e.type)&&e.items&&e.items.some(x=>IMG[x[0]]))||null; }catch(e){}
  HOLCACHE={k:key,v}; return v;
}
function holidayPool(h){ return h.items.filter(x=>IMG[x[0]]); }
function paintHoliday(h,sz){
  const pool=holidayPool(h), n=Math.min(5,pool.length), v=S.setIdx%n;
  const it=[pool[v]]; if(pool.length>1)it.push(pool[(v+1)%pool.length]);
  it.push(S.gender==='girl'&&(CAND.headband||[]).length?['headband','повязка с бантиком']:['toy','любимая игрушка']);
  document.getElementById('tLayers').textContent='праздник';
  document.getElementById('bTitle').textContent=h.title;
  document.getElementById('bName').textContent='дома';
  document.getElementById('items').textContent=it.map(x=>x[1]).join(' · ');
  const tip=personize(`Сегодня ${h.title.toLowerCase().startsWith('день')||/месяц/.test(h.title)?'особенный день':h.title}! Не забудьте о праздничной фотосессии: нарядное надевайте прямо перед съёмкой, а потом — снова домашнее. Проверьте состав: карнавальные костюмы часто из синтетики — в ней кожа не дышит, так что недолго пофотографироваться можно, а носить весь день не стоит.`);
  S.tipText=tip; const tpEl=document.getElementById('tipText'); if(tpEl)tpEl.textContent=tip;
  document.getElementById('setDots').innerHTML=Array.from({length:n},(_,i)=>`<i class="${i===v?'a':''}"></i>`).join('');
  drawStage({name:'дома',it},sz);
}
function paintMain(){
  const sc=SCENES[S.weather]||SCENES.cloud, sky=skyFor(S.weather);
  document.getElementById('wband').style.background=sky.grad;
  document.getElementById('bband').style.background=sc.band;
  document.getElementById('wart').innerHTML=sceneArt(S.weather,sky.ph,seasonNow(),wxDetail());

  const m=ageMonths(), sz=sizeFor(heightNow()), k=kid();
  /* аватарка и имя в углу */
  const av=document.getElementById('mav');
  av.className='av'+(k.photo||kidName(k)?'':' none');
  av.innerHTML = k.photo ? `<img src="${k.photo}" alt="">` : (kidName(k)?kidLabel(k)[0].toUpperCase():'');
  document.getElementById('mchipT').textContent=(kidName(k)?kidName(k)+' · ':'')+(expecting()?`ПДР ${fmtD(S.dob)}`:`${m} мес · ${sz}`);

  const tT=document.getElementById('tTemp'), tF=document.getElementById('tFeels');
  document.getElementById('tPlace').textContent=S.city||'город не выбран';
  const dt=wxDetail(), word=(dt.kind&&WXWORD[dt.kind])||sc.word;
  const uvL=S.live&&uvNow()>=3?` · УФ ${uvNow()}`:'';
  const wind=S.wind>=10?` · сильный ветер ${S.wind} м/с`:(S.wind>=5?` · ветер ${S.wind} м/с`:'');
  if(S.wx==='live'){
    tT.textContent=(S.temp>0?'+':'')+S.temp+'°';
    tF.textContent=word+wind+uvL;
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
  if(uvNow()>=3)full.push(`УФ-индекс ${uvNow()} — ${uvWord(uvNow())}`);
  full.push(personize(ctxNow().why));
  S.whyText=`${full.join(' · ')} — для ${babyCases().gen} это как ${ef0>0?'+':''}${ef0}°`;
  // ждём малыша — вместо образа на сегодня образ на выписку
  const ex=dischMode();
  document.querySelectorAll('#ctxRow .c:not(.hol)').forEach(b=>b.style.display=ex?'none':'');
  { const wr=document.getElementById('walkRow'); if(wr)wr.innerHTML=''; }
  if(ex){ const hc0=document.getElementById('ctxHome'); if(hc0)hc0.style.display='none'; paintDischarge(sz); return; }
  homeAuto();                                         // вечером — сами на «на ночь», утром — обратно (js/home.js)
  const hol=holidayToday(), hc=document.getElementById('ctxHome');
  HOMEMODE=homeMode();
  if(hc){hc.style.display=''; hc.textContent=HOMEMODE==='sleep'?'на ночь':'дома'; hc.classList.toggle('hol',HOMEMODE==='hol');}
  document.querySelectorAll('#ctxRow .c').forEach(b=>b.classList.toggle('on',b.dataset.c===S.ctx));
  if(S.ctx==='home'){ if(HOMEMODE==='hol'){document.getElementById('tWhy').textContent=personize('Дома — праздничный образ для фото'); paintHoliday(hol,sz);} else paintHome(sz); return; }

  const b=bandFor(effTemp());
  const list=setsFor(b);
  const set0=curSet(list);
  const set={name:set0.name, it:accFilter(lookItems(set0.it))};   // машина — без объёмного комбинезона, прогулочная — плед на ножки
  const nl=layerCount(set.it).n||set.it.filter(x=>!NOTLAYER.includes(x[0])).length;
  document.getElementById('tLayers').textContent=`${nl} ${nl===1?'слой':(nl<5?'слоя':'слоёв')}`;
  document.getElementById('bTitle').textContent=b.title;
  document.getElementById('bName').textContent=personize(set.name);
  const ins=insFor(effTemp());
  // дождевик, зонт, крем: есть картинка — встают в коллаж, нет — только строкой в списке
  const extras=extrasNow().filter(x=>{ if((CAND[x[0]]||[]).some(n=>IMG[n])){ set.it.push(x); return false; } return true; });
  document.getElementById('items').textContent=
    set.it.map(([k,l])=>l+(INSKEYS.includes(k)?' '+ins.g:'')).concat(extras.map(x=>x[1])).join(' · ');
  const ef=effTemp();
  let tipTxt=(ef<=-8||ef>=22)?b.tip:(WTIPS[S.weather]||b.tip);
  const insN=insFor(ef).note;
  if(insN&&set.it.some(x=>INSKEYS.includes(x[0])))tipTxt=insN;
  if(S.ctx==='car')tipTxt=airTemp()<=12?'В кресле — только тонкие слои и флис, ремни впритык. Тёплый комбинезон или конверт возьмите с собой: наденьте, когда выходите из машины, а в салоне укройте малыша пледом поверх пристёгнутых ремней.':'Объёмный комбинезон в машину не надевают: под ремнями он сминается, и они не затянутся плотно. В салоне тепло — тонкие слои, ремни впритык. Согреть можно пледом поверх пристёгнутых ремней (не под спину и не за лямки) — и не закрывая лицо.';
  if(S.ctx==='stroller'&&strollerKind()==='seat'&&ef<=6)tipTxt='В прогулочной коляске ветер достаёт до ног — укройте ножки пледом или накидкой, даже если комбинезон тёплый.';
  if(S.ctx==='sling')tipTxt=airTemp()<=10?'В слинге тело малыша греете вы, а ножки, стопы и голова — на ветру: они мёрзнут первыми. Ниже +10 застегните свою куртку поверх слинга или наденьте слингонакидку, на ножки — тёплые носки или пинетки.':'В слинге малыша греет ваше тело — проверяйте шею сзади, чтобы он не перегрелся под курткой.';
  if(S.ctx==='stroller'&&strollerKind()==='cot'&&airTemp()>=20)tipTxt='В люльке в жару душно: откройте окошко или сетку капюшона и не накрывайте коляску пелёнкой целиком — под тканью воздух не движется и становится жарче, чем на улице. Проверяйте шею сзади: влажная — снимите слой.';
  const uv=uvNow();
  if(S.ctx!=='car'&&uv>=3&&(uv>=6||ef>=17))tipTxt=uvTip(uv);
  tipTxt=personize(tipTxt);
  S.tipText=tipTxt;
  const tpEl=document.getElementById('tipText'); if(tpEl)tpEl.textContent=tipTxt;

  /* сколько всего образов: наборы × удачные сочетания картинок к каждому */
  const tot=lookTotal(list.length), cur=S.setIdx%tot;
  const dots=document.getElementById('setDots');
  dots.innerHTML=tot<=8?Array.from({length:tot},(_,i)=>`<i class="${i===cur?'a':''}"></i>`).join('')
    :`<span class="cnt">${cur+1} / ${tot}</span>`;
  drawStage(set,sz);
  LASTSTAGE.items=LASTSTAGE.items.concat(extras);
  if(typeof walkPaint==='function')walkPaint();    // дождевик, зонт, крем — в вишлист тоже
}

function dayWish(key,label,quiet){
  if(SWIPED)return;                       // это был свайп, а не тап по вещи
  const sz=sizeFor(heightNow());
  const added=wishToggle(wk('day:'+key),{label:label,size:sizeForItem(key,ageMonths(),sz),
    src:'На каждый день',img:LASTLOOK[key]||pickImg(key),key:key});
  if(!quiet)toast(added?`«${label}» — в вишлисте`:`«${label}» убрали из вишлиста`);
  paintMain();
}
function flip(d){
  const p=document.getElementById('tipPop');if(p)p.classList.remove('on');
  const tb=document.getElementById('tipBtn');if(tb)tb.classList.remove('act');
  // стрелки листают и наборы, и другие сочетания картинок (см. lookImgs); дома в праздник — праздничные вещи
  const hol=S.ctx==='home'&&HOMEMODE==='hol'&&holidayToday();
  const n=S.ctx==='home'&&!hol&&!dischMode()?homeCount():dischMode()?withDisch(()=>lookTotal(setsFor(bandFor(effTemp())).length)):hol?Math.min(5,holidayPool(hol).length):lookTotal(setsFor(bandFor(effTemp())).length);
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
let LASTSTAGE=null;
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
  { const sk=(LOOK.slipKnit||'').split('/').pop().replace('.webp',''), el=document.getElementById('items');
    if(sk&&chestImg(sk)&&el&&!/животик/.test(el.textContent))el.textContent=el.textContent.replace(/(вязаный (?:слип|комбинезон))/,'$1 (застёжка на груди — удобно на животике)'); }
  LASTSTAGE={list,LOOK,items:set.it.concat(list.filter(x=>x[0]==='socks'&&!set.it.some(y=>y[0]==='socks')).map(x=>[x[0],x[1]]))};          // «показать бабушке» и «в вишлист» берут ровно то, что на экране
  // носки добавились из-за комбинезона без стопы — пишем и в строке под образом
  if(list.some(x=>x[0]==='socks')&&!set.it.some(x=>x[0]==='socks')){const el=document.getElementById('items'); if(el)el.textContent+=' · '+list.find(x=>x[0]==='socks')[1];}
  const SHADOW='drop-shadow(6px 12px 15px rgba(90,74,58,.26))';
  const noteFs=Math.max(19,Math.min(24,Math.min(B.w,B.h)*0.072));
  /* раскладка по правилам (js/layout.js); по бокам место под стрелки */
  const SIDE=18, ARCH={r:140,ox:SIDE,oy:0};
  const PN=pickNotes(list,effTemp(),S.setIdx), nfs=n=>Object.assign({fs:n.style==='fact'?noteFs*.86:noteFs},n);
  const NOTES=PN.map(nfs); NOTES.alts=(PN.alts||[]).map(nfs);
  const rects=layoutLook(list.map(x=>({key:x[0],src:LOOK[x[0]]})),B.w-2*SIDE,B.h-14,(S.setIdx||0)+new Date().getDate(),NOTES,ARCH);
  let html='';
  rects.forEach(r=>{
    const key=r.key, label=(list.find(x=>x[0]===key)||[key,key])[1];
    const inW=!!WISH[wk('day:'+key)];
    const lack=wdHave(key,sz)===0;             // мама отметила, что такого нет
    const tap=`onclick="dayWish('${key}','${String(label).replace(/'/g,'')}')"`;
    html+=`<div class="gitem" ${tap} style="left:${Math.round(SIDE+r.left)}px;top:${Math.round(r.top)}px;`
      +`width:${Math.round(r.iw)}px;height:${Math.round(r.ih)}px;transform-origin:${Math.round(r.ox)}px ${Math.round(r.oy)}px;`
      +`transform:rotate(${r.rot}deg);z-index:${r.z}">`
      +`<img src="${r.src}" alt="" onerror="this.parentNode.style.display='none'" style="width:100%;height:100%;max-width:none;max-height:none;filter:${SHADOW}${lack?';opacity:.5':''}">`
      +`${lack?`<div class="gap">нет в ${sz}</div>`:''}${inW?`<div class="heart" style="right:auto;left:${Math.round(r.ox+r.w/2-16)}px;top:${Math.round(r.oy-r.h/2-4)}px">♥</div>`:''}</div>`;
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
function sceneArt(w,ph,season,dt){
  ph=ph||'day'; dt=dt||{};
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
  const k=dt.kind, wind=!!dt.wind;
  const skew=wind?' transform="skewX(-28)" style="transform-origin:300px 140px"':'';                 // в ветер капли и снег летят косо
  const drops=(x0,y0,n,len,op)=>{let o='';for(let q=0;q<n;q++){const x=x0+((q*37+day0*11)%150),y=y0+((q*53)%90);o+=`M${x} ${y}l-${(len*.35).toFixed(0)} ${len}`;}return `<path d="${o}" stroke="${night?'#A9BBD6':'#E9EEF1'}" stroke-width="${len>20?3:2.6}" stroke-linecap="round" opacity="${op}"></path>`;};
  const flakes=(n,r0)=>{let o=`<g fill="#fff" opacity=".92">`;for(let q=0;q<n;q++)o+=`<circle cx="${(178+((q*41+day0*7)%200))}" cy="${(100+((q*29)%120))}" r="${(r0+((q*7)%3)*.6).toFixed(1)}"></circle>`;return o+'</g>';};
  if(w==='rain'||w==='snow'||k==='fog'||k==='thunder'){
    if(k==='thunder'){                                   // гроза: тяжёлые тёмные тучи и молния
      a+=`<path d="M250 76a28 28 0 0 1 0-56 34 34 0 0 1 62 9 24 24 0 0 1 15 47z" fill="${night?'#4A536F':'#7E8896'}"></path><path d="M312 96a22 22 0 0 1 0-44 26 26 0 0 1 48 7 19 19 0 0 1 11 37z" fill="${night?'#5A6380':'#959EAA'}" opacity=".95"></path>`
        +'<path d="M366 104l-14 30h12l-8 26 26-36h-13l9-20z" fill="#F7D46A"></path>'+`<g${skew}>${drops(250,104,7,24,.7)}</g>`;
    }else if(k==='fog'){                                 // туман: размытые полосы
      a+=clouds(.55)+'<g fill="#fff">'+[[236,70,170,.34],[256,104,150,.4],[228,138,180,.42],[248,172,160,.46]].map(([x,y,wd,o])=>`<rect x="${x}" y="${y}" width="${wd}" height="16" rx="8" opacity="${o}"></rect>`).join('')+'</g>';
    }else{
      a+=clouds();
      if(k==='drizzle')a+=`<g fill="${night?'#A9BBD6':'#E9EEF1'}" opacity=".8"${skew}>`+Array.from({length:16},(_,q)=>`<circle cx="${178+((q*41+day0*5)%200)}" cy="${104+((q*29)%100)}" r="1.6"></circle>`).join('')+'</g>';
      else if(k==='heavy'||k==='shower')a+=`<g${skew}>${drops(240,98,14,26,.8)}${drops(200,140,8,22,.6)}</g>`;
      else if(k==='sleet')a+=`<g${skew}>${drops(240,100,6,20,.7)}</g>`+flakes(6,3);
      else if(k==='heavysnow')a+=`<g${skew}>${flakes(22,3.4)}</g>`;
      else if(w==='snow'||k==='snow')a+=`<g${skew}><g fill="#fff" opacity=".92"><circle cx="266" cy="112" r="4"></circle><circle cx="300" cy="140" r="3.4"></circle><circle cx="338" cy="118" r="4.4"></circle><circle cx="356" cy="156" r="3.2"></circle><circle cx="242" cy="152" r="3.6"></circle><circle cx="286" cy="182" r="4"></circle><circle cx="322" cy="196" r="3"></circle><circle cx="204" cy="132" r="3"></circle><circle cx="180" cy="176" r="3.6"></circle><circle cx="252" cy="212" r="3.2"></circle></g></g>`;
      else a+=`<g stroke="${night?'#A9BBD6':'#E9EEF1'}" stroke-width="3" stroke-linecap="round" opacity=".76"${skew}><path d="M262 98l-9 26M286 106l-9 26M310 116l-9 26M334 102l-9 26M358 118l-9 26M274 144l-7 18M322 156l-7 18M350 164l-7 18"></path></g>`;
    }
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

  if(wind)a+=`<g stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="${night?.5:.9}"><path d="M236 104c26-5 52 3 80-2 12-3 16-14 5-16-7-1-10 6-4 9"></path><path d="M262 128c30-4 62 4 100-3"></path><path d="M244 152c24-4 46 3 70-1 11-2 14-12 5-14-6 0-8 5-4 7"></path></g>`;   // сильный ветер — порывы
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
  a+=holidayArt(holidayNow(),night,w);
  return svg+a+'</svg>';
}

/* праздник сегодня (несколько дней до него — тоже): украшение в шапке */
function holidayNow(d){
  d=d||new Date(); const m=d.getMonth()+1, day=d.getDate();
  if(S.dob){const b=new Date(S.dob);
    if(!isNaN(b)&&b.getDate()===day){ if(b.getMonth()+1===m&&d.getFullYear()>b.getFullYear())return 'bday';
      if(d>b&&ageMonths()>=1&&ageMonths()<12)return 'mday'; }}            // день рождения и «месяцовщина»
  const ea=easterOrth(d.getFullYear()), toE=Math.round((ea-new Date(d.getFullYear(),m-1,day))/864e5);
  if(toE>=0&&toE<=3)return 'easter';                                         // Пасха и три дня до неё
  if(m===10&&day>=25)return 'halloween';
  if(m===2&&day>=21&&day<=23)return 'feb23';
  if(m===5&&day>=7&&day<=9)return 'may9';
  if((m===8&&day>=30)||(m===9&&day===1))return 'sep1';
  if((m===12&&day>=20)||(m===1&&day<=10))return 'newyear';
  if(m===2&&day>=12&&day<=14)return 'valentine';
  if(m===3&&day>=5&&day<=8)return 'march8';
  if((m===5&&day>=30)||(m===6&&day===1))return 'childday';
  return '';
}
/* православная Пасха (по юлианскому календарю + 13 дней), дата в этом году */
function easterOrth(y){
  const a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,mo=Math.floor((d+e+114)/31),dy=(d+e+114)%31+1;
  return new Date(y,mo-1,dy+13);
}
/* украшение к празднику. ground — то, что стоит на пригорке; air — то, что в воздухе.
   Погода: в дождь в воздухе ничего, над пригорком зонтик; в снег — шапочки снега на украшениях;
   салют — только ясной ночью */
function holidayArt(h,night,w){
  if(!h)return '';
  const pumpkin=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 -13c-2-5 0-9 4-10" stroke="#6B8E4E" stroke-width="3" stroke-linecap="round"></path><ellipse cx="-9" cy="0" rx="9" ry="12" fill="#D9772A"></ellipse><ellipse cx="9" cy="0" rx="9" ry="12" fill="#D9772A"></ellipse><ellipse cx="0" cy="0" rx="9" ry="13" fill="#EE8F35"></ellipse>${night?'<path d="M-8 -3l3-3 3 3zM2 -3l3-3 3 3zM-7 4c4 4 10 4 14 0l-3 1-2-2-2 2-2-2-2 2z" fill="#FBD36B"></path>':''}</g>`;
  const balloon=(x,y,c,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 14c-2 8 4 14 0 24" stroke="#fff" stroke-width="1.4" opacity=".8"></path><ellipse cx="0" cy="0" rx="11" ry="14" fill="${c}"></ellipse><path d="M-2 13l2 3 2-3z" fill="${c}"></path><ellipse cx="-4" cy="-5" rx="2.6" ry="4" fill="#fff" opacity=".45"></ellipse></g>`;
  const heart=(x,y,k,c)=>`<path transform="translate(${x} ${y}) scale(${k})" d="M0 6C-9 0-9-7-4.5-7-2-7 0-5 0-3 0-5 2-7 4.5-7 9-7 9 0 0 6z" fill="${c}"></path>`;
  const tulip=(x,y,c)=>`<g transform="translate(${x} ${y})"><path d="M0 0v18" stroke="#7FA563" stroke-width="2.4" stroke-linecap="round"></path><path d="M0 14c-6-2-8-7-8-10 4 1 7 4 8 8" fill="#8DB36F"></path><path d="M-6 -10c0 7 3 10 6 10s6-3 6-10l-3 3-3-5-3 5z" fill="${c}"></path></g>`;
  const egg=(x,y,c,s,r)=>`<g transform="translate(${x} ${y}) rotate(${r||0})"><ellipse rx="7" ry="9" fill="${c}"></ellipse><path d="M-7 0c3-2 5 2 7 0s4-2 7 0" stroke="${s}" stroke-width="1.6" fill="none"></path><circle cy="-4.5" r="1.4" fill="${s}"></circle></g>`;
  const carn=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M0 0v20" stroke="#6E9A57" stroke-width="2" stroke-linecap="round"></path><path d="M-6 -2l2-5 2 3 2-5 2 5 2-3 2 5c-2 3-10 3-12 0z" fill="#D63C3C"></path></g>`;
  const flower=(x,y,c)=>`<g transform="translate(${x} ${y})">${[0,60,120,180,240,300].map(d=>`<circle cx="${(4.2*Math.cos(d*Math.PI/180)).toFixed(1)}" cy="${(4.2*Math.sin(d*Math.PI/180)).toFixed(1)}" r="3" fill="${c}"></circle>`).join('')}<circle r="2.2" fill="#F2C14E"></circle></g>`;
  const firework=(x,y,c)=>`<g transform="translate(${x} ${y})" stroke="${c}" stroke-width="1.8" stroke-linecap="round">${[0,45,90,135,180,225,270,315].map(d=>`<path d="M${(5*Math.cos(d*Math.PI/180)).toFixed(1)} ${(5*Math.sin(d*Math.PI/180)).toFixed(1)}L${(13*Math.cos(d*Math.PI/180)).toFixed(1)} ${(13*Math.sin(d*Math.PI/180)).toFixed(1)}"></path>`).join('')}</g>`;
  const bat=(x,y,k,c,o)=>`<path transform="translate(${x} ${y}) scale(${k})" d="M0 0c4-6 8-6 10-2 2-4 6-4 8 0l2-6 2 6c2-4 6-4 8 0 2-4 6-4 10 2-6-2-10 0-12 4-2-2-4-2-6 0-2-2-4-2-6 0-2-4-6-6-12-4z" fill="${c}" opacity="${o}"></path>`;
  let g='', air='', caps=[];          // caps — где положить снежную шапочку: [x, y, ширина]
  if(h==='halloween'){g=pumpkin(28,222,1.35)+pumpkin(66,230,1); caps=[[28,206,24],[66,218,18]];
    air=night?bat(236,58,1,'#26203A',.85):bat(214,150,.8,'#3B3350',.6);}
  else if(h==='newyear'){  // гирлянда — в любую погоду, ёлочка на пригорке
    air='<path d="M168 6c40 26 80 26 120 0s70-18 100-4" stroke="#3E5A3A" stroke-width="1.6" fill="none" opacity=".7"></path>';
    const C=['#F2C14E','#E2574C','#6FC4A2','#6BA6CC','#F49AC1'];
    for(let k=0;k<9;k++){const t=k/8,x=168+t*220,y=k<5?6+Math.sin(t*Math.PI*1.8)*17:4+Math.sin(t*Math.PI*1.8)*13;
      air+=`<circle cx="${x.toFixed(0)}" cy="${(y+5).toFixed(0)}" r="3.6" fill="${C[k%C.length]}"${night?' style="filter:drop-shadow(0 0 4px '+C[k%C.length]+')"':''}></circle>`;}
    g='<g transform="translate(36 212) scale(1.3)"><path d="M0 -26l14 18h-7l11 14H-18l11-14h-7z" fill="#4F7A4A"></path><rect x="-2.5" y="6" width="5" height="6" fill="#8C5A3C"></rect><circle cx="-5" cy="-4" r="2" fill="#E2574C"></circle><circle cx="6" cy="0" r="2" fill="#F2C14E"></circle><circle cx="0" cy="-14" r="1.8" fill="#6BA6CC"></circle><path d="M0 -31l2 4 4 .4-3 2.6 1 4-4-2-4 2 1-4-3-2.6 4-.4z" fill="#F2C14E"></path></g>';
    caps=[[36,190,14],[36,203,26]];
    if(night&&w!=='rain'&&w!=='snow')air+=firework(352,150,'#F2C14E')+firework(220,170,'#F49AC1');}
  else if(h==='valentine'){g=heart(30,224,1.6,'#E86F8A'); caps=[[30,214,20]];
    air=heart(210,40,1.4,'#F08AA0')+heart(352,140,1.1,'#F5B3C1')+heart(372,64,.9,'#F5B3C1');}
  else if(h==='march8'){g='<g transform="translate(0 -10) scale(1.3)">'+tulip(12,170,'#F28AA0')+tulip(26,175,'#F6C64F')+tulip(40,172,'#E86F8A')+'</g>'; caps=[[16,201,14],[34,208,14],[52,203,14]];
    air='<g fill="#F6D24A">'+[[344,132],[354,126],[350,140],[362,138],[358,150]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.2"></circle>`).join('')+'</g>';}
  else if(h==='feb23'){g='<g transform="translate(30 226)"><path d="M-16 0h32l-6 8h-20z" fill="#5A7FA8"></path><path d="M0 0v-22l12 14H0z" fill="#fff"></path><path d="M0 -22l-10 14H0z" fill="#E8EEF5"></path></g>'; caps=[[30,224,30]];   // кораблик
    air='<path transform="translate(330 128) rotate(-12)" d="M0 0l30-10-10 22-6-8z" fill="#fff" opacity=".9"></path><path transform="translate(330 128) rotate(-12)" d="M14 4l6 8" stroke="#C9D3DF" stroke-width="1.2"></path>';}
  else if(h==='easter'){g=egg(22,228,'#F2A7B8','#fff',-12)+egg(40,232,'#9CC9E3','#fff',8)+egg(58,228,'#F6D36B','#fff',-4)
      +'<g transform="translate(78 218)"><rect x="-9" y="-2" width="18" height="18" rx="3" fill="#C98A4A"></rect><path d="M-10 -2c0-9 20-9 20 0z" fill="#fff"></path><circle cx="-3" cy="-6" r="1" fill="#E2574C"></circle><circle cx="3" cy="-5" r="1" fill="#6FC4A2"></circle></g>';
    caps=[[22,219,12],[40,223,12],[58,219,12]];
    air=flower(350,134,'#F7C5CF')+flower(366,150,'#FFF4F6');}
  else if(h==='may9'){g='<g transform="scale(1.2)">'+carn(14,180)+carn(26,184)+carn(38,181)+'</g>'; caps=[[17,212,12],[31,217,12],[46,213,12]];
    if(night&&w!=='rain'&&w!=='snow')air=firework(340,140,'#E2574C')+firework(218,168,'#F2C14E')+firework(372,86,'#F49AC1');}
  else if(h==='sep1'){g='<g transform="translate(30 222)"><path d="M-4 18l4-16 4 16z" fill="#8DB36F"></path></g>'+flower(24,214,'#E2574C')+flower(36,210,'#F2C14E')+flower(30,202,'#9C7FC9')+flower(42,218,'#F28AA0'); caps=[[32,196,24]];
    air='<path transform="translate(344 136) rotate(-30)" d="M0 0h26v6H0z" fill="#F2C14E"></path><path transform="translate(344 136) rotate(-30)" d="M26 0l6 3-6 3z" fill="#E9C9A0"></path>';}   // карандаш
  else if(h==='childday'||h==='bday'||h==='mday'){
    const big=h!=='mday';
    if(w==='rain'||w==='snow')g=balloon(30,206,'#F28AA0',.9)+(big?balloon(52,198,'#6FC4A2',1)+balloon(72,210,'#F2C14E',.85):'');   // в непогоду — шарики «держим» у земли
    else air=big?balloon(330,136,'#F28AA0',1.1)+balloon(354,118,'#6FC4A2',1.2)+balloon(376,142,'#F2C14E',1):balloon(356,132,'#F2C14E',1.1);
    if(h==='bday'&&w!=='rain')air+='<g>'+[[186,24,'#F28AA0'],[250,176,'#6BA6CC'],[300,196,'#F2C14E'],[214,190,'#6FC4A2'],[372,60,'#E2574C']].map(([x,y,c])=>`<rect x="${x}" y="${y}" width="5" height="3" rx="1" fill="${c}" transform="rotate(${x%60} ${x} ${y})"></rect>`).join('')+'</g>';
  }
  if(w==='rain'){                            // в дождь: над пригорком зонтик, в воздухе — ничего, кроме гирлянды
    if(h!=='newyear')air='';
    g+='<g transform="translate(104 206) scale(.75)"><path d="M-34 14C-30 -6 30 -6 34 14c-6-4-11-4-17 0-6-4-11-4-17 0-6-4-11-4-17 0z" fill="#C4613C" opacity=".92"></path><path d="M0 2v30c0 4 6 4 6 0" stroke="#7A3E26" stroke-width="2" fill="none" stroke-linecap="round"></path></g>';
  }else if(w==='snow'){                      // в снег — шапочки снега, из воздушного остаются гирлянда и конфетти
    if(h!=='newyear'&&h!=='bday')air='';
    g+=caps.map(([x,y,wd])=>`<ellipse cx="${x}" cy="${y}" rx="${wd/2}" ry="3.2" fill="#fff" opacity=".95"></ellipse>`).join('');
  }
  return g+air;
}
