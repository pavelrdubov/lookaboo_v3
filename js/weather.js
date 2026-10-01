/* погода: города, геолокация, прогноз, климат города */
/* --- O2 / O4 --- */
const CITIES=[['Москва','Россия',55.75,37.62],['Санкт-Петербург','Россия',59.94,30.31],['Новосибирск','Россия',55.03,82.92],
['Екатеринбург','Россия',56.84,60.61],['Казань','Россия',55.79,49.11],['Нижний Новгород','Россия',56.33,44.00],
['Краснодар','Россия',45.04,38.98],['Сочи','Россия',43.60,39.73],['Калининград','Россия',54.71,20.51],
['Ереван','Армения',40.18,44.51],['Тбилиси','Грузия',41.72,44.78],['Алматы','Казахстан',43.24,76.89],
['Минск','Беларусь',53.90,27.56],['Белград','Сербия',44.79,20.45],['Дубай','ОАЭ',25.20,55.27]];
function initCity(){
  const inp=document.getElementById('cityInput');
  inp.oninput=()=>renderCities(inp.value);
  renderCities('');
}
function renderCities(q){
  const l=document.getElementById('cityList');
  const list=CITIES.filter(c=>c[0].toLowerCase().startsWith(q.trim().toLowerCase())).slice(0,6);
  l.innerHTML=list.map(c=>`<button class="crow" onclick="pickCity('${c[0]}',${c[2]},${c[3]})">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex:none"><path d="M12 2c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill="${c[0]===S.city?'var(--accent)':'#D8C9B4'}"></path><circle cx="12" cy="9" r="2.6" fill="#FFF6EF"></circle></svg>
    <div style="flex:1"><b>${c[0]}</b><s>${c[1]}</s></div></button>`).join('')
    || `<div style="font-size:13px;font-weight:700;color:#A9987F;padding:8px 4px">Ничего не нашлось — проверьте написание.</div>`;
}
async function pickCity(name,lat,lon){
  S.city=name;store.set('mpp-city',name);
  S.geo='город';store.set('mpp-geo','0');store.set('mpp-ll',lat+','+lon);
  const ci=document.getElementById('cityInput'); if(ci)renderCities(ci.value);
  if(typeof profPaint==='function'&&S.screen==='prof')profPaint(); else finish();
  await fetchWeather(lat,lon,true);}

function askGeo(){
  const b=document.getElementById('geoBtn');b.textContent='Ищем погоду…';
  if(NATIVE && nativeLoc()){ finish(); b.textContent='Разрешить и показать набор'; return; }
  if(!navigator.geolocation){b.textContent='Разрешить и показать набор';go('o4');return;}
  navigator.geolocation.getCurrentPosition(
    p=>{fetchWeather(p.coords.latitude,p.coords.longitude);b.textContent='Разрешить и показать набор';finish();},
    ()=>{b.textContent='Разрешить и показать набор';go('o4');},
    {timeout:8000});
}
/* как называется место, где мы взяли погоду — иначе непонятно, туда ли попали */
async function reverseGeo(lat,lon){
  try{
    const ctl=new AbortController(); const tm=setTimeout(()=>ctl.abort(),7000);
    const r=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat
      +'&longitude='+lon+'&localityLanguage=ru',{signal:ctl.signal});
    clearTimeout(tm);
    const j=await r.json();
    const n=j.city||j.locality||j.principalSubdivision;
    if(n){S.city=String(n).replace(/^городской округ\s+/i,'');store.set('mpp-city',S.city);}
  }catch(e){}
  S.geo='гео'; store.set('mpp-geo','1');
  paintMain();
}
async function fetchWeather(lat,lon,skipGeo){
  S.wx='loading';paintMain();
  S.lat=lat;S.lon=lon;
  try{store.set('mpp-ll',lat+','+lon);}catch(e){}
  if(!skipGeo)reverseGeo(lat,lon);
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      +`&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code`
      +`&wind_speed_unit=ms&timezone=auto`;
    const ctl=new AbortController(); const tm=setTimeout(()=>ctl.abort(),9000);
    const r=await fetch(u,{signal:ctl.signal}); clearTimeout(tm);
    if(!r.ok)throw new Error('HTTP '+r.status);
    const j=await r.json(); const c=j&&j.current;
    if(!c||typeof c.temperature_2m!=='number')throw new Error('нет данных');
    S.temp=Math.round(c.temperature_2m);
    S.feels=Math.round(c.apparent_temperature);
    S.wind=Math.round(c.wind_speed_10m);
    S.weather=codeToScene(c.weather_code,S.temp);
    S.live=true; S.wx='live';
    const tr=document.getElementById('trange'); if(tr)tr.value=S.temp;
    const tl=document.getElementById('tLabel'); if(tl)tl.textContent=(S.temp>0?'+':'')+S.temp+'°';
  }catch(e){ S.live=false; S.wx='fail'; S.wxErr='Погодный сервис недоступен с этой страницы'; }
  paintMain();
}
const NATIVE = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native);
window.__setLoc = (lat,lon)=>fetchWeather(lat,lon);
window.__locFailed = ()=>{ S.wx='fail'; paintMain(); };
function nativeLoc(){ try{ window.webkit.messageHandlers.native.postMessage('loc'); return true; }catch(e){ return false; } }

async function retryWeather(){
  if(NATIVE && nativeLoc()){ S.wx='loading'; paintMain(); return; }
  if(!navigator.geolocation){go('o4');return;}
  S.wx='loading';paintMain();
  navigator.geolocation.getCurrentPosition(
    p=>fetchWeather(p.coords.latitude,p.coords.longitude),
    err=>{S.wx='fail';S.wxErr=err&&err.code===1?'Геопозиция запрещена в настройках':'Не удалось определить геопозицию';paintMain();},
    {timeout:9000});
}
function codeToScene(code,t){
  if([71,73,75,77,85,86].includes(code))return 'snow';
  if([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code))return 'rain';
  if([0,1].includes(code))return t<=-3?'frost':(t>=17?'sun':'cloud');
  return 'cloud';
}

/* ==== климатология города: когда обычно наступает сезон, по истории ==== */
const CLIMO={};
function climoKey(){return (S.lat!=null&&S.lon!=null)?S.lat.toFixed(2)+','+S.lon.toFixed(2):null;}
function doyOf(dt){return Math.floor((dt-new Date(dt.getFullYear(),0,0))/MS);}
function futureFromDoy(doy){
  const today=new Date(todayStr()), y=today.getFullYear();
  let d=new Date(y,0,doy); if(d<today)d=new Date(y+1,0,doy); return d;
}
async function climoFetch(){
  const key=climoKey(); if(!key||(CLIMO[key]&&(CLIMO[key].ready||CLIMO[key].loading)))return;
  CLIMO[key]={loading:true};
  try{
    const y=new Date().getFullYear();
    const rs=await Promise.all([1,2,3].map(k=>
      fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${S.lat}&longitude=${S.lon}&start_date=${y-k}-01-01&end_date=${y-k}-12-31&daily=temperature_2m_mean&timezone=auto`)
        .then(r=>r.json()).catch(()=>null)));
    const sum=new Array(367).fill(0), cnt=new Array(367).fill(0);
    rs.forEach(j=>{if(j&&j.daily&&j.daily.time)j.daily.time.forEach((t,i)=>{
      const dt=new Date(t), doy=doyOf(dt), v=j.daily.temperature_2m_mean[i];
      if(v!=null&&doy>=1&&doy<=366){sum[doy]+=v;cnt[doy]++;}});});
    if(!cnt.some(c=>c>0))throw 0;
    let mean=new Array(367).fill(null);
    for(let i=1;i<=366;i++)mean[i]=cnt[i]?sum[i]/cnt[i]:null;
    for(let i=1;i<=366;i++)if(mean[i]==null)mean[i]=mean[i-1]!=null?mean[i-1]:(mean[i+1]||0);
    const sm=new Array(367).fill(0);
    for(let i=1;i<=366;i++){let a=0,n=0;for(let k=-5;k<=5;k++){const j=((i-1+k+366)%366)+1;if(mean[j]!=null){a+=mean[j];n++;}}sm[i]=n?a/n:0;}
    CLIMO[key]={ready:true,mean:sm};
  }catch(e){CLIMO[key]={fail:true};}
  if(S.screen==='tl')tlRender();
}
/* порог среднесуточной, направление, месяц старта поиска (0-инд), запас на покупку, тип разгара */
const SEASON_RULE={
  'Готовность к зиме': {thr:0,  dir:'down', start:7, lead:28, peak:'cold'},
  'Готовность к весне':{thr:6,  dir:'up',   start:1, lead:21, peak:'onset'},
  'Готовность к лету': {thr:18, dir:'up',   start:3, lead:21, peak:'warm'},
  'Готовность к осени':{thr:12, dir:'down', start:6, lead:21, peak:'onset'}
};
function climoSeason(name){
  const key=climoKey(), c=key&&CLIMO[key]; if(!c||!c.ready)return null;
  const r=SEASON_RULE[name]; if(!r)return null;
  const m=c.mean, startDoy=doyOf(new Date(2001,r.start,1));
  // переход через порог в окне от старта поиска
  let cross=null;
  for(let k=0;k<300;k++){const doy=((startDoy-1+k)%366)+1;const v=m[doy];
    if(r.dir==='down'&&v<=r.thr){cross=doy;break;} if(r.dir==='up'&&v>=r.thr){cross=doy;break;}}
  // разгар: холод/жара — глобальный экстремум года (работает и для мягкого климата); переходные — точка перехода
  let peakDoy;
  if(r.peak==='cold'||r.peak==='warm'){peakDoy=1;let bv=m[1];
    for(let d=2;d<=366;d++){const v=m[d];if(r.peak==='cold'?v<bv:v>bv){bv=v;peakDoy=d;}}}
  else{ if(cross==null)return null; peakDoy=cross; }
  const onsetDoy = cross!=null ? cross : ((peakDoy-31+366)%366)+1;
  const onset=futureFromDoy(onsetDoy), today=new Date(todayStr());
  let card=new Date(onset); card.setDate(card.getDate()-r.lead); if(card<today)card=today;
  let peak=futureFromDoy(peakDoy); if(peak<onset)peak=new Date(onset);
  return {card:locISO(card),onset:locISO(onset),peak:locISO(peak),
          peakT:Math.round(m[peakDoy]),onsetT:cross!=null?Math.round(m[cross]):null};
}
