/* свайп, подгонка макета, запуск */
/* ===== свайп между наборами ===== */
function initSwipe(){
  const el=document.getElementById('stage'); if(!el)return;
  let x0=null,y0=null,t0=0;
  el.addEventListener('touchstart',e=>{const t=e.changedTouches[0];x0=t.clientX;y0=t.clientY;t0=Date.now();},{passive:true});
  el.addEventListener('touchend',e=>{
    if(x0===null)return;
    const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0;
    x0=null;
    if(Date.now()-t0>700)return;
    if(Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy)*1.4)return;
    SWIPED=true; setTimeout(()=>SWIPED=false,350);
    flip(dx<0?1:-1);
  },{passive:true});
}
let SWIPED=false;

/* ===== макет: ширина всегда 390, высота подстраивается под экран ===== */
function fit(){
  const ae=document.activeElement;
  if(ae&&/^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName))return;
  const vv=window.visualViewport;
  const w=vv?vv.width:window.innerWidth, h=vv?vv.height:window.innerHeight;
  let s=w/390, H=h/s;
  if(H>1010){H=1010;s=h/1010;}
  if(H<640){H=640;s=h/640;}
  const ph=document.getElementById('phone');
  ph.style.height=Math.round(H)+'px';
  ph.style.transform='scale('+s+')';
  /* вертикальный ритм тянется за высотой экрана, иначе на коротких всё наезжает */
  const k=Math.min(1,H/844);
  const wb=Math.max(188,Math.round(206*k));         // погодная полоса
  const bb=Math.max(130,Math.round(154*k));         // нижняя полоса — всегда одна и та же
  const ot=Math.max(196,Math.round(250*k));         // верх карточки онбординга
  const ob=Math.max(140,Math.round(172*k));         // полоса онбординга
  const st=ph.style;
  st.setProperty('--wb',wb+'px');
  st.setProperty('--wk',(wb/244).toFixed(3));
  st.setProperty('--at',(wb+8)+'px');
  st.setProperty('--bb',bb+'px');
  st.setProperty('--ab',(bb+82)+'px');
  st.setProperty('--ot',ot+'px');
  st.setProperty('--ok',(ot/250).toFixed(3));
  st.setProperty('--obb',ob+'px');
  paintMain();
}
window.addEventListener('resize',fit);
window.addEventListener('orientationchange',()=>setTimeout(fit,120));
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);

/* ================= запуск ================= */
function autoWeather(){
  if(S.geo==='город'&&S.lat!=null){fetchWeather(S.lat,S.lon,true);return;}
  retryWeather();
}
function boot(){
  const shared=sharedFromHash();
  if(shared){ try{fit();}catch(e){} renderShared(shared); return; }   // открыли по ссылке — только просмотр списка
  const szd=sizesFromHash();
  if(szd){ try{fit();}catch(e){} renderSizes(szd,true);
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
    document.getElementById('sizes').classList.add('on'); return; }
  fit();initDate();paintGender();wishBadge();initHeight();initCity();initSheet();
  initProfFile();initSwipe();paintMain();
  if(S.onb){go('main');autoWeather();}
  else{go('o1');}
}
boot();
