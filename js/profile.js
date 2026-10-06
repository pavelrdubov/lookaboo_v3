/* профиль и обратная связь */
/* ================= ПРОФИЛЬ ================= */
function kidName(k){return (k.name||'').trim();}
function kidLabel(k){return kidName(k)||'Малыш';}
function kidAgeOf(k){
  const d0=new Date(k.dob),n=new Date();
  let m=(n.getFullYear()-d0.getFullYear())*12+(n.getMonth()-d0.getMonth());
  if(n.getDate()<d0.getDate())m--;
  return Math.max(0,m);
}
function kidAv(k,big){
  return k.photo
    ? `<img src="${k.photo}" alt="">`
    : `<span style="font-size:${big?30:22}px;font-weight:800;color:#B3A08A">${kidLabel(k)[0].toUpperCase()}</span>`;
}
function esc2(t){return String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));}

function profPaint(){
  const k=kid(), m=kidAgeOf(k), sz=sizeFor(heightNow());
  document.getElementById('pfTitle').textContent=kidLabel(k);
  document.getElementById('pfSub').textContent=expecting()?`ПДР ${dueWhen()} · первый размер ${sz}`:`${m} ${monthsWord(m)} · размер ${sz}`;

  const kids=KIDS.map((x,i)=>`<button class="kidchip${i===KI?' on':''}" onclick="profSetKid(${i})">
      <div class="av">${kidAv(x)}</div><s>${esc2(kidLabel(x))}</s></button>`).join('')
    +`<button class="kidchip" onclick="profAddKid()">
      <div class="av" style="border:2px dashed #DDD2BF;background:#FCF9F4;color:#B3A08A;font-size:26px">+</div>
      <s style="color:#B3A08A">добавить</s></button>`;

  const cityPick = S.geo==='город' ? `
      <div class="fld" style="margin-top:10px"><span>Город</span>
        <input id="pfCity" placeholder="${esc2(S.city)}" autocomplete="off"></div>
      <div id="pfCityList" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>` : '';

  document.getElementById('pfBody').innerHTML=`
    <div class="kidrow">${kids}</div>

    <div class="card">
      <div class="pfphoto" onclick="profPhoto()">${k.photo?kidAv(k,1):'<span>добавить<br>фото</span>'}</div>
      ${k.photo?`<div style="text-align:center;margin:-4px 0 10px"><button class="swlink" style="width:auto" onclick="profPhotoDel()">убрать фото</button></div>`:''}
      <div class="fld"><span>Имя</span>
        <input id="pfName" value="${esc2(k.name)}" placeholder="как зовут малыша" maxlength="24"></div>
      <div class="fld"><span>${expecting()?'ПДР':'Дата рождения'}</span>
        <input type="date" id="pfDob" ${expecting()?'':`max="${todayStr()}"`} value="${k.dob}"></div>
      ${expecting()?`<button class="lnk" onclick="hospOpen()"><b>Роддом</b><s>${k.hosp?esc2(k.hosp.name)+' ›':'выбрать ›'}</s></button>
        <button class="lnk" onclick="pdrBorn()"><b>Малыш родился!</b><s>указать дату ›</s></button>`
      :`<button class="lnk" onclick="pdrStart()"><b>Малыш ещё не родился</b><s>указать ПДР ›</s></button>`}
      <div class="seg">
        <button class="${S.gender==='girl'?'on':''}" onclick="profGender('girl')">девочка</button>
        <button class="${S.gender==='boy'?'on':''}" onclick="profGender('boy')">мальчик</button>
      </div>
      <button class="lnk" onclick="heightFrom='prof';go('o3')"><b>Размер сейчас</b><s>${sz} ›</s></button>
      <button class="lnk" onclick="openSizes()"><b>Все размеры</b><s>шапки, носки, US ›</s></button>
      <button class="lnk" onclick="wdOpen(${sz},'prof')"><b>Гардероб</b><s>${wdKnown(sz)?'отмечен ›':'не отмечен ›'}</s></button>
      <button class="lnk" onclick="location.href='catalog.html'"><b>Каталог картинок</b><s>тест ›</s></button>
      <div class="pfnote">Пол влияет и на картинки в наборе, и на подсказки по размеру.</div>
      ${KIDS.length>1?`<button class="ghost2" style="margin-top:12px;color:#B0705A" onclick="profDelKid()">Убрать ${esc2(kidLabel(k))} из профиля</button>`:''}
    </div>

    <div class="card">
      <h3>Где гуляем</h3>
      <div class="sub">Сейчас: <b>${esc2(S.city)}</b>${S.geo==='гео'?' — по геопозиции':' — выбрано вручную'}</div>
      <div class="seg">
        <button class="${S.geo==='гео'?'on':''}" onclick="profGeo('гео')">по геопозиции</button>
        <button class="${S.geo==='город'?'on':''}" onclick="profGeo('город')">указать город</button>
      </div>
      ${cityPick}
      <button class="ghost2" onclick="openSheet()">Погода не сходится? поправить</button>
      <div class="pfnote">В большом городе разница между центром и окраиной бывает 2–3°, поэтому геопозиция точнее. Но если она сбивается — выберите город руками.</div>
    </div>

    <div class="card">
      <h3>Коляска</h3>
      <div class="sub">Сейчас считаем как ${strollerKind()==='cot'?'<b>люльку</b>':'<b>прогулочную</b>'}${(kid().stroller||'auto')==='auto'?' — по возрасту':''}.</div>
      <div class="seg">
        <button class="${kid().stroller==='cot'?'on':''}" onclick="profStroller('cot')">люлька</button>
        <button class="${kid().stroller==='seat'?'on':''}" onclick="profStroller('seat')">прогулочная</button>
        <button class="${(kid().stroller||'auto')==='auto'?'on':''}" onclick="profStroller('auto')">по возрасту</button>
      </div>
      <div class="pfnote">В люльке малыш закрыт от ветра — ему теплее. В прогулочной ветер достаёт до ног, поэтому лишний слой добавим чуть раньше. По возрасту: до 6 месяцев — люлька, потом прогулочная.</div>
    </div>

    <div class="card">
      <h3>Напоминания</h3>
      <div class="sub">За сколько подсвечивать в «Плане», что пора покупать.</div>
      <div class="seg">
        <button class="${S.rem===30?'on':''}" onclick="profRem(30)">за месяц</button>
        <button class="${S.rem===14?'on':''}" onclick="profRem(14)">за 2 недели</button>
        <button class="${S.rem===0?'on':''}" onclick="profRem(0)">не надо</button>
      </div>
      <div class="pfnote">Пока это подсветка внутри приложения: пуш-уведомления умеет только приложение из App Store, а не сайт на экране «Домой».</div>
    </div>

    <div class="card">
      <h3>Обратная связь</h3>
      <div class="sub">Нашли ошибку или хотите что-то предложить? Напишите — я читаю всё.</div>
      <button class="ghost2" onclick="sendFeedback()">Написать письмо</button>
    </div>

    <div class="card">
      <h3>О приложении</h3>
      <div class="sub">Lookaboo · всё хранится только на этом устройстве, ничего никуда не уходит.</div>
      <button class="ghost2" onclick="profReset()">Начать заново</button>
    </div>
    <div style="height:14px"></div>`;

  const nm=document.getElementById('pfName');
  if(nm)nm.oninput=()=>{kid().name=nm.value;kidsSave();
    document.getElementById('pfTitle').textContent=kidLabel(kid());};
  const db=document.getElementById('pfDob');
  if(db)db.onchange=()=>{if(!db.value)return;
    if(db.value>todayStr()&&!expecting())db.value=todayStr();   // будущая дата — только для ПДР
    S.dob=db.value;paintDate();paintMain();profPaint();};
  const pc=document.getElementById('pfCity');
  if(pc)pc.oninput=()=>profCities(pc.value);
}
function profCities(q){
  const l=document.getElementById('pfCityList'); if(!l)return;
  const t=(q||'').trim().toLowerCase();
  if(!t){l.innerHTML='';return;}
  citySearch(q,5,(list,wait)=>{ l.innerHTML=list.map((c,i)=>`<button class="ghost2" style="margin:0;text-align:left;padding:0 14px" onclick="${cityPickJs('pickCity',i)}">${esc2(c.name)} · ${esc2(c.sub)}</button>`).join('')
    || `<div class="pfnote">${wait?'Ищем…':'Такой город не нашёлся — проверьте написание.'}</div>`; });
}
function profStroller(v){kid().stroller=v==='auto'?undefined:v;kidsSave();profPaint();paintMain();}
function profSetKid(i){KI=i;kidsSave();profPaint();paintDate();syncHeight();paintMain();}
function profAddKid(){KIDS.push(blankKid());KI=KIDS.length-1;kidsSave();profPaint();paintDate();paintMain();}
function profDelKid(){
  if(KIDS.length<2)return;
  if(!confirm('Убрать '+kidLabel(kid())+' из профиля? Вишлист и поездки останутся.'))return;
  KIDS.splice(KI,1);KI=0;kidsSave();profPaint();paintDate();paintMain();
}
function profGender(g){S.gender=g;paintGender();profPaint();paintMain();}
function profGeo(m){
  S.geo=m;store.set('mpp-geo',m==='гео'?'1':'0');
  profPaint();
  if(m==='гео')retryWeather();
}
function profRem(v){S.rem=v;store.set('mpp-rem',String(v));profPaint();}
function profPhoto(){const f=document.getElementById('pfFile');f.value='';f.click();}
function profPhotoDel(){kid().photo=null;kidsSave();profPaint();}
function initProfFile(){
  const f=document.getElementById('pfFile'); if(!f)return;
  f.onchange=e=>{
    const file=e.target.files&&e.target.files[0]; if(!file)return;
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{
      const s=Math.min(img.width,img.height), c=document.createElement('canvas');
      c.width=c.height=320;
      c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,320,320);
      kid().photo=c.toDataURL('image/jpeg',0.82);
      URL.revokeObjectURL(url);
      if(!kidsSave())toast('Фото не поместилось в память браузера');
      profPaint();
    };
    img.onerror=()=>{URL.revokeObjectURL(url);toast('Не получилось открыть фото');};
    img.src=url;
  };
}
function sendFeedback(){
  const subj=encodeURIComponent('Lookaboo — обратная связь');
  const body=encodeURIComponent('\n\n———\nВерсия приложения: '+(window.APPVER||'—'));
  location.href='mailto:kate.kochurova@gmail.com?subject='+subj+'&body='+body;
}
function profReset(){
  if(!confirm('Стереть всё: малышей, вишлист и поездки?'))return;
  ['mpp-kids','mpp-ki','mpp-wish','mpp-trips','mpp-onb','mpp-city','mpp-geo','mpp-ll','mpp-rem','mpp-ctx',
   'mpp-dob','mpp-g','mpp-h','mpp-hd'].forEach(k=>{try{store.set(k,'');localStorage.removeItem(k);}catch(e){}});
  location.reload();
}
