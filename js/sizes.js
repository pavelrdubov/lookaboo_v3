/* таблица размеров */
/* ===== страница размеров (шарабельная) ===== */
const SIZETBL=[[50,'до 50','Newborn'],[56,'50–56','0–1 мес'],[62,'57–62','2–3 мес'],[68,'63–68','3–6 мес'],
 [74,'69–74','6–9 мес'],[80,'75–80','9–12 мес'],[86,'81–86','12–18 мес'],[92,'87–92','18–24 мес'],
 [98,'93–98','2–3 года'],[104,'99–104','3–4 года']];
function sizesData(){const k=kid(),m=ageMonths(),h=Math.round(heightNow());
  return {nm:kidName(k)||'',m,h,exp:typeof expecting==='function'&&expecting(),cloth:sizeFor(heightNow()),hat:hatSizeFor(m),sock:sockSizeFor(m),mit:mittenSizeFor(m)};}
let SZFROM='prof';
/* таблица размеров открывается отовсюду, где мы называем размер; tgt — размер «к дате» */
function openSizes(from,tgt){SZFROM=from||'prof';const d=sizesData();if(tgt&&tgt!==d.cloth)d.tgt=tgt;renderSizes(d,false);go('sizes');}
function szBack(){go(SZFROM);}
/* заметная карточка «Размеры малыша» — в вишлисте и в списке по ссылке */
function szCard(d,onclick){
  return `<button class="szcardbtn" onclick="${onclick}">
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect width="34" height="34" rx="11" fill="#EFEAF7"></rect>
      <g stroke="#7C6BA6" stroke-width="2" stroke-linecap="round"><path d="M12 8v18M12 10h4M12 14h3M12 18h4M12 22h3M12 26h4"></path><path d="M20 12l3-3 3 3M23 9v16M20 22l3 3 3-3"></path></g></svg>
    <span><b>Размеры${d.nm?' '+esc2(nameCases(d.nm).gen):' малыша'}</b><s>одежда ${d.cloth} · шапка ${d.hat} · носки ${d.sock} см</s></span><em>›</em></button>`;
}
function szI(tgt){return `<button class="szi" aria-label="Все размеры" onclick="event.stopPropagation();openSizes(S.screen${tgt?','+tgt:''})">i</button>`;}
function renderSizes(d,shared){
  const rows=SIZETBL.map(r=>`<tr class="${r[0]===d.cloth?'cur':(r[0]===d.tgt?'tgt':'')}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  document.getElementById('szTitle').textContent=d.nm?('Размеры '+nameCases(d.nm).gen):'Размеры малыша';
  document.getElementById('szBody').innerHTML=
    `<div class="szcard"><div class="sznow">Сейчас впору</div><div class="szbig">${d.cloth}</div>`
    +`<div class="szsub">${d.nm?d.nm+' · ':''}${d.exp?'ждём малыша':(d.m?d.m+' '+monthsWord(d.m):'первый месяц')} · рост ~${d.h} см</div>`
    +`<div class="szrow"><span>Шапка (обхват головы)</span><b>${d.hat}</b></div>`
    +`<div class="szrow"><span>Носки (длина стопы)</span><b>${d.sock} см</b></div>`
    +`<div class="szrow"><span>Варежки (обхват ладони)</span><b>${d.mit}</b></div></div>`
    +`<div class="szsecth">Одежда — РФ, рост и US</div>`
    +`<table class="sztbl"><thead><tr><th>РФ</th><th>рост, см</th><th>US</th></tr></thead><tbody>${rows}</tbody></table>`
    +`<div class="szhint">Российский размер одежды равен росту в сантиметрах (как и в Европе). US — по возрасту. Ваш размер выделен${d.tgt?`, размер к дате — <b style="color:#6C5A98">${d.tgt}</b> — сиреневым`:''}.</div>`
    +`<div class="szsecth" style="margin-top:18px">Шапки</div>`+accTable(HATT,d.hat,'обхват головы, см')
    +`<div class="szhint">Размер шапки — это обхват головы: измерьте сантиметром над бровями и ушами. На вырост можно взять на 1–2 см больше (сейчас — ${d.hat+1}–${d.hat+2}), лучше с завязками: так она не сползёт. Больше не стоит — шапка съедет на глаза и не закроет уши. До года голова растёт быстро, поэтому тёплую шапку покупайте ближе к сезону.</div>`
    +`<div class="szsecth" style="margin-top:18px">Варежки</div>`+accTable(MITT,d.mit,'обхват ладони, см')
    +`<div class="szhint">Обхват ладони меряют по самой широкой части, без большого пальца. Варежки можно смело брать на размер больше — на резинке они не слетят.</div>`;
  // в шапке — фото малыша, если есть (по ссылке фото не передаём — там ростомер)
  const ph=!shared&&kid().photo, av=document.getElementById('szAv');
  av.innerHTML=ph?`<img src="${ph}" alt="">`:''; av.style.display=ph?'block':'none';
  document.getElementById('szIco').style.display=ph?'none':'';
  document.getElementById('szBack').style.display=shared?'none':'flex';
  document.getElementById('szShareBtn').style.display=shared?'none':'block';
  document.getElementById('szOpenBtn').style.display=shared?'block':'none';
}
/* подпись возрастного диапазона строки таблицы: «0–1 мес», «1–1,5 года», «3 года+» */
function ageSpan(a,b){const f=x=>x<12?x+'':(x%12?String(x/12).replace('.',','):x/12+'');
  if(b==null)return a<12?a+' мес+':f(a)+' '+(a<60?'года':'лет')+'+';
  return b<=12?`${a}–${b} мес`:`${f(a)}–${f(b)} ${b<60?'года':'лет'}`;}
function accTable(T,cur,unit){
  return `<table class="sztbl"><thead><tr><th>возраст</th><th>${unit}</th></tr></thead><tbody>`
    +T.map((t,i)=>`<tr class="${t[1]===cur?'cur':''}"><td>${ageSpan(t[0],T[i+1]&&T[i+1][0])}</td><td>${t[1]}</td></tr>`).join('')+`</tbody></table>`;}
async function copySizesLink(){
  const d=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(sizesData())))));
  const url=await shortLink('sizes',d,location.origin+location.pathname+'#sizes='+d);
  shareUrl('Размеры Lookaboo',url);
}
function sizesFromHash(){const m=(location.hash||'').match(/sizes=([^&]+)/);if(!m)return null;
  try{return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1])))));}catch(e){return null;}}
