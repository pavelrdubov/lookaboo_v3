/* вишлист, ручное добавление, ссылка на список */
/* ---- явный выбор вещей для вишлиста ---- */
function openPick(){
  const b=bandFor(effTemp()), list=setsFor(b), set=curSet(list);
  const sz=sizeFor(heightNow());
  document.getElementById('sheet').innerHTML=
    `<h3>Что докупить?</h3><p>Отметьте вещи из сегодняшнего набора — они попадут в вишлист с размером.</p>`
    + lookItems(set.it).map(([k,l])=>{
        const id='day:'+k, on=!!WISH[id];
        return `<div class="item${on?' on':''}" style="margin-bottom:8px">
          <div class="bx" onclick="pickTap('${k}','${l.replace(/'/g,'')}')">${on?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"></path></svg>':''}</div>
          <div class="nm">${l}${(()=>{const s=sizeForItem(k,ageMonths(),sz);return s?' · '+szTxt(s):'';})()}</div></div>`;}).join('')
    + `<button class="ghost" onclick="closePick()">Готово</button>`;
  openSheet();
}
function pickTap(k,l){ dayWish(k,l); openPick(); }
function closePick(){ closeSheet(); setTimeout(restoreSheet,320); }
let SHEETHTML='';
function restoreSheet(){ if(SHEETHTML)document.getElementById('sheet').innerHTML=SHEETHTML; initSheet(true); }

/* ================= ВИШЛИСТ ================= */
let WISH={};
(function(){try{const w=JSON.parse(store.get('mpp-wish')||'{}');if(w&&typeof w==='object')WISH=w;}catch(e){}
  /* миграция: раньше галочка = «куплено» (исключить). Теперь галочка = «в списке».
     старое bought:true → keep:false; всё остальное по умолчанию в списке */
  for(const id in WISH){const x=WISH[id];if(x&&x.keep===undefined){x.keep=!x.bought;delete x.bought;}}
  /* по умолчанию всё в списке: один раз возвращаем галочки, снятые старой версией */
  try{if(!store.get('mpp-wish-on')){for(const id in WISH)if(WISH[id])WISH[id].keep=true;
    store.set('mpp-wish',JSON.stringify(WISH));store.set('mpp-wish-on','1');}}catch(e){}
})();
function inList(x){return x.keep!==false;}          // в списке = отмечено
function wishSave(){try{store.set('mpp-wish',JSON.stringify(WISH));}catch(e){}wishBadge();}
function wishCount(){return Object.values(WISH).filter(inList).length;}
let WLF='';                                           // фильтр вишлиста: '' — все списки, иначе название раздела
function wishGrp(w){return w.src||'Разное';}
function wishOutIds(){return Object.keys(WISH).filter(id=>inList(WISH[id])&&(!WLF||wishGrp(WISH[id])===WLF));}
function wishBadge(){
  const n=wishCount();
  const t=document.getElementById('tabBdg');
  if(t){t.textContent=n;t.classList.toggle('on',n>0);}
}
function wishToggle(id,rec){
  if(WISH[id])delete WISH[id]; else WISH[id]=Object.assign({keep:true},rec);
  wishSave();
  return !!WISH[id];
}
function wishKeep(id){if(WISH[id]){WISH[id].keep=!inList(WISH[id]);wishSave();wlRender();}}
function wishDel(id){wishDrop(id);wishSave();wlRender();}
function wishDrop(id){
  delete WISH[id];
  // синхронизация с поездками: снять отметку и в TRIP.wish, чтобы сердечки/счётчик обновились
  const m=id.match(/^trip(\d+):(.+)$/);
  if(m){const t=TRIPS.find(x=>String(x.id||0)===m[1]);if(t&&t.wish)delete t.wish[m[2]];
    if(TRIP&&String(TRIP.id||0)===m[1]&&TRIP.wish)delete TRIP.wish[m[2]];
    try{store.set('mpp-trips',JSON.stringify(TRIPS));}catch(e){}}
}
let WLG=[];                                           // разделы в порядке отрисовки (для onclick по индексу)
function wlFilter(i){WLF=i<0?'':(WLG[i]||'');wlRender();}
function wlGroupDel(i){
  const g=WLG[i]; if(g==null)return;
  const ids=Object.keys(WISH).filter(id=>wishGrp(WISH[id])===g);
  if(!confirm(`Удалить раздел «${g}» целиком? ${ids.length} ${ids.length===1?'вещь':(ids.length<5?'вещи':'вещей')} пропадут из вишлиста.`))return;
  ids.forEach(wishDrop); if(WLF===g)WLF='';
  wishSave();wlRender();toast('Раздел удалён');
}

function wlRender(){
  const ids=Object.keys(WISH);
  document.getElementById('wlSub').textContent = ids.length
    ? `${ids.length} ${ids.length===1?'вещь':(ids.length<5?'вещи':'вещей')} · в списке ${wishCount()}`
    : 'что купить малышу';
  const addBtn=`<button class="ghost2" style="margin:0 0 12px;border-color:var(--accent);color:var(--accent)" onclick="waOpen()">+ Добавить вещь</button>`;
  if(!ids.length){
    document.getElementById('wlBody').innerHTML=addBtn+
      `<div class="card"><h3>Пока пусто</h3><div class="sub">Нажмите на вещь в наборе на главном экране, на плюсик в списке для поездки — или добавьте руками кнопкой выше.</div></div>`;
    return;
  }
  const groups={};
  ids.forEach(id=>{const g=wishGrp(WISH[id]);(groups[g]=groups[g]||[]).push(id);});
  WLG=Object.keys(groups);
  if(WLF&&!groups[WLF])WLF='';
  const flt=WLG.length>1?`<div class="wlflt"><select onchange="wlFilter(+this.value)">
      <option value="-1"${WLF?'':' selected'}>Все списки · ${ids.length}</option>
      ${WLG.map((g,i)=>`<option value="${i}"${g===WLF?' selected':''}>${esc2(g)} · ${groups[g].length}</option>`).join('')}
    </select></div>`:'';
  const body=WLG.map((g,gi)=>WLF&&g!==WLF?'':
    (()=>{const w0=WISH[groups[g].find(id=>WISH[id].ev)];          // раздел из события плана: дата и переход к событию
      const dt=w0&&w0.d?' · '+fmtF(w0.d).toUpperCase():'';
      return `<div class="sect wlsect"><span${w0?` class="wlev" data-k="${esc2(w0.ev)}" onclick="evOpenKey(this.dataset.k)"`:''}>${esc2(g.toUpperCase())}${dt}${w0?' ›':''}</span><button onclick="wlGroupDel(${gi})">удалить раздел</button></div>`;})()+
    groups[g].map(id=>{const w=WISH[id];
      const sub=[szTxt(w.size),(w.qty>1?'×'+w.qty:''),w.note||''].filter(Boolean).join(' · ');
      const keep=inList(w);
      return `<div class="wi${keep?'':' off'}">
        <div class="bx2" onclick="wishKeep('${id}')">${keep?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"></path></svg>':''}</div>
        ${w.img?`<img src="${w.img}" alt="" onclick="waOpen('${id}')" onerror="this.remove()">`:''}
        <div class="t" onclick="waOpen('${id}')"><b>${esc2(w.label)}</b><s>${esc2(sub)||'нажмите, чтобы изменить'}</s></div>
        <button class="del" onclick="wishDel('${id}')">×</button>
      </div>`;}).join('')
  ).join('');
  document.getElementById('wlBody').innerHTML=addBtn+flt+body+
    `<button class="ghost2" style="margin-top:12px" onclick="wishShare()">Отправить картинкой</button>
     <button class="ghost2" style="margin-top:8px;border-color:var(--accent);color:var(--accent)" onclick="copyListLink()">Поделиться ссылкой на список</button>
     <div style="height:12px"></div>`;
}
/* ---- добавить / изменить позицию вручную ---- */
const WACATS=[
  {t:'Каждый день', it:[['bodyL','боди д/р'],['bodyS','боди к/р'],['bodyT','боди-майка'],['tank','майка'],
    ['slip','слип'],['slipKnit','вязаный слип'],['footpants','ползунки'],['pants','штанишки'],['shorts','шорты'],
    ['wrapbody','боди-распашонка'],['wrap','распашонка'],['romper','песочник'],['socks','носки']]},
  {t:'Кофты и верх', it:[['cardigan','кофта'],['sweater','свитер'],['dungarees','полукомбинезон'],['vest','жилет'],['jacket','куртка']]},
  {t:'Верхнее', it:[['ovFleece','флисовый комбинезон'],['ovDemi','демисезонный'],['ovWinter','зимний комбинезон']]},
  {t:'Аксессуары', it:[['hat','шапка'],['hatWarm','тёплая шапка'],['panama','панамка'],['mittens','варежки']]},
  {t:'Нарядное', it:[]},
  {t:'Разное', it:[['muslin','пелёнка'],['blanket','плед'],['toy','игрушка']]}
];
let WA={id:null,key:null,label:'',size:null,note:'',qty:1,cat:0,direct:false,src:'На каждый день'};
/* куда положить вещь: свои разделы + те, что уже есть в списке и в поездках */
function waSections(){
  const base=['На каждый день','Нарядное','Про запас'];
  const used=Object.keys(WISH).map(i=>WISH[i].src).filter(Boolean);
  const trips=TRIPS.filter(t=>t.city).map(t=>'Поездка · '+t.city);
  return Array.from(new Set(base.concat(trips,used)));
}
function waCats(){
  const c=WACATS.map(x=>({t:x.t,it:x.it.slice()}));
  c[4].it=fancyItems(null,12).map(([k,l])=>[k,l.replace(/^праздничный наряд: /,'')]).concat([['dress','платье']]);   // нарядное зависит от пола + платье
  return c.filter(x=>x.it.length);
}
function waOpen(id){
  const sz=sizeFor(heightNow());
  if(id&&WISH[id]){
    const w=WISH[id];
    WA={id:id,key:w.key||null,label:w.label,size:w.size||'',note:w.note||'',qty:w.qty||1,cat:0,
        direct:!!w.direct,src:w.src||'На каждый день'};
    if(WA.key){const cs=waCats();cs.forEach((c,i)=>{if(c.it.some(x=>x[0]===WA.key))WA.cat=i;});}
    document.getElementById('waTitle').textContent='Изменить';
  }else{
    WA={id:null,key:null,label:'',size:sz,note:'',qty:1,cat:0,direct:false,src:'На каждый день'};
    document.getElementById('waTitle').textContent='Добавить в вишлист';
  }
  document.getElementById('wladd').classList.add('on');
  waRender();
}
function waClose(){document.getElementById('wladd').classList.remove('on');}
function waCat(i){WA.cat=i;waRender();}
function waPick(key,label,direct){
  WA.key=key;WA.direct=!!direct;
  if(!WA.id||!WA.label)WA.label=label;
  if(!WA.label)WA.label=label;
  WA.label=label;
  if(NOTLAYER.includes(key)&&!direct)WA.size='';
  else if(!WA.size)WA.size=sizeFor(heightNow());
  waRender();
}
function waSize(s){WA.size=(WA.size===s?'':s);waRender();}
function waSrc(t){WA.src=t;waRender();}
function waSrcNew(){const t=(prompt('Название раздела — например, «Лето в деревне»')||'').trim();if(t){WA.src=t;waRender();}}
function waQty(d){WA.qty=Math.max(1,Math.min(20,WA.qty+d));waRender();}
function waRender(){
  const cs=waCats(), cat=cs[Math.min(WA.cat,cs.length-1)];
  const chips=cs.map((c,i)=>`<button class="${i===WA.cat?'on':''}" onclick="waCat(${i})">${c.t}</button>`).join('');
  const grid=cat.it.map(([k,l])=>{
    const direct=!!IMG[k];
    return `<button class="${WA.key===k?'on':''}" onclick="waPick('${k}','${l.replace(/'/g,'')}',${direct?1:0})">
      <img src="${direct?IMG[k]:pickImg(k,0)}" alt="" onerror="this.style.visibility='hidden'"><span>${l}</span></button>`;}).join('');
  const szs=SIZES.slice(0,9).map(s=>`<button class="${WA.size===s?'on':''}" onclick="waSize(${s})">${s}</button>`).join('');

  document.getElementById('waBody').innerHTML=`
    <div class="catrow">${chips}</div>
    <div class="pickgrid">${grid}</div>

    <div class="wa-f">
      <label>КАК НАЗВАТЬ</label>
      <input id="waLabel" value="${esc2(WA.label)}" placeholder="например, боди д/р" maxlength="40">
    </div>
    <div class="wa-f">
      <label>РАЗМЕР${WA.size?'':' — не нужен'}</label>
      <div class="wa-sz">${szs}</div>
    </div>
    <div class="wa-f">
      <label>В КАКОЙ РАЗДЕЛ</label>
      <div class="catrow" style="padding-bottom:0">${waSections().map(t=>
        `<button class="${WA.src===t?'on':''}" onclick="waSrc('${t.replace(/'/g,"")}')">${esc2(t)}</button>`).join('')}<button onclick="waSrcNew()" style="border-style:dashed">+ свой</button></div>
    </div>
    <div class="wa-f">
      <label>ЗАМЕТКА — цвет, магазин, что угодно</label>
      <input id="waNote" value="${esc2(WA.note)}" placeholder="например, лучше бежевый" maxlength="60">
    </div>
    <div class="wa-f" style="display:flex;align-items:center;justify-content:space-between">
      <label style="margin:0">СКОЛЬКО</label>
      <div class="cnt"><button onclick="waQty(-1)">−</button><b>${WA.qty}</b><button onclick="waQty(1)">+</button></div>
    </div>
    <button class="wa-save" id="waSave" onclick="waSave()" ${WA.label.trim()?'':'disabled'}>${WA.id?'Сохранить':'Добавить'}</button>
    ${WA.id?`<button class="ghost2" style="color:#B0705A" onclick="waDel()">Удалить из вишлиста</button>`:''}
    <div style="height:10px"></div>`;

  const li=document.getElementById('waLabel');
  li.oninput=()=>{WA.label=li.value;document.getElementById('waSave').disabled=!li.value.trim();};
  const no=document.getElementById('waNote');
  no.oninput=()=>{WA.note=no.value;};
}
function waSave(){
  const label=(WA.label||'').trim(); if(!label)return;
  const id=WA.id||('man'+Date.now()), old=WISH[id]||{};
  WISH[id]={ev:old.ev,d:old.d,label:label,size:WA.size||'',note:WA.note||'',qty:WA.qty||1,key:WA.key||null,direct:WA.direct,
    src:WA.src||'На каждый день',
    img:WA.key?(WA.direct?IMG[WA.key]:(CAND[WA.key]?pickImg(WA.key,0):null)):null,
    keep:WISH[id]?inList(WISH[id]):true};
  wishSave();waClose();wlRender();
  toast(WA.id?'Сохранила':'Добавила в вишлист');
}
function waDel(){if(WA.id){delete WISH[WA.id];wishSave();}waClose();wlRender();}

function wishShare(){
  if(!wishOutIds().length){toast('Список пуст');return;}
  shotMake('wish');
}

/* ===== ссылка на список: пакуем в хэш URL, без сервера; картинки берутся из приложения ===== */
/* короткая ссылка: данные кладём на сервер (functions/api/link.js), в ссылке — только /l/<id>.
   Сервер недоступен (нет хранилища, нет сети, открыто с файла) — отдаём длинную ссылку, как раньше */
async function shortLink(kind,data,longUrl){
  if(!/^https?:/.test(location.protocol))return longUrl;
  try{
    const ac=new AbortController(), t=setTimeout(()=>ac.abort(),4000);
    const r=await fetch('/api/link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({k:kind,d:data}),signal:ac.signal});
    clearTimeout(t);
    if(!r.ok)return longUrl;
    const j=await r.json(); return j&&j.id?location.origin+'/l/'+j.id:longUrl;
  }catch(e){ return longUrl; }
}
/* поделиться ссылкой; если телефон не дал открыть «Поделиться» после ожидания сервера — показываем ссылку с кнопкой */
async function shareUrl(title,url){
  try{ if(navigator.share){await navigator.share({title,url});return;} }
  catch(e){ if(e&&e.name==='AbortError')return; if(e&&e.name==='NotAllowedError'){showCopy(url);return;} }
  try{ await navigator.clipboard.writeText(url); toast('Ссылка скопирована'); return; }catch(e){}
  showCopy(url);
}
function listLinkData(){
  const ids=wishOutIds();
  const it=ids.map(id=>{const w=WISH[id];return {l:w.label,s:w.size||'',n:w.note||'',q:w.qty||1,k:w.key||'',g:w.src||''};});
  const k=kid();
  const payload={v:1,nm:kidName(k)||'',sz:sizeFor(heightNow()),z:sizesData(),it};
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
}
function buildListLink(){ return location.origin+location.pathname+'#list='+listLinkData(); }
async function copyListLink(){
  if(!wishOutIds().length){toast('Список пуст');return;}
  const d=listLinkData();
  const url=await shortLink('list',d,location.origin+location.pathname+'#list='+d);
  shareUrl('Список Lookaboo',url);
}
function sharedFromHash(){
  const m=(location.hash||'').match(/list=([^&]+)/); if(!m)return null;
  try{ return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1]))))); }catch(e){ return null; }
}
function renderShared(d){
  const groups={};
  (d.it||[]).forEach(w=>{const g=w.g||'Список';(groups[g]=groups[g]||[]).push(w);});
  const rows=Object.keys(groups).map(g=>
    `<div class="shsect">${esc2(g)}</div>`+
    groups[g].map(w=>{
      let img='';
      if(w.k){try{img=IMG[w.k]||pickImg(w.k)||'';}catch(e){img='';}}
      const sub=[szTxt(w.s),(w.q>1?'×'+w.q:''),w.n||''].filter(Boolean).join(' · ');
      return `<div class="shwi">${img?`<img src="${img}" alt="" onerror="this.style.visibility='hidden'">`:'<div class="shph">♡</div>'}`
        +`<div class="sht"><b>${esc2(expandAbbr(w.l))}</b>${sub?`<s>${esc2(sub)}</s>`:''}</div></div>`;
    }).join('')
  ).join('');
  document.getElementById('shTitle').textContent=d.nm?('Что нужно '+(typeof nameCases==='function'?nameCases(d.nm).dat:d.nm)):'Список вещей';
  document.getElementById('shSub').textContent='';
  SHZ=d.z||null;
  document.getElementById('shBody').innerHTML=(SHZ?szCard(SHZ,'sharedSizes()'):'')+(rows||'<div class="sub">Список пуст.</div>');
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  document.getElementById('shared').classList.add('on');
}
let SHZ=null;
function sharedSizes(){if(!SHZ)return;renderSizes(SHZ,true);SZFROM='shared';document.getElementById('szBack').style.display='flex';go('sizes');}
function sharedOpenApp(){ location.hash=''; location.reload(); }
