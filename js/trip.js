/* поездка */
/* ================= ПОЕЗДКА ================= */
function blankTrip(){return{id:null,city:null,lat:null,lon:null,from:null,to:null,w:null,
  mode:'form',src:'',done:{},wish:{},manual:null};}
let TRIPS=[]; let TRIP=blankTrip();
(function(){try{const a=JSON.parse(store.get('mpp-trips')||'[]');if(Array.isArray(a))TRIPS=a;}catch(e){}})();
function tripSave(){
  if(TRIP.id){const i=TRIPS.findIndex(t=>t.id===TRIP.id);if(i>=0)TRIPS[i]=TRIP;else TRIPS.push(TRIP);}
  try{store.set('mpp-trips',JSON.stringify(TRIPS));}catch(e){}
}
function tripNew(){TRIP=blankTrip();go('trip');}
function tripOpen(id){const t=TRIPS.find(x=>x.id===id);if(t){TRIP=t;TRIP.mode='result';go('trip');}}
function tripDel(){if(!confirm(`Удалить поездку в ${TRIP.city} из плана? Вещи из неё останутся в вишлисте.`))return;tripDrop(TRIP.id);go('tl');toast('Поездка удалена');}
function tripDrop(id){TRIPS=TRIPS.filter(t=>t.id!==id);try{store.set('mpp-trips',JSON.stringify(TRIPS));}catch(e){}tlRender();}

function fmtD(d){const x=new Date(d);return x.getDate()+' '+['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][x.getMonth()];}
function daysBetween(a,b){return Math.max(1,Math.round((new Date(b)-new Date(a))/MS)+1);}

function tripForm(){
  const d1=new Date();d1.setDate(d1.getDate()+30);
  const d2=new Date();d2.setDate(d2.getDate()+37);
  if(!TRIP.from)TRIP.from=locISO(d1);
  if(!TRIP.to)TRIP.to=locISO(d2);
  document.getElementById('tripH').textContent='Поездка';
  document.getElementById('tripSub').textContent='соберём малышу чемодан';
  document.getElementById('tripBody').innerHTML=`
    <div class="card">
      <h3>Куда и когда едете?</h3>
      <div class="sub">Посчитаем погоду на эти даты, размер малыша к поездке — и соберём список.</div>
      <div class="fld"><span>Город</span><input id="tCity" placeholder="Например, Ереван" value="${TRIP.city||''}"></div>
      <div id="tCityList"></div>
      <div class="fld tapfld" onclick="calToggle()"><span>Даты</span><b id="tDates">${calLabel()}</b></div>
      <div id="calWrap" style="display:none"></div>
      <button id="tripCta" onclick="tripBuild()">Собрать список</button>
    </div>`;
  const inp=document.getElementById('tCity');
  inp.oninput=()=>{
    const q=inp.value.trim().toLowerCase();
    const l=document.getElementById('tCityList');
    if(!q){l.innerHTML='';return;}
    const m=CITIES.filter(c=>c[0].toLowerCase().startsWith(q)).slice(0,4);
    l.innerHTML=m.map(c=>`<button class="ghost2" style="text-align:left;padding:0 14px" onclick="tripPick('${c[0]}',${c[2]},${c[3]})">${c[0]} · ${c[1]}</button>`).join('');
  };
}
function tripPick(name,lat,lon){
  TRIP.city=name;TRIP.lat=lat;TRIP.lon=lon;
  document.getElementById('tCity').value=name;
  document.getElementById('tCityList').innerHTML='';
}

/* ---- календарь-диапазон: туда→обратно за один проход ---- */
function plur(n,a,b,c){n=Math.abs(n)%100;const n1=n%10;
  if(n>10&&n<20)return c; if(n1>1&&n1<5)return b; if(n1===1)return a; return c;}
function calLabel(){
  if(!TRIP.from||!TRIP.to)return 'выбрать';
  const n=daysBetween(TRIP.from,TRIP.to);
  return `${fmtD(TRIP.from)} → ${fmtD(TRIP.to)} · ${n} ${plur(n,'день','дня','дней')}`;
}
let CAL={y:0,m:0,s:null,e:null};
function calToggle(){
  const w=document.getElementById('calWrap');
  if(w.style.display==='none'){
    const d=new Date(TRIP.from||todayStr());
    CAL={y:d.getFullYear(),m:d.getMonth(),s:TRIP.from||null,e:TRIP.to||null};
    calRender(); w.style.display='block';
  }else w.style.display='none';
}
function calTap(iso){
  if(!CAL.s||(CAL.s&&CAL.e)){CAL.s=iso;CAL.e=null;}   // начинаем новый диапазон
  else if(iso<CAL.s){CAL.s=iso;}                        // ткнули раньше — новое начало
  else{CAL.e=iso;}                                      // конец диапазона
  calRender();
}
function calNav(d){CAL.m+=d;if(CAL.m<0){CAL.m=11;CAL.y--;}if(CAL.m>11){CAL.m=0;CAL.y++;}calRender();}
function calDone(){
  if(!(CAL.s&&CAL.e))return;
  TRIP.from=CAL.s;TRIP.to=CAL.e;
  document.getElementById('tDates').textContent=calLabel();
  document.getElementById('calWrap').style.display='none';
}
function calRender(){
  const wk=['пн','вт','ср','чт','пт','сб','вс'];
  const mn=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const first=new Date(CAL.y,CAL.m,1), off=(first.getDay()+6)%7;      // пн-первый
  const dim=new Date(CAL.y,CAL.m+1,0).getDate(), tstr=todayStr();
  let cells='';
  for(let i=0;i<off;i++)cells+='<span class="cald off"></span>';
  for(let d=1;d<=dim;d++){
    const iso=`${CAL.y}-${String(CAL.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cl='cald';
    if(iso<tstr)cl+=' off';
    else if(CAL.s&&CAL.e){if(iso===CAL.s)cl+=' start';else if(iso===CAL.e)cl+=' end';else if(iso>CAL.s&&iso<CAL.e)cl+=' in';}
    else if(iso===CAL.s)cl+=' start';
    cells+=`<span class="${cl}" ${iso<tstr?'':`onclick="calTap('${iso}')"`}>${d}</span>`;
  }
  const ok=CAL.s&&CAL.e, n=ok?daysBetween(CAL.s,CAL.e):0;
  document.getElementById('calWrap').innerHTML=
    `<div class="calhd"><button type="button" onclick="calNav(-1)">‹</button><b>${mn[CAL.m]} ${CAL.y}</b><button type="button" onclick="calNav(1)">›</button></div>`
    +`<div class="calwk">${wk.map(w=>`<span>${w}</span>`).join('')}</div>`
    +`<div class="calgd">${cells}</div>`
    +`<div class="calfoot"><span>${ok?`${n} ${plur(n,'день','дня','дней')}`:(CAL.s?'выберите дату «обратно»':'выберите «туда» и «обратно»')}</span>`
    +`<button type="button" class="caldone" ${ok?'':'disabled'} onclick="calDone()">Готово</button></div>`;
}

async function tripBuild(){
  const f=TRIP.from, t=TRIP.to;
  if(!TRIP.city||!TRIP.lat){document.getElementById('tCity').focus();return;}
  if(!f||!t||t<f){toast('Выберите даты туда и обратно');return;}
  TRIP.from=f;TRIP.to=t;
  document.getElementById('tripCta').textContent='Смотрим погоду…';
  TRIP.w=await tripWeather();
  if(!TRIP.id)TRIP.id=Date.now();
  TRIP.mode='result';tripSave();tripRender();
}

async function tripWeather(){
  const days=Math.round((new Date(TRIP.from)-new Date())/MS);
  try{
    if(days<=15){
      const u=`https://api.open-meteo.com/v1/forecast?latitude=${TRIP.lat}&longitude=${TRIP.lon}`
        +`&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,wind_speed_10m_max`
        +`&wind_speed_unit=ms&timezone=auto&start_date=${TRIP.from}&end_date=${TRIP.to}`;
      const j=await (await fetch(u)).json();
      TRIP.src='прогноз';
      return summarise(j.daily);
    }
    const y=new Date(TRIP.from).getFullYear();
    const reqs=[1,2,3].map(k=>{
      const a=TRIP.from.replace(String(y),String(y-k)), b=TRIP.to.replace(String(y),String(y-k));
      return fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${TRIP.lat}&longitude=${TRIP.lon}`
        +`&start_date=${a}&end_date=${b}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`)
        .then(r=>r.json());
    });
    const rs=await Promise.all(reqs);
    const merged={temperature_2m_max:[],temperature_2m_min:[],precipitation_sum:[]};
    rs.forEach(j=>{if(j&&j.daily)for(const k in merged)merged[k]=merged[k].concat(j.daily[k]||[]);});
    if(!merged.temperature_2m_max.length)throw 0;
    TRIP.src='по средним за прошлые годы';
    return summarise(merged);
  }catch(e){TRIP.src='manual';return null;}
}
function summarise(d){
  const cl=a=>(a||[]).filter(x=>typeof x==='number');
  const mx=cl(d.temperature_2m_max), mn=cl(d.temperature_2m_min), pr=cl(d.precipitation_sum);
  const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
  return {tmax:Math.round(Math.max(...mx)), tmin:Math.round(Math.min(...mn)),
    amax:Math.round(avg(mx)), amin:Math.round(avg(mn)),
    rain:pr.length?Math.round(pr.filter(x=>x>=1).length/pr.length*100):0,
    uv:d.uv_index_max?Math.round(Math.max(...cl(d.uv_index_max))):null};
}

/* ---- сборка списка ---- */
const QTY={bodyL:1.4,bodyS:1.4,bodyT:1.2,slip:0.8,wrap:1,wrapbody:1.2,footpants:0.8,
  pants:0.6,shorts:0.6,socks:1,muslin:0.3,dress:0.5,romper:0.5,tank:1};
const CAP={bodyL:9,bodyS:9,bodyT:7,slip:5,wrap:6,wrapbody:7,footpants:5,pants:4,shorts:4,
  socks:7,muslin:3,dress:3,romper:3,tank:6};
function qtyFor(key,days){
  if(QTY[key]===undefined)return 1;
  const eff=Math.min(days,5);            // дольше пяти дней — считаем, что бельё стирают
  return Math.max(1,Math.min(CAP[key]||6,Math.ceil(eff*QTY[key])));
}
function tripAgeMonths(){const d0=new Date(S.dob),d1=new Date(TRIP.from);return Math.max(0,(d1-d0)/MS/MDAYS);}
function tripSize(){return sizeFor(heightAt(tripAgeMonths()));}

function tripItems(){
  const w=TRIP.w||TRIP.manual;
  const days=daysBetween(TRIP.from,TRIP.to);
  const effHi=Math.round(w.amax-3), effLo=Math.round(w.amin-3);
  const bands=BANDS.filter(b=>{
    const lo=BANDS.indexOf(b)===0?-99:BANDS[BANDS.indexOf(b)-1].max+1;
    return !(b.max<effLo||lo>effHi);
  });
  const seen={},out=[];
  const m=ageMonths();
  bands.forEach(b=>{
    const l=b.sets.filter(x=>(!x.only||x.only===S.gender)&&(!x.min||m>=x.min)&&(!x.max||m<=x.max));
    (l[0]||b.sets[0]).it.forEach(([k,label])=>{
      if(k==='toy')return;
      if(seen[k])return;
      seen[k]=1;out.push([k,label]);
    });
  });
  const road=[['bodyL','боди на смену'],['slip','слип в дорогу'],['muslin','муслин'],
    ['cardigan','кофта — в самолёте прохладно'],['toy','грызунок']];
  const extra=[];
  if(w.rain>=25)extra.push(['ovDemi','запасной верхний слой — дожди']);
  if(w.uv&&w.uv>=5)extra.push(['panama','панамка']);
  return {days, road, main:out, extra};
}

function tripRender(){
  if(TRIP.mode!=='result'||!(TRIP.w||TRIP.manual)){tripForm();return;}
  const w=TRIP.w||TRIP.manual, I=tripItems(), sz=tripSize();
  const am=tripAgeMonths(), mm=Math.round(am);
  document.getElementById('tripH').textContent=TRIP.city;
  document.getElementById('tripSub').textContent=`${fmtD(TRIP.from)} — ${fmtD(TRIP.to)} · ${I.days} ${I.days===1?'день':(I.days<5?'дня':'дней')}`;

  const row=(k,label,qty,sect)=>{
    const id=sect+':'+k;
    const on=TRIP.done[id]?' on':'';
    const inW=TRIP.wish[id]?' in':'';
    /* если гардероб отмечен — сразу видно, чего не хватит на поездку */
    const have=wdHave(k,sz);
    const lack=have!=null&&have<qty;
    const note=lack?`<s style="display:block;text-decoration:none;font-size:10px;font-weight:800;color:#B0705A;margin-top:2px">${have?`есть ${have} из ${qty} — добрать ${qty-have}`:`нет в ${sz}`}</s>`:'';
    return `<div class="item${on}" id="it-${btoa(unescape(encodeURIComponent(id))).replace(/=/g,'')}">
      <div class="bx" onclick="tripTick('${id}')">${TRIP.done[id]?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"></path></svg>':''}</div>
      <div class="nm">${label}${note}</div>
      <div class="qt">${qty>1?'×'+qty:''}</div>
      <button class="add${inW}" onclick="tripWish('${id}','${label.replace(/'/g,"")}','${k}')" title="в вишлист">${TRIP.wish[id]?'♥':'+'}</button>
    </div>`;
  };

  const wishKeys=Object.keys(TRIP.wish);
  const buyBy=new Date(TRIP.from);buyBy.setDate(buyBy.getDate()-5);

  document.getElementById('tripBody').innerHTML=`
    <div class="card">
      <h3>Погода в поездке</h3>
      <div class="wrow">
        <div class="wtile"><b>${w.amin>0?'+':''}${w.amin}°</b><s>НОЧЬЮ</s></div>
        <div class="wtile"><b>${w.amax>0?'+':''}${w.amax}°</b><s>ДНЁМ</s></div>
        <div class="wtile"><b>${w.rain}%</b><s>ДНЕЙ С ДОЖДЁМ</s></div>
      </div>
      <div class="sub" style="margin-top:9px">Разброс ${w.tmin>0?'+':''}${w.tmin}…${w.tmax>0?'+':''}${w.tmax}°${w.uv?' · УФ до '+w.uv:''}. Малышу это как ${w.amax-3>0?'+':''}${w.amax-3}° днём — он лежит в коляске.</div>
      <span class="tag" style="background:${TRIP.src==='прогноз'?'#DDEAD8':'#F2E4CC'};color:#6B5540">${TRIP.src==='прогноз'?'точный прогноз':TRIP.src}</span>
    </div>

    <div class="card">
      <h3>Размер к поездке${szI(sz)}</h3>
      <div class="sub">${personize('Малышу будет')} ${mm} ${monthsWord(mm)} — берите размер <b>${sz}</b>, а не тот, что впору сейчас.</div>
    </div>

    <div class="sect">В ДОРОГУ — В РУЧНУЮ КЛАДЬ</div>
    ${I.road.map(([k,l])=>row(k,l,k==='bodyL'?2:1,'road')).join('')}

    <div class="sect">ГАРДЕРОБ НА МЕСТЕ</div>
    ${I.days>5?'<div class="sub" style="margin:-2px 4px 8px">Количества — из расчёта, что бельё за поездку хотя бы раз постирают.</div>':''}
    ${I.main.map(([k,l])=>row(k,l+(INSKEYS.includes(k)?' '+insFor(Math.round((TRIP.w||TRIP.manual).amin-3)).g:'')+(()=>{const s=sizeForItem(k,tripAgeMonths(),sz);return s?' · '+szTxt(s):'';})(),qtyFor(k,I.days),'main')).join('')}

    ${I.extra.length?`<div class="sect">ОТДЕЛЬНО ДЛЯ ЭТОЙ ПОГОДЫ</div>`+I.extra.map(([k,l])=>row(k,l,1,'extra')).join(''):''}

    ${wishKeys.length?`<div class="sect">ВИШЛИСТ — КУПИТЬ ДО ${fmtD(buyBy).toUpperCase()}</div>`+
      wishKeys.map(id=>`<div class="item wish"><div class="nm">${TRIP.wish[id]}</div>
        <button class="add" onclick="tripUnwish('${id}')">×</button></div>`).join(''):''}

    <button class="ghost2" onclick="TRIP.mode='form';tripSave();tripRender()">Изменить поездку</button>
    ${TRIPS.some(t=>t.id===TRIP.id)?`<button class="ghost2" style="color:#C06A4A;border-color:#E8CBBF" onclick="tripDel()">Удалить поездку</button>`:''}
    <div style="height:10px"></div>`;
}
function tripTick(id){TRIP.done[id]=!TRIP.done[id];tripSave();tripRender();}
function tripWish(id,label,key){
  const gid='trip'+(TRIP.id||0)+':'+id;
  if(TRIP.wish[id]){delete TRIP.wish[id];delete WISH[gid];}
  else{
    TRIP.wish[id]=label;
    WISH[gid]={label:label.split(' · ')[0],size:sizeForItem(key,tripAgeMonths(),tripSize()),src:'Поездка · '+TRIP.city,
      img:pickImg(key)||null,key:key,keep:true};
  }
  wishSave();tripSave();tripRender();
}
function tripUnwish(id){delete TRIP.wish[id];delete WISH['trip'+(TRIP.id||0)+':'+id];wishSave();tripSave();tripRender();}
