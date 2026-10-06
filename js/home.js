/* дома и на ночь: одежда по температуре в комнате (по умолчанию +22°), за час до сна — образ на ночь со спальником.
   В праздник вкладка «дома» днём показывает праздничный образ (js/today.js → paintHoliday) */
const homeRoom=()=>{const v=+store.get('mpp-room'); return v>=12&&v<=32?v:22;};
const homeBed=()=>store.get('mpp-bed')||'22:00';
const hm=s=>{const [h,m]=s.split(':').map(Number); return h*60+(m||0);};
const MORNING=7*60;
/* окно сна: за час до укладывания и до 7 утра */
function sleepWindow(d){
  d=d||new Date(); const now=d.getHours()*60+d.getMinutes(), start=hm(homeBed())-60;
  return now>=start||now<MORNING;
}
/* когда начиналось текущее «ночное» и «дневное» окно — чтобы один раз сами переключить вкладку */
function sleepStartTs(){const d=new Date(), s=hm(homeBed())-60, t=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,s);
  if(d.getHours()*60+d.getMinutes()<MORNING)t.setDate(t.getDate()-1); return +t;}
function morningTs(){const d=new Date(); return +new Date(d.getFullYear(),d.getMonth(),d.getDate(),7,0);}
function homeAuto(){
  if(dischMode())return;
  const at=+(store.get('mpp-ctx-at')||0);
  if(sleepWindow()&&S.ctx!=='home'&&at<sleepStartTs())S.ctx='home';                       // вечер: сами открываем «на ночь»
  else if(!sleepWindow()&&S.ctx==='home'&&!holidayToday()&&at<morningTs()&&Date.now()>morningTs())
    S.ctx=store.get('mpp-ctx-out')||'stroller';                                             // утро: обратно к прогулке
}
let HOMEMODE='day';
function homeMode(){ return sleepWindow()?'sleep':(holidayToday()?'hol':'day'); }

/* что надеть дома — по температуре в комнате */
function homeSets(t){
  if(t>=26)return [{name:'в жару дома',it:[['bodyS','боди к/р']]},{name:'майка и шорты',it:[['tank','майка'],['shorts','шорты']]}];
  if(t>=23)return [{name:'полегче',it:[['bodyS','боди к/р'],['footpants','тонкие ползунки']]},{name:'тонкий слип',it:[['slip','тонкий хлопковый слип']]},
                   {name:'боди и шорты',it:[['bodyS','боди к/р'],['shorts','шорты']]}];
  if(t>=20)return [{name:'боди и ползунки',it:[['bodyL','боди д/р'],['footpants','ползунки'],['socks','тонкие носочки']]},
                   {name:'слип',it:[['slip','хлопковый слип']]},{name:'боди и штанишки',it:[['bodyL','боди д/р'],['pants','штанишки'],['socks','носочки']]}];
  if(t>=18)return [{name:'с кофтой',it:[['bodyL','боди д/р'],['pants','штанишки'],['cardigan','тонкая кофта'],['socks','носки']]},
                   {name:'слип из футера',it:[['bodyL','боди д/р'],['slip','слип из футера'],['socks','носки']]}];
  return [{name:'дома прохладно',it:[['bodyL','боди д/р'],['slip','тёплый слип'],['cardigan','кофта'],['socks','тёплые носки']]},
          {name:'вязаный',it:[['bodyL','боди д/р'],['slipKnit','вязаный слип'],['socks','тёплые носки']]}];
}
/* на ночь — по таблице TOG: чем прохладнее в комнате, тем плотнее спальник. Одеяло до года не нужно */
function sleepSets(t){
  if(t>=27)return [{name:'жарко',it:[['bodyS','боди к/р'],['sleepbag','спальник 0,2 TOG или без него']]}];
  if(t>=24)return [{name:'тепло',it:[['bodyS','боди к/р'],['sleepbag','спальник 0,5 TOG']]},{name:'слип',it:[['slip','тонкий слип'],['sleepbag','без спальника или 0,2 TOG']]}];
  if(t>=21)return [{name:'обычно',it:[['bodyL','боди д/р'],['sleepbag','спальник 1 TOG']]},{name:'слип',it:[['slip','хлопковый слип'],['sleepbag','спальник 0,5 TOG']]}];
  if(t>=18)return [{name:'прохладно',it:[['bodyL','боди д/р'],['slip','хлопковый слип'],['sleepbag','спальник 2,5 TOG']]},
                   {name:'слип из футера',it:[['slip','слип из футера'],['sleepbag','спальник 1 TOG']]}];
  if(t>=16)return [{name:'холодно',it:[['bodyL','боди д/р'],['slip','тёплый слип'],['sleepbag','спальник 2,5 TOG'],['socks','носочки']]}];
  return [{name:'очень холодно',it:[['bodyL','боди д/р'],['slip','тёплый слип'],['sleepbag','спальник 3,5 TOG'],['socks','тёплые носки']]}];
}
/* образ считаем «как будто» снаружи комнатная температура: правила по возрасту (newbornFilter) сработают сами */
function withHome(fn){
  const keep={temp:S.temp,feels:S.feels,live:S.live,weather:S.weather,uv:S.uv,wcode:S.wcode};
  const t=homeRoom(); Object.assign(S,{temp:t,feels:t,live:false,weather:'cloud',uv:0,wcode:null});
  try{return fn(t);}finally{Object.assign(S,keep);}
}
function homeList(){ return withHome(t=>(HOMEMODE==='sleep'?sleepSets(t):homeSets(t))); }
function homeCount(){ return homeList().length; }
function paintHome(sz){
  const t=homeRoom(), sets=homeList(), v=S.setIdx%sets.length, s=sets[v];
  const it=withHome(()=>newbornFilter(s.it.map(x=>x.slice()),ageMonthsExact()));
  const sl=HOMEMODE==='sleep';
  document.getElementById('tTemp').textContent=(t>0?'+':'')+t+'°';
  document.getElementById('tPlace').textContent='дома';
  document.getElementById('tFeels').textContent=sl?`сон в ${homeBed()}`:'в комнате';
  // в оранжевой плашке — не название вкладки (оно рядом), а суть: слои дома или плотность спальника
  const tog=(it.find(x=>x[0]==='sleepbag')||[])[1]||'', togN=(tog.match(/[\d,]+ TOG/)||[''])[0];
  const nl=it.filter(x=>!['socks','sleepbag'].includes(x[0])).length;
  document.getElementById('tLayers').textContent=sl&&togN?togN:`${nl} ${nl===1?'слой':'слоя'}`;
  document.getElementById('tWhy').innerHTML=`${sl?'Спать':'Дома'}: в комнате ${t>0?'+':''}${t}° · <u onclick="event.stopPropagation();homeOpen()">изменить</u>`;
  document.getElementById('bTitle').textContent=sl?'На ночь':'Дома';
  document.getElementById('bName').textContent=personize(s.name);
  document.getElementById('items').textContent=it.map(x=>x[1]).join(' · ');
  const tip=sl?`Для сна лучше всего 18–22° в комнате. Шапочка во сне не нужна, вместо одеяла — спальник: он не сползёт на лицо. Проверьте шею сзади: тёплая и сухая — малышу хорошо, влажная — снимите слой.${ageMonthsExact()<3?' Первые месяцы многие спят в пеленании или коконе — по той же плотности.':''}`
    :`Дома малышу нужно столько же слоёв, сколько вам. Ручки и стопы бывают прохладными — это нормально; тепло ли малышу, проверяйте по шее сзади.`;
  S.tipText=personize(tip); S.whyText=`Дома, в комнате ${t>0?'+':''}${t}°`;
  const tp=document.getElementById('tipText'); if(tp)tp.textContent=S.tipText;
  document.getElementById('setDots').innerHTML=sets.length>1?Array.from({length:sets.length},(_,i)=>`<i class="${i===v?'a':''}"></i>`).join(''):'';
  withHome(()=>drawStage({name:s.name,it},sz));
}

/* настройки: температура в комнате и время сна */
function homeOpen(){
  homeClose();
  const scr=document.querySelector('.screen.on')||document.body, t=homeRoom(), bed=homeBed();
  const times=[];for(let m=19*60;m<=23*60+30;m+=30)times.push(`${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`);
  scr.insertAdjacentHTML('beforeend',`<div id="homeOv" style="position:absolute;inset:0;z-index:60;background:rgba(48,38,30,.38);display:flex;align-items:flex-end" onclick="if(event.target===this)homeClose()">
    <div style="background:#fff;border-radius:26px 26px 0 0;padding:18px 20px 26px;width:100%;box-sizing:border-box">
    <h3 style="margin:0 0 4px;font-size:17px;font-weight:800;color:var(--ink-strong)">Дома и сон</h3>
    <p style="margin:0 0 14px;font-size:12px;font-weight:600;color:var(--muted)">По температуре в комнате подберём, что надеть дома и на ночь. За час до сна покажем образ на ночь.</p>
    <div class="fld"><span>В комнате</span><div style="display:flex;align-items:center;gap:10px">
      <button class="ghost2" style="width:40px;height:36px;margin:0;padding:0" onclick="homeSetRoom(-1)">−</button>
      <b id="homeT" style="font-size:18px;min-width:48px;text-align:center">${t>0?'+':''}${t}°</b>
      <button class="ghost2" style="width:40px;height:36px;margin:0;padding:0" onclick="homeSetRoom(1)">+</button></div></div>
    <div class="fld"><span>Укладываем спать</span><select id="homeBedSel" onchange="homeSetBed(this.value)" style="font:inherit;font-weight:800;border:none;background:transparent;color:var(--ink-strong)">
      ${times.map(x=>`<option${x===bed?' selected':''}>${x}</option>`).join('')}</select></div>
    <button class="ghost2" onclick="homeClose()">Готово</button></div></div>`);
}
function homeClose(){const o=document.getElementById('homeOv'); if(o)o.remove();}
function homeSetRoom(d){ const t=Math.max(14,Math.min(30,homeRoom()+d)); try{store.set('mpp-room',String(t));}catch(e){}
  const el=document.getElementById('homeT'); if(el)el.textContent=(t>0?'+':'')+t+'°'; S.setIdx=0; paintMain(); if(S.screen==='prof')profPaint(); }
function homeSetBed(v){ try{store.set('mpp-bed',v);}catch(e){} paintMain(); if(S.screen==='prof')profPaint(); }
