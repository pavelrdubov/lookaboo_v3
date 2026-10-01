/* демо-панель */
/* ================= демо-панель ================= */
function openSheet(){
  const h=document.getElementById('wxHint');
  if(h)h.textContent = (S.wx==='live')
    ? 'Погода взята автоматически. Здесь можно посмотреть другие варианты.'
    : 'Укажите, что за окном — экран пересоберётся целиком.';
  document.getElementById('sheet').classList.add('on');document.getElementById('veil').classList.add('on');}
function closeSheet(){document.getElementById('sheet').classList.remove('on');document.getElementById('veil').classList.remove('on');}
function setW(w,silent){S.weather=w;S.live=false;if(!silent&&(S.wx==='none'||S.wx==='fail'))S.wx='manual';document.querySelectorAll('.wbtns button').forEach(b=>b.classList.toggle('on',b.dataset.w===w));paintMain();}
function initSheet(keep){
  if(!keep&&!SHEETHTML)SHEETHTML=document.getElementById('sheet').innerHTML;
  const t=document.getElementById('trange');
  if(t){
    t.value=S.temp;
    const lb=document.getElementById('tLabel'); if(lb)lb.textContent=(S.temp>0?'+':'')+S.temp+'°';
    t.oninput=()=>{S.temp=+t.value;S.live=false;S.wx='manual';
      document.getElementById('tLabel').textContent=(S.temp>0?'+':'')+S.temp+'°';
      if(S.temp<=-2&&S.weather==='rain')S.weather='snow';paintMain();};
  }
  document.querySelectorAll('.wbtns button').forEach(b=>b.classList.toggle('on',b.dataset.w===S.weather));
}
