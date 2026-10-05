/* данные: погодные диапазоны, наборы, картинки, рост и размеры */
/* ================= данные ================= */
/* картинки берутся из каталога js/catalog.js (собирается tools/catalog.py, правила — IMAGES.md):
   IMG — имя → файл, CAND — вид вещи → имена, GT — пол (g/b; нейтральные без метки), AGE — [от, до) месяцев */
const IMG={}, CAND={}, GT={}, AGE={}, FANCY={}, COLOR={}, CAND_KINDS={};
CATALOG.forEach(c=>{IMG[c.id]=c.file; AGE[c.id]=c.a; COLOR[c.id]=c.c||[]; CAND_KINDS[c.id]=c.kinds; if(c.g!=='n')GT[c.id]=c.g;
  c.kinds.forEach(k=>{if(k==='fancy')FANCY[c.id]=1; (CAND[k]=CAND[k]||[]).push(c.id);});});

const NOTLAYER=['hat','hatWarm','panama','socks','mittens','muslin','blanket','toy','headband'];
/* ориентир по утеплителю (синтепон/изософт, г/м²) — у брендов отличается */
const INS=[
  {max:-26, g:'пух 90/10', note:'Ниже −25 синтетика почти не держит тепло — здесь выигрывает пух.'},
  {max:-18, g:'300 г',     note:'При −15 и −25 нужны разные комбинезоны: по утеплителю разница почти в полтора раза.'},
  {max:-13, g:'250 г',     note:'Смотрите на граммы утеплителя, а не только на слово «зимний» на бирке.'},
  {max:-8,  g:'200 г',     note:''},
  {max:-3,  g:'150 г',     note:''},
  {max:3,   g:'100–150 г', note:''},
  {max:99,  g:'60–100 г',  note:''}
];
function insFor(eff){for(const x of INS){if(eff<=x.max)return x;}return INS[INS.length-1];}
const INSKEYS=['ovWinter','ovDemi'];
const SHORT={ovFleece:'флис',ovWinter:'зимний',ovDemi:'демисезонный',bodyL:'боди д/р',bodyS:'боди к/р',
  bodyT:'боди-майка',slip:'слип',slipKnit:'вязаный слип',cardigan:'кофта',sweater:'свитер',
  pants:'штанишки',shorts:'шорты',dungarees:'полукомбинезон',jacket:'куртка',vest:'жилет',
  dress:'платье',romper:'песочник',hatWarm:'тёплая шапка',hat:'шапка',panama:'панамка',socks:'носки',mittens:'варежки',muslin:'пелёнка',blanket:'плед',
  wrap:'распашонка',wrapbody:'боди-распашонка',footpants:'ползунки',tank:'майка',toy:'грызунок'};
function okFor(n,g){
  const t=GT[n]; if(!t)return true;
  if(g==='girl')return t==='g';
  if(g==='boy')return t==='b';
  return false;                      // «сюрприз» — только нейтральные вещи
}
/* картинки для вещи: свой пол + нейтральные, подходящие по возрасту; нарядное — в конец.
   m — возраст в месяцах (по умолчанию сейчас). Нет подходящих по возрасту — берём без учёта возраста */
/* пока картинок какого-то вида нет — показываем похожую вещь (подпись остаётся своя) */
const SUBST={bodyT:['bodyS'],tank:['bodyS'],wrap:['bodyL'],wrapbody:['bodyL','bodyS'],footpants:['pants'],
  romper:['bodyS'],ovWinter:['ovDemi','ovFleece'],ovDemi:['ovFleece'],slipKnit:['slip']};
function candFor(key,m){
  const g=S.gender;
  let src=key; if(!(CAND[key]||[]).some(n=>IMG[n]))src=(SUBST[key]||[]).find(k=>(CAND[k]||[]).some(n=>IMG[n]))||key;
  let all=(CAND[src]||[]).filter(n=>IMG[n]&&okFor(n,g));
  // в холод ножки малыша должен закрывать сам комбинезон или слип — без стопы не берём, если есть другие
  if(['ovFleece','ovDemi','ovWinter','slipKnit','slip'].includes(key)&&typeof effTemp==='function'&&effTemp()<=3){
    const f=all.filter(n=>!/nofeet/.test(n)); if(f.length)all=f; }
  const age=m==null?ageMonthsExact():m;
  // мальчику розового не предлагаем совсем (в том числе нейтральные вещи розоватого цвета)
  if(g==='boy'&&typeof pinkish==='function'){const np=all.filter(n=>!pinkish(n)); if(np.length)all.splice(0,all.length,...np);}
  const fit=all.filter(n=>{const a=AGE[n];return !a||(age>=a[0]&&age<a[1]);});
  const l=(fit.length?fit:all).slice();
  const tag=g==='girl'?'g':(g==='boy'?'b':'_');
  // девочковые и мальчиковые вещи не задвигают нейтральные: чуть выше в списке, но вперемешку.
  // Порядок внутри — постоянный «случайный» (по имени), чтобы в подбор попадали разные вещи
  const hs=n=>{let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))|0;return (h>>>0)%1000/1000;};
  const score=n=>(GT[n]===tag?.3:0)-(FANCY[n]?3:0)+hs(n);
  l.sort((a,b)=>score(b)-score(a));
  return l.length?l:(CAND[src]||[]).filter(n=>IMG[n]).slice(0,1);
}
function pickImg(key,v,m){
  const l=candFor(key,m); if(!l.length)return '';
  return IMG[l[((v||0)%l.length+l.length)%l.length]]||IMG[l[0]]||'';
}

/* медианный рост по ВОЗ (length-for-age, 50-й перцентиль), см */
const GROWTH_B={0:49.9,1:54.7,2:58.4,3:61.4,4:63.9,5:65.9,6:67.6,7:69.2,8:70.6,9:72.0,10:73.3,11:74.5,12:75.7,15:79.1,18:82.3,21:85.1,24:87.1};
const GROWTH_G={0:49.1,1:53.7,2:57.1,3:59.8,4:62.1,5:64.0,6:65.7,7:67.3,8:68.7,9:70.1,10:71.5,11:72.8,12:74.0,15:77.5,18:80.7,21:83.7,24:85.7};
const GROWTH_A={};for(const k in GROWTH_B)GROWTH_A[k]=Math.round((GROWTH_B[k]+GROWTH_G[k])/2*10)/10;
const GROWTH={boy:GROWTH_B,girl:GROWTH_G,any:GROWTH_A};
function interp(T,m){
  const k=Object.keys(T).map(Number).sort((a,b)=>a-b);
  if(m<=k[0])return T[k[0]];
  if(m>=k[k.length-1])return T[k[k.length-1]];
  for(let i=0;i<k.length-1;i++) if(m>=k[i]&&m<=k[i+1]){
    const t=(m-k[i])/(k[i+1]-k[i]);return T[k[i]]+t*(T[k[i+1]]-T[k[i]]);}
  return T[k[0]];
}

const SIZES = [50,56,62,68,74,80,86,92,98,104];
function heightFor(m,g){return interp(GROWTH[g||S.gender]||GROWTH_A,m);}

/* ---- возраст в месяцах на произвольную дату (с точностью до дня) ---- */
const MS=86400000, MDAYS=30.4375;
function ageAt(dateStr){
  const d0=new Date(S.dob), d1=dateStr?new Date(dateStr):new Date();
  return Math.max(0,(d1-d0)/MS/MDAYS);
}
function ageMonthsExact(){return ageAt(null);}

/* ---- считаем от того, что сказала мама: запоминаем её отклонение в сантиметрах ---- */
function offsetCm(){
  if(!S.meas)return 0;
  const d=S.meas.h-heightFor(ageAt(S.meas.d));
  return Math.max(-15,Math.min(15,d));          // защита от опечатки
}
/* рост на возраст m: средний прирост для возраста, отложенный от роста малыша */
function heightAt(m){return heightFor(m)+offsetCm();}
function heightNow(){return heightAt(ageMonthsExact());}
function sizeAt(m){return sizeFor(heightAt(m));}
/* размер → примерный рост: размер N закрывает рост от N-6 до N */
function sizeToHeight(sz){return sz-3;}
function fmtDate(str){const d=new Date(str);return d.getDate()+' '+['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][d.getMonth()];}
function todayStr(){return new Date().toISOString().slice(0,10);}
function sizeFor(h){for(const s of SIZES){if(s>=h-1)return s;}return 104;}
/* размеры аксессуаров по возрасту (РФ): шапка = обхват головы, носки = длина стопы, варежки = обхват ладони */
function hatSizeFor(m){const T=[[0,35],[1,38],[2,40],[3,42],[6,44],[9,46],[12,47],[18,48],[24,49],[36,50]];let s=35;for(const t of T)if(m>=t[0])s=t[1];return s;}
function sockSizeFor(m){return m<3?10:(m<12?12:(m<24?14:16));}
function mittenSizeFor(m){return m<6?10:(m<12?11:12);}
/* строка размера для вещи: аксессуары — своя сетка, муслин/плед/игрушка — без размера, остальное — размер одежды */
function accSize(key,m){
  if(key==='hat'||key==='hatWarm'||key==='panama')return 'обхват '+hatSizeFor(m);
  if(key==='socks')return 'стопа '+sockSizeFor(m)+' см';
  if(key==='mittens')return 'обхват ладони '+mittenSizeFor(m);
  return null;
}
/* чем укрыть малыша — по погоде: в жару муслиновая пелёнка, в среднюю — хлопковая, в холод — плед
   (в коляске, в машине, где угодно; конверты — позже, когда будут картинки) */
function swaddleFor(t){ return t>=22?['muslin','муслиновая пелёнка']:(t>=17?['muslin','хлопковая пелёнка']:(t>=10?['blanket','тонкий плед']:['blanket','плед'])); }
function sizeForItem(key,m,clothSize){
  const a=accSize(key,m); if(a!==null)return a;
  if(key==='muslin'||key==='blanket'||key==='toy'||key==='headband'||key==='raincover'||key==='umbrella'||key==='spf')return '';
  if(key==='costume'){const L=[50,56,62,68,74,80,86,92,98,104];const i=L.indexOf(+clothSize);return i>=0&&i<L.length-1?L[i+1]:clothSize;} // костюм — поверх одежды, на размер больше
  return clothSize;
}
/* подпись размера: голое число одежды → «размер 68»; аксессуары уже самоописательны («обхват 44») */
function szTxt(v){v=v==null?'':(''+v).trim();if(!v)return '';return /^\d+$/.test(v)?'размер '+v:v;}
function monthsWord(m){const n=m%100;if(n>=11&&n<=14)return 'месяцев';const d=m%10;if(d===1)return 'месяц';if(d>=2&&d<=4)return 'месяца';return 'месяцев';}

/* наборы по эффективной температуре */
const BANDS = [
  {max:-12, title:'Сильный мороз', tip:'В такой мороз малышу хватит 20 минут прогулки — и загляните под шапку проверить щёки.', sets:[
    {name:'с флисом внутри', it:[['bodyL','шерстяное боди'],['ovFleece','флисовый комбинезон'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'кофта и штаны под комбинезон', it:[['bodyL','шерстяное боди'],['cardigan','вязаная кофта'],['pants','тёплые штанишки'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['socks','тёплые носки']]},
    {name:'два слоя под низ', it:[['bodyL','шерстяное боди'],['slip','тёплый слип'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]}]},

  {max:-5, title:'Мороз', tip:'Шею малышу надёжнее закрыть высоким воротом слипа, чем шарфом — шарф в коляске сползает.', sets:[
    {name:'с флисом', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'вязаный', it:[['bodyL','боди д/р'],['slipKnit','вязаный слип'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'полегче', it:[['bodyL','боди д/р'],['slip','хлопковый слип'],['ovWinter','зимний комбинезон'],['socks','тёплые носки']]}]},

  {max:1, title:'Холодно', tip:'Варежки на резинке малыш не потеряет, а без них он будет мёрзнуть именно кистями.', sets:[
    {name:'с флисом', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['ovDemi','утеплённый комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'кофта и штаны под комбинезон', it:[['bodyL','боди д/р'],['cardigan','вязаная кофта'],['pants','тёплые штанишки'],['ovDemi','утеплённый комбинезон'],['hatWarm','тёплая шапка']]},
    {name:'два слоя', it:[['slip','хлопковый слип'],['ovDemi','утеплённый комбинезон'],['socks','носки'],['blanket','плед']]}]},

  {max:6, title:'Прохладно', tip:'В межсезонье малышу удобнее три тонких слоя, чем один толстый: лишний снимается за секунду.', sets:[
    {name:'с флисом', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['ovDemi','демисезонный'],['hat','шапка']]},
    {name:'свитер и штаны под комбинезон', min:3, it:[['bodyL','боди д/р'],['sweater','вязаный свитер'],['pants','штанишки'],['ovDemi','демисезонный'],['hat','шапка']]},
    {name:'полегче', it:[['slip','хлопковый слип'],['ovFleece','флисовый комбинезон'],['hat','шапка'],['blanket','плед']]}]},

  {max:11, title:'Свежо', tip:'Зайдёте в магазин — снимите с малыша верхний слой: в помещении он перегревается за десять минут.', sets:[
    {name:'с комбинезоном', it:[['bodyL','боди д/р'],['slip','хлопковый слип'],['ovFleece','флисовый комбинезон'],['hat','шапка']]},
    {name:'флис сверху', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['socks','носки']]},
    {name:'с курткой', min:9, it:[['bodyL','боди д/р'],['pants','штанишки'],['jacket','стёганая куртка'],['hat','шапка']]}]},

  {max:16, title:'Прохладное утро', tip:'Тонкая шапочка малышу нужна до +16: голова у него большая относительно тела и отдаёт много тепла.', sets:[
    {name:'с кофтой', it:[['bodyL','боди д/р'],['cardigan','вязаная кофта'],['pants','штанишки'],['muslin','хлопковая пелёнка']]},
    {name:'слип и кофта', it:[['slip','хлопковый слип'],['cardigan','вязаная кофта'],['hat','тонкая шапочка']]},
    {name:'боди-распашонка и слип', max:5, it:[['wrapbody','боди-распашонка'],['slip','хлопковый слип сверху'],['hat','тонкая шапочка'],['blanket','тонкий плед']]},
    {name:'с жилетом', min:9, it:[['bodyL','боди д/р'],['pants','штанишки'],['vest','стёганый жилет'],['socks','носки']]}]},

  {max:21, title:'Тепло', tip:'Запасное боди в сумке — малыш в тепле потеет в складочках, и сухая смена выручает чаще, чем кажется.', sets:[
    {name:'боди и штанишки', it:[['bodyL','боди д/р'],['pants','штанишки'],['panama','панамка'],['socks','носки']]},
    {name:'лёгкий слип', it:[['slip','лёгкий слип'],['panama','панамка'],['muslin','хлопковая пелёнка']]},
    {name:'распашонка и ползунки', max:5, it:[['wrapbody','боди-распашонка'],['footpants','ползунки'],['panama','панамка'],['muslin','хлопковая пелёнка']]},
    {name:'с полукомбинезоном', min:6, it:[['bodyS','боди к/р'],['dungarees','джинсовый полукомбинезон'],['panama','панамка'],['muslin','хлопковая пелёнка']]},
    {name:'платье', only:'girl', it:[['dress','боди-платье'],['panama','панамка'],['socks','носки']]}]},

  {max:25, title:'Жарко', tip:'Носки в жару малышу не нужны — через стопы он как раз сбрасывает лишнее тепло.', sets:[
    {name:'лёгкий набор', it:[['bodyS','боди к/р'],['shorts','шорты'],['panama','панамка'],['muslin','муслиновая пелёнка']]},
    {name:'майка и шорты', it:[['tank','майка'],['shorts','шорты'],['panama','панамка'],['toy','грызунок']]},
    {name:'боди-платье', only:'girl', it:[['dress','боди-платье'],['panama','панамка'],['muslin','муслиновая пелёнка']]},
    {name:'песочник', only:'boy', it:[['romper','песочник'],['panama','панамка'],['muslin','муслиновая пелёнка']]}]},

  {max:99, title:'Очень жарко', tip:'В жару малыша защищают тень, мягкая панамка и прогулка до 11 и после 17. Крем от солнца — с полугода, детский, с минеральным фильтром.', sets:[
    {name:'минимум', it:[['bodyT','боди-майка'],['panama','панамка'],['muslin','муслиновая пелёнка']]},
    {name:'боди и шорты', it:[['bodyS','боди к/р'],['shorts','лёгкие шорты'],['panama','панамка']]},
    {name:'боди-платье', only:'girl', it:[['dress','боди-платье'],['panama','панамка'],['muslin','муслиновая пелёнка']]},
    {name:'песочник', only:'boy', it:[['romper','песочник'],['panama','панамка'],['muslin','муслиновая пелёнка']]}]}
];

const WTIPS = {
  rain:'Дождевик — на коляску, а не на малыша: ему важнее не перегреться под плёнкой.',
  snow:'Мокрый снег промочит пух быстрее синтетики — малышу в такую погоду теплее в мембране.',
  sun:'Мягкая панамка закроет малышу уши и шею — там кожа сгорает первой.',
  cloud:null
};

const SCENES = {
  rain:{grad:'linear-gradient(172deg,#7E93A2,#BCC8CF)',band:'#E3CFAE',word:'дождь'},
  snow:{grad:'linear-gradient(172deg,#5C6C92,#AFBCD2)',band:'#D6DAEE',word:'снег'},
  sun:{grad:'linear-gradient(172deg,#6FC8D4,#BFE9E2)',band:'#F4E2B0',word:'солнце'},
  cloud:{grad:'linear-gradient(172deg,#A8C0D2,#DCE6DE)',band:'#DCE8CE',word:'облачно'},
  frost:{grad:'linear-gradient(172deg,#333C6B,#6A76AC)',band:'#D6DAEE',word:'ясно, мороз'}
};
/* цвет строки состояния — под верх текущего экрана, чтобы не было серой полосы */
const THEME={rain:'#7E93A2',snow:'#5C6C92',sun:'#6FC8D4',cloud:'#A8C0D2',frost:'#333C6B'};
const SCRTHEME={o1:'#E8734F',o2:'#7FA2B8',o4:'#7FA2B8',o3:'#8FA87E',wl:'#C4613C',tl:'#8C7FA8',trip:'#6E8FA8',ev:'#8C7FA8',wd:'#7A8C5A',prof:'#B0705A'};
function setTheme(c){
  document.querySelectorAll('meta[name=theme-color]').forEach(m=>m.setAttribute('content',c));
  document.documentElement.style.background=c;
  document.body.style.background=c;
}
function themeFor(id){return id==='main'?skyFor(S.weather).top:(SCRTHEME[id]||'#FCF7F0');}

/* ---- небо в шапке: время суток и сезон ----
   Восход и заход считаем сами по широте и долготе (формулы NOAA), без запроса к погоде:
   так шапка верна и без интернета. Время берём всемирное — часовой пояс не нужен. */
function sunTimes(lat,lon,d){
  const rad=Math.PI/180, y0=Date.UTC(d.getUTCFullYear(),0,1), N=Math.floor((d-y0)/864e5)+1;
  const g=2*Math.PI/365*(N-1);
  const eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const c=Math.cos(90.833*rad)/(Math.cos(lat*rad)*Math.cos(dec))-Math.tan(lat*rad)*Math.tan(dec);
  if(c>1)return {polar:'night'}; if(c<-1)return {polar:'day'};
  const ha=Math.acos(c)/rad;
  return {rise:720-4*(lon+ha)-eq, set:720-4*(lon-ha)-eq};      // минуты от полуночи UTC
}
/* 'dawn' | 'day' | 'dusk' | 'night' */
function dayPhase(now){
  now=now||new Date();
  const lat=S.lat!=null?+S.lat:55.75, lon=S.lon!=null?+S.lon:37.62;      // без города — Москва
  const t=sunTimes(lat,lon,now); if(t.polar)return t.polar;
  const m=now.getUTCHours()*60+now.getUTCMinutes();
  const df=x=>((m-x)%1440+1440+720)%1440-720;                            // от −720 до +720 минут
  if(df(t.rise)>=-45&&df(t.rise)<=50)return 'dawn';
  if(df(t.set)>=-60&&df(t.set)<=35)return 'dusk';
  const dayLen=((t.set-t.rise)%1440+1440)%1440;
  return (((m-t.rise)%1440+1440)%1440)<dayLen?'day':'night';
}
/* сезон по месяцу; в южном полушарии наоборот */
function seasonNow(d){
  const m=(d||new Date()).getMonth(), s=['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'][m];
  if(S.lat!=null&&+S.lat<0)return {winter:'summer',summer:'winter',spring:'autumn',autumn:'spring'}[s];
  return s;
}
/* градиент неба: погода × время суток. top — цвет строки состояния */
const SKY={
  night:{rain:['#2E3A55','#56627E'],snow:['#2A3461','#5B6893'],sun:['#1C2346','#3D4A7E'],cloud:['#283255','#56618B'],frost:['#1A2045','#3A4680']},
  dawn: {rain:['#7F8AA2','#D7B9A8'],snow:['#7C86B0','#E2C6C4'],sun:['#86A5CC','#F6C9A6'],cloud:['#93A7C2','#EFCDB8'],frost:['#6F80B2','#F1C3AE']},
  dusk: {rain:['#6F7392','#D2A08C'],snow:['#6A6E9E','#D9AFB3'],sun:['#6D6CA3','#F3A27C'],cloud:['#7C7DA6','#EDB08F'],frost:['#575C96','#EE9F80']}
};
/* подробности погоды для шапки: туман, морось, ливень, гроза, мокрый снег, снегопад, сильный ветер.
   По коду погоды Open-Meteo; без живой погоды — только то, что выбрано вручную */
function wxDetail(){
  const c=S.live?S.wcode:null, K={45:'fog',48:'fog',51:'drizzle',53:'drizzle',55:'drizzle',56:'sleet',57:'sleet',
    61:'rain',63:'rain',65:'heavy',66:'sleet',67:'sleet',71:'snow',73:'snow',75:'heavysnow',77:'snow',80:'shower',81:'shower',82:'heavy',
    85:'snow',86:'heavysnow',95:'thunder',96:'thunder',99:'thunder'};
  const kind=c!=null&&K[c]?K[c]:(S.weather==='rain'?'rain':(S.weather==='snow'?'snow':null));
  const wind=(S.wind||0)>=10||(S.live&&(S.gust||0)>=15);
  return {kind,wind};
}
const WXWORD={fog:'туман',drizzle:'морось',rain:'дождь',shower:'ливень',heavy:'сильный дождь',thunder:'гроза',sleet:'мокрый снег',snow:'снег',heavysnow:'снегопад'};
function skyFor(w){
  const ph=dayPhase(), dt=wxDetail();
  if(dt.kind==='fog'||dt.kind==='thunder'){                      // туман — молочно-серое небо, гроза — тёмное
    const F={fog:{day:['#A3ADB4','#D8DCDB'],dawn:['#A9A8B4','#E2CFC4'],dusk:['#9C98AA','#D9BDB0'],night:['#3A4258','#606A80']},
             thunder:{day:['#4E5868','#8C96A2'],dawn:['#555A70','#A28F92'],dusk:['#4F4F6A','#9A8088'],night:['#1E2338','#3E4660']}}[dt.kind][ph];
    return {grad:`linear-gradient(172deg,${F[0]},${F[1]})`, top:F[0], ph};
  }
  const c=(SKY[ph]||{})[w];
  if(!c){const sc=SCENES[w]||SCENES.cloud; return {grad:sc.grad, top:THEME[w]||'#A8C0D2', ph};}
  return {grad:`linear-gradient(172deg,${c[0]},${c[1]})`, top:c[0], ph};
}
