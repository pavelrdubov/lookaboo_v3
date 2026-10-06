/* ПДР: малыш ещё не родился. Дата рождения в будущем — это ПДР.
   Спрашиваем роддом (по нему знаем город и координаты), смотрим погоду на выписку:
   сначала по средним за прошлые годы, за 2 недели — прогноз. Собираем образ на выписку */
const expecting=()=>!!S.dob&&S.dob>todayStr();
/* образ на выписку нужен, пока ждём — и после родов, пока не выписались */
const dischMode=()=>expecting()||(!!kid().disch&&kid().disch>=todayStr());
/* выписка: после обычных родов — на 3-й день, после кесарева и с двойней — обычно на 5-й */
const birthOpt=()=>kid().birth||{};
function dischDays(){return birthOpt().cs?5:3;}
/* малыш родился — знаем точную дату выписки (kid().disch); пока ждём — считаем от ПДР */
function dischDate(){if(kid().disch)return kid().disch; const d=new Date(S.dob);d.setDate(d.getDate()+dischDays());return locISO(d);}
function birthToggle(k){const b=Object.assign({},birthOpt()); b[k]=!b[k]; kid().birth=b; kid().dw=null; kidsSave();
  dischWeather(true); paintMain(); if(S.screen==='prof')profPaint(); const o=document.getElementById('hospOv'); if(o)hospOpen(); if(S.screen==='oH')ohOpen();}
const dischWhy=()=>birthOpt().cs?'после кесарева выписывают обычно на 5-й день':'выписка обычно на 3-й день';
function birthChips(){const cs=!!birthOpt().cs;
  return `<div class="seg"><button class="${cs?'on':''}" onclick="birthToggle('cs')">${cs?'✓ ':''}будет плановое КС</button></div>
    <div class="pfnote">${cs?'Выписку посчитаем на 5-й день после даты операции.':'Если уже знаете, что будет плановое КС, — отметьте: после него выписывают на 5-й день, а не на 3-й.'}</div>`;}
function daysToDue(){return Math.round((new Date(S.dob)-new Date(todayStr()))/MS);}
function dueWhen(){const d=daysToDue(); return d<14?`через ${d} ${plur(d,'день','дня','дней')}`:`через ${Math.round(d/7)} нед.`;}
/* где выписываемся: роддом, а если не выбран — город из настроек */
function hospLL(){const h=kid().hosp; if(h&&h.lat!=null)return h;
  if(S.lat!=null)return {lat:S.lat,lon:S.lon,city:S.city}; return null;}

/* ---- погода на выписку ---- */
let DW_LOADING=false;
async function dischWeather(force){
  const k=kid(), ll=hospLL(); if(!ll||DW_LOADING||!dischMode())return;
  const d=dischDate(), key=d+'|'+(+ll.lat).toFixed(2)+','+(+ll.lon).toFixed(2), w=k.dw;
  const days=Math.round((new Date(d)-new Date(todayStr()))/MS);
  const fresh=w&&w.key===key&&(w.src==='hist'?days>15:(Date.now()-w.at<6*36e5));
  if(fresh&&!force)return;
  DW_LOADING=true;
  try{
    const sh=(iso,n)=>{const x=new Date(iso);x.setDate(x.getDate()+n);return locISO(x);};
    let sum, src;
    if(days<=15){
      const j=await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ll.lat}&longitude=${ll.lon}`
        +`&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto&start_date=${d}&end_date=${sh(d,1)}`)).json();
      sum=summarise(j.daily); src='forecast';
    }else{
      // неделя вокруг выписки за 3 прошлых года
      const y=new Date(d).getFullYear();
      const rs=await Promise.all([1,2,3].map(n=>fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${ll.lat}&longitude=${ll.lon}`
        +`&start_date=${sh(d,-3).replace(String(y),String(y-n))}&end_date=${sh(d,3).replace(String(y),String(y-n))}`
        +`&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`).then(r=>r.json()).catch(()=>null)));
      const m={temperature_2m_max:[],temperature_2m_min:[],precipitation_sum:[]};
      rs.forEach(j=>{if(j&&j.daily)for(const q in m)m[q]=m[q].concat(j.daily[q]||[]);});
      if(!m.temperature_2m_max.length)throw 0;
      sum=summarise(m); src='hist';
    }
    // днём, когда выписывают: ближе к дневному максимуму
    const t=Math.round(sum.amax-(sum.amax-sum.amin)*.3);
    k.dw=Object.assign({key,at:Date.now(),src,t,city:ll.city||ll.name||S.city},sum); kidsSave();
  }catch(e){}
  DW_LOADING=false;
  if(S.screen==='main')paintMain(); else if(S.screen==='tl')tlRender();
}

/* считаем образ «как будто» на улице погода выписки, малыш — новорождённый, едем на машине */
function withDisch(fn){
  const w=kid().dw, t=w?w.t:(S.temp||10);
  const keep={temp:S.temp,feels:S.feels,weather:S.weather,live:S.live,ctx:S.ctx,uv:S.uv,wcode:S.wcode};
  Object.assign(S,{live:false,temp:t,feels:t,weather:w&&w.rain>=50?'rain':'cloud',ctx:'car',uv:0,wcode:null});
  try{return fn(t,w);}finally{Object.assign(S,keep);}
}
function dischSet(){
  return withDisch(t=>{
    const b=bandFor(effTemp()), set0=curSet(setsFor(b));
    const it=lookItems(set0.it).slice();
    if(t<=12)it.push(['envelope',t<=0?'тёплый конверт на выписку':'конверт на выписку']);
    return {title:b.title,name:set0.name,it,t};
  });
}
function dischTip(){
  const w=kid().dw, ll=hospLL(), t=w?w.t:null;
  const car=t!=null&&t<=12
    ?'В автолюльку — без конверта и объёмного комбинезона: ремни должны прилегать. Конверт — для фото на крыльце, а в машине укройте пледом поверх ремней.'
    :'В автолюльке ремни должны прилегать — одевайте тонкими слоями, а пледом укройте поверх ремней.';
  const when=!w?'Погода появится, когда выберете роддом или город.'
    :w.src==='hist'?`Погода — по средним за прошлые годы${w.city?' ('+w.city+')':''}. Точный прогноз появится за 2 недели до ПДР — загляните ещё раз за неделю.`
    :'Это прогноз — проверьте ещё раз накануне выписки.';
  return `${when} ${car}`;
}
function paintDischarge(sz){
  dischWeather();
  const w=kid().dw, s=dischSet(), d=dischDate(), h=kid().hosp;
  document.getElementById('tLayers').textContent='выписка';
  const tw=document.getElementById('tWhy');
  tw.innerHTML=`${expecting()?`ПДР ${dueWhen()} · выписка около ${fmtDate(d)}`:`Выписка ${fmtDate(d)}`} · <u onclick="event.stopPropagation();hospOpen()">${h&&h.name?esc2(h.name):'указать роддом'}</u>`;
  document.getElementById('bTitle').textContent='На выписку';
  document.getElementById('bName').textContent=w?`около ${w.t>0?'+':''}${w.t}°${w.src==='hist'?' (обычно)':''}`:'погода уточнится';
  document.getElementById('items').textContent=s.it.map(x=>x[1]).join(' · ');
  const tip=dischTip(); S.tipText=tip; S.whyText=tip;
  const tp=document.getElementById('tipText'); if(tp)tp.textContent=tip;
  const n=withDisch(()=>lookTotal(setsFor(bandFor(effTemp())).length)), cur=S.setIdx%n;
  document.getElementById('setDots').innerHTML=Array.from({length:n},(_,i)=>`<i class="${i===cur?'a':''}"></i>`).join('');
  withDisch(()=>drawStage({name:s.name,it:s.it},sz));
}

/* ---- роддом: поиск по картам (OpenStreetMap), из адреса берём город ---- */
let HOSP_HITS=[], HOSP_T=null;
function hospOpen(){
  const h=kid().hosp; hospClose();
  const scr=document.querySelector('.screen.on')||document.body;
  scr.insertAdjacentHTML('beforeend',`<div id="hospOv" style="position:absolute;inset:0;z-index:60;background:rgba(48,38,30,.38);display:flex;align-items:flex-end" onclick="if(event.target===this)hospClose()">
    <div style="background:#fff;border-radius:26px 26px 0 0;padding:18px 20px 26px;width:100%;box-sizing:border-box;max-height:80%;overflow-y:auto">
    <h3 style="margin:0 0 4px;font-size:17px;font-weight:800;color:var(--ink-strong)">Роддом и роды</h3>
    <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:var(--muted)">По роддому узнаем город и посмотрим погоду на выписку. Можно указать просто город.</p>
    <div class="fld"><span>Роддом или город</span><input id="hospIn" placeholder="например, роддом 25 Москва" value="${esc2(h&&h.name||'')}" autocomplete="off"></div>
    <div id="hospList" style="display:flex;flex-direction:column;gap:6px;margin:8px 0 12px"></div>
    <div style="margin:4px 0 12px">${birthChips()}</div>
    ${h?`<button class="ghost2" onclick="hospClear()">Убрать роддом</button>`:''}
    <button class="ghost2" onclick="hospClose()">Готово</button></div></div>`);
  const inp=document.getElementById('hospIn'); inp.oninput=()=>hospSearch(inp.value); if(inp.value)hospSearch(inp.value);
}
function hospClose(){const o=document.getElementById('hospOv'); if(o)o.remove();}
function hospSearch(q,listId){
  const l=document.getElementById(listId||'hospList'), onScreen=listId==='ohList'; clearTimeout(HOSP_T);
  if(q.trim().length<3){l.innerHTML='';return;}
  l.innerHTML='<div class="pfnote">Ищем…</div>';
  HOSP_T=setTimeout(async()=>{
    let hits=[];
    try{
      const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&accept-language=ru&q='+encodeURIComponent(q));
      hits=(await r.json()).map(x=>{const a=x.address||{};
        return {name:x.name||x.display_name.split(',')[0],city:a.city||a.town||a.village||a.state||'',lat:+(+x.lat).toFixed(3),lon:+(+x.lon).toFixed(3),
          sub:x.display_name.split(',').slice(1,3).join(',').trim()};});
    }catch(e){}
    // не нашлось на картах — хотя бы город
    if(!hits.length)await new Promise(res=>citySearch(q,5,(m,wait)=>{if(!wait){hits=m.map(c=>({name:c.name,city:c.name,lat:c.lat,lon:c.lon,sub:c.sub}));res();}}));
    HOSP_HITS=hits;
    l.innerHTML=hits.map((h,i)=>onScreen
      ?`<button class="crow" onclick="ohPick(${i})"><div style="flex:1"><b>${esc2(h.name)}</b><s>${esc2(h.sub||h.city)}</s></div></button>`
      :`<button class="ghost2" style="text-align:left;padding:8px 14px;height:auto;line-height:1.3" onclick="hospPick(${i})"><b>${esc2(h.name)}</b><br><span style="font-size:12px;color:#A9987F">${esc2(h.sub||h.city)}</span></button>`).join('')
      ||'<div class="pfnote">Не нашлось — попробуйте номер роддома и город или просто город.</div>';
  },450);
}
function hospPick(i){
  const h=HOSP_HITS[i]; if(!h)return;
  kid().hosp=h; kid().dw=null; kidsSave();
  hospClose(); toast(`Роддом: ${h.name}`); dischWeather(true);
  if(S.screen==='prof'&&typeof profPaint==='function')profPaint(); else{paintMain();paintDate();}
}
function hospClear(){ delete kid().hosp; kid().dw=null; kidsSave(); hospClose(); dischWeather(true); if(S.screen==='prof')profPaint(); else paintDate(); }

/* малыш ещё не родился → ПДР; родился → дата рождения */
function pdrStart(){
  delete kid().disch;                                  // снова ждём — выписку считаем от ПДР
  if(!expecting()){const d=new Date();d.setDate(d.getDate()+90);S.dob=locISO(d);}
  if(typeof initDateSync==='function')initDateSync();
  paintDate(); paintMain(); if(S.screen==='prof')profPaint();
}
function pdrBorn(){
  S.dob=todayStr(); const d=new Date();d.setDate(d.getDate()+dischDays()); kid().disch=locISO(d); kid().dw=null; kidsSave();
  toast('Поздравляем! Дату рождения и выписки можно поправить'); if(S.screen==='prof')profPaint(); paintMain();
}

/* ---- для «Плана»: выписка — первым событием ---- */
function dischEvent(){
  if(!dischMode())return null;
  const w=kid().dw, s=dischSet(), h=kid().hosp;
  return {d:dischDate(),type:'birth',title:'Выписка из роддома',pin:true,
    sub:`${h&&h.name?h.name+' · ':''}${w?`около ${w.t>0?'+':''}${w.t}°${w.src==='hist'?', по средним за прошлые годы':''}`:'погода уточнится'}`,
    why:`${expecting()?`ПДР — ${fmtDate(S.dob)}, ${dischWhy()}.`:`Выписка — ${fmtDate(dischDate())}.`} ${dischTip()}`,
    chips:w&&w.src==='hist'?['проверить погоду за неделю']:[], items:s.it.filter(x=>x[0]!=='toy'), size:sizeFor(heightAt(0))};
}

/* ---- шаг знакомства «Где будете рожать?» (после даты, если ждём малыша) ---- */
function ohOpen(){
  go('oH'); const h=kid().hosp, inp=document.getElementById('ohInput'), l=document.getElementById('ohList');
  inp.value=h?h.name:''; inp.oninput=()=>hospSearch(inp.value,'ohList');
  l.innerHTML=(h?`<button class="crow on"><div style="flex:1"><b>${esc2(h.name)}</b><s>${esc2(h.sub||h.city||'')}</s></div></button>`:'')
    +`<div style="background:#fff;border-radius:18px;padding:12px 14px">${birthChips()}</div>`;
}
function ohPick(i){
  const h=HOSP_HITS[i]; if(!h)return;
  kid().hosp=h; kid().dw=null; kidsSave(); dischWeather(true); ohOpen();
}
function ohNext(skip){
  if(O1ADD){O1ADD=false;paintMain();go('main');toast('Малыш добавлен — имя и фото можно указать в профиле');return;}
  if(S.onb){paintMain();go('main');return;}
  go('o2');
}

/* точная дата выписки (после родов) — из профиля */
function dischSetDate(v){ if(!v)return; kid().disch=v; kid().dw=null; kidsSave(); dischWeather(true); paintMain(); if(S.screen==='prof')profPaint(); }
