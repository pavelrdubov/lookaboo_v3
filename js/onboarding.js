/* навигация по экранам и знакомство (O1, O3) */
/* ================= экраны ================= */
const TABBED=['main','tl','wl','trip','prof','ev','wd','o1','o3'];
const TABOF={main:'main',tl:'tl',trip:'tl',ev:'tl',wl:'wl',prof:'prof',wd:'prof',o1:'prof',o3:'prof'};
function go(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));
  if(id==='trip')tripRender();
  if(id==='tl')tlRender();
  if(id==='wl')wlRender();
  if(id==='prof')profPaint();
  if(id==='ev')evRender();
  if(id==='wd')wdRender();
  S.screen=id;
  const ph=document.getElementById('phone');
  ph.classList.toggle('hastabs', !!S.onb && TABBED.includes(id) && !(id==='o1'&&O1ADD));   // новый малыш — экран знакомства без меню
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===TABOF[id]));
  setTheme(themeFor(id));
  wishBadge();
}
function tab(t){go(t);}

/* --- O1 --- */
const MONTHS=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function ageMonths(){const d=new Date(S.dob),n=new Date();let m=(n.getFullYear()-d.getFullYear())*12+(n.getMonth()-d.getMonth());if(n.getDate()<d.getDate())m--;return Math.max(0,m);}
function setGender(g){S.gender=g;paintGender();paintDate();syncHeight();paintMain();}
function paintGender(){document.querySelectorAll('.gseg button').forEach(b=>b.classList.toggle('on',b.dataset.g===S.gender));}

function initDate(){
  const d=new Date(S.dob);
  const sd=document.getElementById('selD'),sm=document.getElementById('selM'),sy=document.getElementById('selY');
  for(let i=1;i<=31;i++)sd.insertAdjacentHTML('beforeend',`<option value="${i}">${i}</option>`);
  MONTHS.forEach((m,i)=>sm.insertAdjacentHTML('beforeend',`<option value="${i}">${m}</option>`));
  const y=new Date().getFullYear();for(let i=y+1;i>=y-4;i--)sy.insertAdjacentHTML('beforeend',`<option value="${i}">${i}</option>`);
  sd.value=d.getDate();sm.value=d.getMonth();sy.value=d.getFullYear();
  [sd,sm,sy].forEach(s=>s.onchange=()=>{
    S.dob=dISO(+sy.value,+sm.value,+sd.value);paintDate();paintMain();});
  paintDate();
}
/* выпадающие списки даты — заново из S.dob (после «указать ПДР») */
function initDateSync(){const d=new Date(S.dob);
  const sd=document.getElementById('selD'),sm=document.getElementById('selM'),sy=document.getElementById('selY');
  if(sd){sd.value=d.getDate();sm.value=d.getMonth();sy.value=d.getFullYear();}}
/* жёлтая «таблетка»: родился — уточнить размер; ждём — выбрать роддом */
function o1Pill(){ if(expecting())ohOpen(); else{heightFrom='o1';go('o3');} }
function o1Link(){ if(expecting())hospOpen(); else pdrStart(); }
/* переключатель над датой: родился ↔ ждём (ПДР). Прошлую дату рождения помним, чтобы вернуть */
function pdrSet(on){
  if(on===expecting())return;
  if(on){kid().bornDob=S.dob; pdrStart();}
  else{S.dob=kid().bornDob&&kid().bornDob<=todayStr()?kid().bornDob:todayStr(); kid().dw=null; kidsSave(); initDateSync(); paintDate(); paintMain();}
}
/* «+ добавить» в профиле — знакомство с новым малышом на том же экране, но без шага с геопозицией */
let O1ADD=false;
function o1Next(){ if(expecting()&&!kid().hosp){ohOpen();return;} if(expecting()){ohNext();return;} if(O1ADD){O1ADD=false;paintMain();go('main');toast(personize('Малыш добавлен — имя и фото можно указать в профиле'));return;} S.onb ? go('main') : go('o2'); }
function paintDate(){
  const c=document.getElementById('o1cta'), l=document.getElementById('o1link');
  if(c)c.textContent=S.onb&&!O1ADD&&!expecting()?'Готово':'Дальше';
  if(l)l.style.display=S.onb&&!O1ADD?'none':'';
  const d=new Date(S.dob);
  document.getElementById('dD').textContent=d.getDate();
  document.getElementById('dM').textContent=MONTHS[d.getMonth()];
  document.getElementById('dY').textContent=d.getFullYear();
  const ex=expecting(), q=document.getElementById('o1q'), qs=document.getElementById('o1s');
  if(q)q.textContent=ex?'Когда ПДР?':'Когда родился малыш?';
  if(qs)qs.textContent=ex?'Подберём образ на выписку по погоде в вашем городе — и подскажем первые размеры.':'Возраст и размер посчитаем сами — и будем обновлять каждый месяц.';
  if(l)l.style.visibility='hidden';                    // «ждём / родился» — переключателем над датой, роддом — следующим шагом
  const ga=document.getElementById('gAny'); if(ga)ga.style.display=ex?'':'none';     // пол «пока не знаем» — пока ждём
  document.querySelectorAll('#bseg button').forEach(b=>b.classList.toggle('on',(b.dataset.b==='due')===ex));
  const m=ageMonths();
  const hh=document.getElementById('o1hand'), hp=kid().hosp;
  if(hh)hh.textContent=ex?(hp?'нажмите, чтобы сменить':'по нему посмотрим погоду на выписку'):'размер можно уточнить';
  document.getElementById('agePill').textContent=ex?(hp?`Роддом: ${hp.name} ›`:'Выбрать роддом ›')
    :personize(`Малышу ${m} ${monthsWord(m)} · размер ${sizeFor(heightNow())}`);
}

/* --- O3 --- */
let hMode='size';
function swapMode(){
  hMode = hMode==='size' ? 'cm' : 'size';
  document.getElementById('mSize').style.display = hMode==='size'?'':'none';
  document.getElementById('mCm').style.display   = hMode==='cm'?'':'none';
  document.getElementById('swBtn').textContent = hMode==='size'
    ? 'Знаю точный рост в сантиметрах' : 'Выбрать размер вместо сантиметров';
  paintHeight();
}
function syncHeight(){
  const r=document.getElementById('hRange');
  if(r&&!S.meas)r.value=Math.round(heightFor(ageMonthsExact()));
  paintHeight();
}
function pickSize(sz){
  S.meas={h:sizeToHeight(sz),d:todayStr()};
  const r=document.getElementById('hRange');if(r)r.value=Math.round(S.meas.h);
  paintHeight();
}
function initHeight(){
  const r=document.getElementById('hRange'),d=document.getElementById('hDate');
  d.max=todayStr();
  d.value=S.meas?S.meas.d:todayStr();
  r.value=Math.round(S.meas?S.meas.h:heightFor(ageMonthsExact()));
  r.oninput=()=>{S.meas={h:+r.value,d:d.value};paintHeight();};
  d.onchange=()=>{if(d.value>todayStr())d.value=todayStr();S.meas={h:+r.value,d:d.value};paintHeight();};
  document.getElementById('szRow').innerHTML=SIZES.slice(0,8)
    .map(z=>`<button onclick="pickSize(${z})" data-sz="${z}">${z}</button>`).join('');
  paintHeight();
}
function paintHeight(){
  const mNow=ageMonthsExact();
  const hNow=heightNow(), szNow=sizeFor(hNow), future=sizeAt(mNow+2);
  document.getElementById('hval').textContent=szNow;
  const r=document.getElementById('hRange');
  document.getElementById('hvalCm').textContent=Math.round(+r.value);
  document.querySelectorAll('#szRow button').forEach(b=>b.classList.toggle('on',+b.dataset.sz===szNow));

  document.getElementById('sizePill').textContent = future>szNow
    ? `Через 2 месяца — ${future}` : `Через 2 месяца — тот же ${szNow}`;

  const note=document.getElementById('hNote');
  if(!S.meas){
    note.textContent='Пока берём средний размер для возраста. Выберите свой — дальше будем считать от него.';
  }else if(hMode==='cm'){
    const d=document.getElementById('hDate').value;
    const days=Math.round((new Date()-new Date(d))/MS);
    note.textContent = days>=14
      ? `Замер от ${fmtDate(d)}. С тех пор малыш подрос — сейчас это примерно ${hNow.toFixed(0)} см.`
      : 'Считаем средний прирост для возраста и откладываем его от вашего замера.';
  }else{
    note.textContent=`Считаем средний прирост для возраста и откладываем его от размера ${szNow}.`;
  }
}
function resetHeight(){S.meas=null;
  const r=document.getElementById('hRange');r.value=Math.round(heightFor(ageMonthsExact()));
  document.getElementById('hDate').value=todayStr();paintHeight();paintDate();paintMain();
  go(heightFrom==='main'?'main':(heightFrom==='prof'?'prof':'o1'));
  if(heightFrom==='prof'&&typeof profPaint==='function')profPaint();}

let heightFrom='o1';
function backFromHeight(){
  kidsSave();
  paintDate();paintMain();go(heightFrom==='main'?'main':(heightFrom==='prof'?'prof':'o1'));
  if(heightFrom==='prof'&&typeof profPaint==='function')profPaint();
}
function finish(){S.onb=true;try{store.set('mpp-onb','1');}catch(e){}paintMain();go('main');}
