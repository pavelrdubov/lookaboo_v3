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
/* почему это время лучше, чем сейчас: называем то, что реально отличается */
function walkWhy(i,cur){
  const H=S.hourly, g=(k,x)=>H[k]?H[k][x]:null;
  const t=x=>Math.round(g('temperature_2m',x)??g('apparent_temperature',x)), pp=x=>g('precipitation_probability',x)||0,
        uv=x=>{const u=Math.round(g('uv_index',x)||0); return uvMatters(u,g('weather_code',x))?u:0;}, wd=x=>g('wind_speed_10m',x)||0;
  const T=t(i), r=[];
  if(pp(cur)>=30&&pp(i)<20)r.push(`без дождя (сейчас ${pp(cur)}%)`);
  else if(pp(i)>=20)r.push(`дождь всего ${pp(i)}%`);
  const dt=T-t(cur);
  if(Math.abs(dt)>=2)r.push(T<18?`теплее: ${T>0?'+':''}${T}° вместо ${t(cur)>0?'+':''}${t(cur)}°`:(dt<0?`прохладнее: +${T}° вместо +${t(cur)}°`:`${T>0?'+':''}${T}°`));
  if(uv(cur)>=3&&uv(i)<uv(cur))r.push(uv(i)>=3?`УФ ниже (${uv(i)})`:'солнце уже мягкое');
  if(wd(cur)-wd(i)>=3)r.push('ветер тише');
  if(!g('is_day',cur)&&g('is_day',i))r.push('ещё светло');
  if(!r.length)r.push(`${T>0?'+':''}${T}°`);
  return r.join(', ');
}
/* хорошие промежутки (★): светло, без дождя, без высокого УФ и сильного ветра — и не сильно хуже лучшего часа дня
   (утром холоднее, чем днём, — значит, днём и звёзды). Хоть одна звёздочка есть всегда: в плохой день — наименее плохое время */
function walkGood(){
  const sl=walkSlots(), H=S.hourly; if(sl.length<2)return [];
  const g=(k,i)=>H[k]?H[k][i]:null;
  const sc=sl.map(x=>walkScore(x.i)), top=Math.max(...sc);
  const ok=sl.filter((x,n)=>{ const pp=g('precipitation_probability',x.i)||0, uv=Math.round(g('uv_index',x.i)||0),
      uvm=uvMatters(uv,g('weather_code',x.i))?uv:0, day=g('is_day',x.i)!==0, wd=g('wind_speed_10m',x.i)||0;
    return day&&pp<30&&uvm<6&&wd<10&&sc[n]>=top-.7; });   // .7 ≈ 4° разницы с лучшим часом
  return ok.length?ok:[sl[sc.indexOf(top)]];
}
/* «10:00, 12:00, 14:00» → «с 10:00 до 14:00», если идут подряд */
function walkRange(list,sl){
  const idx=list.map(x=>sl.findIndex(y=>y.i===x.i)), parts=[]; let a=0;
  for(let k=1;k<=idx.length;k++){ if(k===idx.length||idx[k]!==idx[k-1]+1){ const f=list[a],l=list[k-1];
    parts.push(a===k-1?(f.label==='сейчас'?'сейчас':'в '+f.label):(f.label==='сейчас'?`сейчас и до ${l.label}`:`с ${f.label} до ${l.label}`)); a=k; } }
  return parts.join(' и ');
}
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
  const good=walkGood(), gi=good.map(x=>x.i), cur=WALK==null?sl[0].i:WALK, H=S.hourly;
  row.innerHTML='<span>гуляем</span>'+sl.map(s=>`<button class="${s.i===cur?'on':''}${gi.includes(s.i)?' best':''}" onclick="walkPick(${s.i})">${s.label}</button>`).join('');
  const on=row.querySelector('button.on')||row.querySelector('button.best'); if(on&&on.offsetLeft>row.clientWidth-60)row.scrollLeft=on.offsetLeft-row.clientWidth/2;
  // совет: когда хорошо и почему (сравниваем с худшим из остальных — что именно там хуже)
  const bad=sl.filter(x=>!gi.includes(x.i)), wet=bad.filter(x=>(H.precipitation_probability||[])[x.i]>=30).map(x=>x.label);
  const tt=x=>Math.round(H.temperature_2m[x.i]), gt=good.map(tt), lo=Math.min(...gt), hi=Math.max(...gt), f=v=>(v>0?'+':'')+v+'°';
  const avg=a=>a.reduce((p,v)=>p+v,0)/a.length, warmer=bad.length&&!good.some(x=>x.i===sl[0].i)&&avg(gt)-avg(bad.map(tt))>=2, cooler=bad.length&&avg(bad.map(tt))-avg(gt)>=2&&lo>=22;
  const whyGood=good.length===sl.length?`погода ровная весь день, ${lo===hi?f(lo):f(lo)+'…'+f(hi)}`
    :[lo===hi?f(lo):f(lo)+'…'+f(hi), warmer?'теплее всего':(cooler?'не так жарко':''), good.every(x=>(H.precipitation_probability||[])[x.i]<30)?'без дождя':''].filter(Boolean).join(', ');
  S.tipText=`★ Хорошо гулять ${walkRange(good,sl)}: ${whyGood}${wet.length?`; дождь вероятен ${walkRange(bad.filter(x=>wet.includes(x.label)),sl)}`:''}. `+(S.tipText||'');
  const tp=document.getElementById('tipText'); if(tp)tp.textContent=S.tipText;
  if(WALK!=null){const s=sl.find(x=>x.i===WALK), tf=document.getElementById('tFeels'); if(s&&tf)tf.textContent+=` · ${s.label.startsWith('завтра')?s.label:'в '+s.label}`;}
}
