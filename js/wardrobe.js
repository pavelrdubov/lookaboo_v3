/* гардероб */
/* ================= ГАРДЕРОБ ================= */
/* храним по размерам: пять боди в 62 на 74 уже не наденешь */
const WDGROUPS=[
  {t:'КАЖДЫЙ ДЕНЬ', it:[['bodyL','боди д/р'],['bodyS','боди к/р'],['slip','слип'],['footpants','ползунки'],
    ['pants','штанишки'],['shorts','шорты'],['socks','носки'],['wrapbody','боди-распашонка']]},
  {t:'КОФТЫ И ВЕРХ', it:[['cardigan','кофта'],['sweater','свитер'],['dungarees','полукомбинезон'],['vest','жилет'],['jacket','куртка']]},
  {t:'ВЕРХНЕЕ',      it:[['ovFleece','флисовый комбинезон'],['ovDemi','демисезонный'],['ovWinter','зимний комбинезон']]},
  {t:'АКСЕССУАРЫ',   it:[['hat','шапка'],['hatWarm','тёплая шапка'],['panama','панамка'],['mittens','варежки']]},
  {t:'РАЗНОЕ',       it:[['muslin','пелёнка'],['blanket','плед'],['dress','платье'],['romper','песочник']]}
];
/* сколько обычно нужно — чтобы «5 боди» было с чем сравнить */
const NORM={bodyL:6,bodyS:6,bodyT:4,slip:4,slipKnit:1,footpants:4,wrapbody:3,wrap:3,socks:6,
  pants:3,shorts:3,cardigan:1,sweater:1,dungarees:1,vest:1,jacket:1,tank:3,
  ovFleece:1,ovDemi:1,ovWinter:1,hat:1,hatWarm:1,panama:1,mittens:1,muslin:3,blanket:2,dress:2,romper:2};

function wdAll(){const k=kid();if(!k.wd)k.wd={};return k.wd;}
function wdFor(sz){return wdAll()[String(sz)]||null;}
function wdKnown(sz){const s=wdFor(sz);return !!s&&Object.keys(s).length>0;}
function wdHave(key,sz){const s=wdFor(sz);if(!s)return null;const v=s[key];return v===undefined?null:v;}  // null — эту вещь ещё не отмечали
function wdSet(sz,key,n){
  const w=wdAll(), s=String(sz);
  (w[s]=w[s]||{})[key]=Math.max(0,Math.min(30,n));
  kidsSave();
}
let WDSZ=null, WDFROM='prof';
function wdOpen(sz,from){WDSZ=sz||sizeFor(heightNow());WDFROM=from||'prof';go('wd');}
function wdPick(sz){WDSZ=sz;wdRender();}
function wdBump(key,d){
  const cur=wdHave(key,WDSZ);
  /* первое касание и отмечает вещь: «−» это «нет», «+» это «одна» */
  wdSet(WDSZ,key, cur==null ? (d>0?1:0) : cur+d);
  wdRender();
}
function wdSizes(){
  const now=sizeFor(heightNow());
  const i=SIZES.indexOf(now);
  const near=SIZES.slice(Math.max(0,i-1),i+3);
  const saved=Object.keys(wdAll()).map(Number);
  return Array.from(new Set(near.concat(saved))).sort((a,b)=>a-b);
}
function wdRender(){
  const now=sizeFor(heightNow());
  if(!WDSZ)WDSZ=now;
  document.getElementById('wdSub').textContent=`размер ${WDSZ}${WDSZ===now?' · сейчас':''}`;

  const picks=wdSizes().map(s=>`<button class="${s===WDSZ?'on':''}${s===now?' now':''}" onclick="wdPick(${s})">${s}</button>`).join('');

  let missing=[];
  const groups=WDGROUPS.map(g=>{
    const rows=g.it.map(([key,label])=>{
      const have=wdHave(key,WDSZ), norm=NORM[key]||1;
      const short=have==null?0:norm-have;
      if(short>0)missing.push([key,label,short]);
      const note = have==null ? 'сколько есть?'
        : (have===0 ? `нет · обычно берут ${norm}`
        : (short>0 ? `есть ${have} · обычно ${norm}` : `есть ${have} · хватает`));
      return `<div class="wrow2">
        <img src="${pickImg(key,0)}" alt="" onerror="this.style.visibility='hidden'">
        <div class="t"><b>${label}</b><s class="${short>0?'need':''}">${note}</s></div>
        <div class="cnt">
          <button onclick="wdBump('${key}',-1)">−</button>
          <b class="${have?'':'zero'}">${have==null?'—':have}</b>
          <button onclick="wdBump('${key}',1)">+</button>
        </div></div>`;
    }).join('');
    return `<div class="sect">${g.t}</div>${rows}`;
  }).join('');

  const head = wdKnown(WDSZ)
    ? `<div class="card"><h3>Размер ${WDSZ}</h3><div class="sub">${
        missing.length? `Не хватает ${missing.length} ${missing.length===1?'вещи':(missing.length<5?'вещей':'вещей')} из тех, что вы отметили. Чего нет совсем — помечу в луках «нет в ${WDSZ}».`
                      : 'По отмеченному всё на месте.'}</div>${
        missing.length?`<button class="ghost2" onclick="wdToWish()">Добавить недостающее в вишлист</button>`:''}</div>`
    : `<div class="card"><h3>Отметьте, что уже есть в ${WDSZ}</h3>
        <div class="sub">Отмечайте только то, что помните — весь гардероб переписывать не нужно. «+» — сколько есть, «−» на нуле — «нет ни одной». Что не тронете, останется неизвестным, и приложение про это молчит.</div></div>`;

  document.getElementById('wdBody').innerHTML=
    `<div class="szpick">${picks}</div>${head}${groups}
     <div class="pfnote">Гардероб хранится по размерам и только на этом устройстве. Когда малыш перейдёт на следующий размер, спрошу заново.</div>
     <div style="height:14px"></div>`;
  WDMISS=missing;
}
let WDMISS=[];
function wdToWish(){
  let n=0;
  WDMISS.forEach(([key,label,short])=>{
    const id=wk('wd'+WDSZ+':'+key);
    if(WISH[id])return;
    WISH[id]={label:label+(short>1?' ×'+short:''),size:sizeForItem(key,ageMonths(),WDSZ),
      src:'Не хватает в '+WDSZ,img:pickImg(key,0)||null,key:key,keep:true,kid:kid().id};
    n++;
  });
  wishSave();
  toast(n?`Добавила ${n} — смотрите в вишлисте`:'Всё уже в вишлисте');
}
