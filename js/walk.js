/* время прогулки: «сейчас» или через пару часов — образ собирается по почасовому прогнозу.
   Лучшее время отмечаем ★: без дождя, при низком УФ, ближе к комфортной температуре, при светлом времени */
let WALK=null;            // null — сейчас; иначе индекс часа в S.hourly
let WNOW=null;            // погода «сейчас», чтобы вернуться
function walkSaveNow(){
  WNOW={temp:S.temp,feels:S.feels,wind:S.wind,gust:S.gust,wcode:S.wcode,uv:S.uv,weather:S.weather};
  if(WALK!=null&&!walkSlots().some(s=>s.i===WALK))WALK=null;            // выбранный час уже прошёл
  if(WALK!=null)walkApply(WALK);
}
const pad2=n=>String(n).padStart(2,'0');
function hourKey(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}`;}
/* слоты: сейчас, дальше каждые 2 часа до 20:00; поздно вечером — завтра утром и днём */
function walkSlots(){
  const H=S.hourly; if(!H||!H.time)return [];
  const now=new Date(), nk=hourKey(now), t=H.time.map(x=>x.slice(0,13));
  const cur=t.indexOf(nk); if(cur<0)return [];
  const out=[{i:cur,label:'сейчас'}], today=nk.slice(0,10);
  for(let i=cur+1;i<t.length&&t[i].slice(0,10)===today;i++){const h=+t[i].slice(11,13); if(h%2===0&&h>=8&&h<=20)out.push({i,label:h+':00'});}
  if(out.length<3)for(let i=cur+1;i<t.length;i++){const h=+t[i].slice(11,13); if(t[i].slice(0,10)!==today&&[9,12,15].includes(h))out.push({i,label:'завтра '+h+':00'});}
  return out.slice(0,6);
}
function walkScore(i){
  const H=S.hourly, g=(k,d)=>(H[k]&&H[k][i]!=null)?H[k][i]:d;
  const f=g('apparent_temperature',g('temperature_2m',15)), pp=g('precipitation_probability',0), pr=g('precipitation',0),
        uv=g('uv_index',0), wind=g('wind_speed_10m',0), day=g('is_day',1);
  let s=0; if(!day)s-=5;
  s-=pp/20+pr*3;
  const uvm=uvMatters(uv,g('weather_code',3))?uv:0;
  s-=uvm>=8?4:uvm>=6?2.5:uvm>=3?(ageMonthsExact()<6?1:.5):0;   // до полугода без крема — УФ важнее; при облаках умеренный УФ не считаем
  s-=Math.abs(f-18)/6;                                  // в холод теплее лучше, в жару — прохладнее
  s-=Math.max(0,wind-6)/3;
  return s;
}
function walkWhy(i){
  // температура — та же, что в шапке (воздух), а не «ощущается как»
  const H=S.hourly, g=k=>H[k]?H[k][i]:null, f=Math.round(g('temperature_2m')??g('apparent_temperature')), pp=g('precipitation_probability')||0, uv=Math.round(g('uv_index')||0);
  const r=[`${f>0?'+':''}${f}°`]; r.push(pp<20?'без дождя':`дождь ${pp}%`);
  if(uvMatters(uv,g('weather_code')))r.push('УФ '+uv); else if(g('is_day')&&sunnyCode(g('weather_code')))r.push('солнце мягкое');
  return r.join(', ');
}
function walkBest(){const sl=walkSlots(); if(sl.length<2)return null; let b=sl[0]; sl.forEach(s=>{if(walkScore(s.i)>walkScore(b.i)+.3)b=s;}); return b;}
function walkApply(i){
  const H=S.hourly, g=(k,d)=>(H[k]&&H[k][i]!=null)?H[k][i]:d;
  S.temp=Math.round(g('temperature_2m',S.temp)); S.feels=Math.round(g('apparent_temperature',S.temp));
  S.wind=Math.round(g('wind_speed_10m',S.wind)); S.gust=Math.round(g('wind_gusts_10m',S.gust||0));
  S.wcode=g('weather_code',S.wcode); S.uv=Math.round(g('uv_index',0)); S.weather=codeToScene(S.wcode,S.temp);
}
function walkPick(i){
  const sl=walkSlots(), s=sl.find(x=>x.i===i);
  if(!s||s.label==='сейчас'){WALK=null; if(WNOW)Object.assign(S,WNOW);} else {WALK=i; walkApply(i);}
  S.setIdx=0; paintMain();
}
/* строка над образом + приписка в шапке и в совете */
function walkPaint(){
  const row=document.getElementById('walkRow'); if(!row)return;
  const sl=(S.live&&S.ctx!=='home'&&!(typeof dischMode==='function'&&dischMode()))?walkSlots():[];
  if(sl.length<2){row.innerHTML='';return;}
  const best=walkBest(), cur=WALK==null?sl[0].i:WALK;
  row.innerHTML='<span>гуляем</span>'+sl.map(s=>`<button class="${s.i===cur?'on':''}${best&&s.i===best.i?' best':''}" onclick="walkPick(${s.i})">${s.label}</button>`).join('');
  const on=row.querySelector('button.on')||row.querySelector('button.best'); if(on&&on.offsetLeft>row.clientWidth-60)row.scrollLeft=on.offsetLeft-row.clientWidth/2;
  if(best){const lab=best.label==='сейчас'?'сейчас':(best.label.startsWith('завтра')?best.label:'в '+best.label);
    S.tipText=`★ Лучше гулять ${lab}: ${walkWhy(best.i)}. `+(S.tipText||'');
    const tp=document.getElementById('tipText'); if(tp)tp.textContent=S.tipText;}
  if(WALK!=null){const s=sl.find(x=>x.i===WALK), tf=document.getElementById('tFeels'); if(s&&tf)tf.textContent+=` · ${s.label.startsWith('завтра')?s.label:'в '+s.label}`;}
}
