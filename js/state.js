/* состояние: хранилище, дети, общие настройки */
/* ================= состояние ================= */
const store = (()=>{let mem={};try{localStorage.setItem('_t','1');localStorage.removeItem('_t');
  return{get:k=>localStorage.getItem(k),set:(k,v)=>localStorage.setItem(k,v)};}catch(e){return{get:k=>mem[k]??null,set:(k,v)=>{mem[k]=v;}};}})();

/* ---- дети: приложением может пользоваться мама двоих ---- */
function blankKid(){return{id:Date.now()+Math.floor(Math.random()*1000),name:'',photo:null,
  dob:new Date().toISOString().slice(0,10),gender:'any',meas:null};}
let KIDS=[], KI=0;
(function(){
  try{const a=JSON.parse(store.get('mpp-kids')||'null');
    if(Array.isArray(a)&&a.length){KIDS=a;KI=Math.min(Math.max(0,+(store.get('mpp-ki')||0)),a.length-1);return;}}catch(e){}
  const h=parseFloat(store.get('mpp-h')||'0');
  KIDS=[{id:1,name:'',photo:null,
    dob:store.get('mpp-dob')||'2026-04-24',
    gender:store.get('mpp-g')||'any',
    meas:h?{h:h,d:store.get('mpp-hd')||new Date().toISOString().slice(0,10)}:null}];
  KI=0;
})();
function kid(){return KIDS[KI]||(KIDS[KI]=blankKid());}
function kidsSave(){try{store.set('mpp-kids',JSON.stringify(KIDS));store.set('mpp-ki',String(KI));return true;}catch(e){return false;}}

const S = {
  city: store.get('mpp-city') || 'Москва',
  geo: store.get('mpp-geo')==='0' ? 'город' : 'гео',
  lat:null, lon:null,
  rem: store.get('mpp-rem')===null ? 14 : +store.get('mpp-rem'),
  onb: store.get('mpp-onb')==='1', screen: 'o1',
  temp: 8, feels: 5, wind: 3, weather: 'rain', setIdx: 0, live: false, wx: 'none', ctx: store.get('mpp-ctx') || 'stroller'
};
/* дата рождения, пол и замер всегда берутся у активного малыша */
Object.defineProperty(S,'dob',   {get:()=>kid().dob,    set:v=>{kid().dob=v;kidsSave();}});
Object.defineProperty(S,'gender',{get:()=>kid().gender, set:v=>{kid().gender=v;kidsSave();}});
Object.defineProperty(S,'meas',  {get:()=>kid().meas,   set:v=>{kid().meas=v;kidsSave();}});
(function(){const ll=(store.get('mpp-ll')||'').split(',');
  if(ll.length===2){S.lat=+ll[0];S.lon=+ll[1];}})();
