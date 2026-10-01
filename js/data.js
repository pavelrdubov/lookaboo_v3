/* данные: погодные диапазоны, наборы, картинки, рост и размеры */
/* ================= данные ================= */
const IMG = {"bl_blue_clouds": "img/bl_blue_clouds.webp", "bl_blue_plain": "img/bl_blue_plain.webp", "bl_cream": "img/bl_cream.webp", "bl_pink_stars": "img/bl_pink_stars.webp", "blanket_knit_grey": "img/blanket_knit_grey.webp", "blanket_knit_navy": "img/blanket_knit_navy.webp", "blanket_quilt_beige": "img/blanket_quilt_beige.webp", "blanket_sherpa_beige": "img/blanket_sherpa_beige.webp", "blanket_sherpa_cream": "img/blanket_sherpa_cream.webp", "bloomers_rose": "img/bloomers_rose.webp", "body_collar_beige": "img/body_collar_beige.webp", "bodydress_cream": "img/bodydress_cream.webp", "bodydress_cream_navy": "img/bodydress_cream_navy.webp", "bonnet_cream": "img/bonnet_cream.webp", "booties_pink": "img/booties_pink.webp", "bs_pink_hearts": "img/bs_pink_hearts.webp", "bs_striped": "img/bs_striped.webp", "bt_grey": "img/bt_grey.webp", "dungarees_mustard": "img/dungarees_mustard.webp", "hat_sage": "img/hat_sage.webp", "hatwarm_navy": "img/hatwarm_navy.webp", "jacket_khaki": "img/jacket_khaki.webp", "mittens_blue": "img/mittens_blue.webp", "muslin_border_cream": "img/muslin_border_cream.webp", "muslin_cream": "img/muslin_cream.webp", "muslin_sage": "img/muslin_sage.webp", "muslin_sage_stack": "img/muslin_sage_stack.webp", "muslin_stack_cream": "img/muslin_stack_cream.webp", "muslin_white": "img/muslin_white.webp", "ov_fleece_beige": "img/ov_fleece_beige.webp", "ov_fleece_pink": "img/ov_fleece_pink.webp", "ov_knit_oat": "img/ov_knit_oat.webp", "ov_winter_blue": "img/ov_winter_blue.webp", "ov_winter_navy": "img/ov_winter_navy.webp", "ov_winter_navy2": "img/ov_winter_navy2.webp", "pants_check_red": "img/pants_check_red.webp", "pants_navy": "img/pants_navy.webp", "pants_pink_stars": "img/pants_pink_stars.webp", "pinafore_check": "img/pinafore_check.webp", "romper_blue": "img/romper_blue.webp", "shirtbody_blue": "img/shirtbody_blue.webp", "shorts_beige": "img/shorts_beige.webp", "shorts_navy": "img/shorts_navy.webp", "slip_caramel": "img/slip_caramel.webp", "slip_cream": "img/slip_cream.webp", "slip_cream_dots": "img/slip_cream_dots.webp", "slip_fleece_navy": "img/slip_fleece_navy.webp", "slip_knit_burgundy": "img/slip_knit_burgundy.webp", "slip_plush_pink": "img/slip_plush_pink.webp", "slipknit_blue": "img/slipknit_blue.webp", "slipknit_cream": "img/slipknit_cream.webp", "slipknit_grey": "img/slipknit_grey.webp", "socks_cream": "img/socks_cream.webp", "socks_ecru": "img/socks_ecru.webp", "socks_navy": "img/socks_navy.webp", "sweater_cream": "img/sweater_cream.webp", "tank_grey": "img/tank_grey.webp", "toy_bear_mustard": "img/toy_bear_mustard.webp", "toy_book": "img/toy_book.webp", "toy_bunny": "img/toy_bunny.webp", "toy_cloud": "img/toy_cloud.webp", "toy_cloud_pink": "img/toy_cloud_pink.webp", "toy_comforter": "img/toy_comforter.webp", "toy_comforter_blue": "img/toy_comforter_blue.webp", "toy_lamb": "img/toy_lamb.webp", "toy_ring": "img/toy_ring.webp", "toy_ring_bear": "img/toy_ring_bear.webp", "toy_ring_fox": "img/toy_ring_fox.webp", "vest_navy": "img/vest_navy.webp", "wrap_navy": "img/wrap_navy.webp", "wrap_terra": "img/wrap_terra.webp", "wrapbody_sage": "img/wrapbody_sage.webp", "footpants_cream": "img/footpants_cream.webp", "footpants_pink": "img/footpants_pink.webp", "footpants_blue": "img/footpants_blue.webp", "wrapbody_cream": "img/wrapbody_cream.webp", "wrapbody_pink": "img/wrapbody_pink.webp", "wrapbody_blue": "img/wrapbody_blue.webp", "mittens_cream": "img/mittens_cream.webp", "panama_white": "img/panama_white.webp", "bs_pink_dots": "img/bs_pink_dots.webp", "hatwarm_caramel": "img/hatwarm_caramel.webp", "cardigan_pink": "img/cardigan_pink.webp", "mittens_pink": "img/mittens_pink.webp", "panama_pink": "img/panama_pink.webp", "panama_blue": "img/panama_blue.webp", "tank_white": "img/tank_white.webp", "bs_white": "img/bs_white.webp", "toy_ring_knot": "img/toy_ring_knot.webp", "panama_white_ties": "img/panama_white_ties.webp", "panama_pink_frill": "img/panama_pink_frill.webp", "panama_blue_ties": "img/panama_blue_ties.webp", "toy_bunny_knit": "img/toy_bunny_knit.webp", "muslin_blue": "img/muslin_blue.webp", "muslin_pink": "img/muslin_pink.webp", "muslin_blue_sq": "img/muslin_blue_sq.webp", "toy_comforter_sage": "img/toy_comforter_sage.webp", "hatwarm_cream_ears": "img/hatwarm_cream_ears.webp", "socks_grey": "img/socks_grey.webp", "ov_winter_pink": "img/ov_winter_pink.webp", "ov_winter_beige": "img/ov_winter_beige.webp", "ov_winter_pink2": "img/ov_winter_pink2.webp", "sweater_pink": "img/sweater_pink.webp", "footpants_pink_dots": "img/footpants_pink_dots.webp", "ov_winter_khaki": "img/ov_winter_khaki.webp", "ov_winter_cream": "img/ov_winter_cream.webp", "slipknit_pink": "img/slipknit_pink.webp", "slip_blue_stars": "img/slip_blue_stars.webp", "ov_winter_pink3": "img/ov_winter_pink3.webp", "ov_winter_cream2": "img/ov_winter_cream2.webp", "ov_winter_cream3": "img/ov_winter_cream3.webp", "slip_blue_stars2": "img/slip_blue_stars2.webp", "bonnet_sage": "img/bonnet_sage.webp", "slipknit_sage": "img/slipknit_sage.webp"};

const NOTLAYER=['hat','hatWarm','panama','socks','mittens','muslin','blanket','toy'];
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
  dress:'платье',romper:'песочник',hatWarm:'тёплая шапка',hat:'шапка',panama:'панамка',socks:'носки',mittens:'варежки',muslin:'муслин',blanket:'плед',
  wrap:'распашонка',wrapbody:'боди-распашонка',footpants:'ползунки',tank:'майка',toy:'грызунок'};
/* ---- пул картинок на каждую вещь ---- */
const CAND={
  bodyL:['bl_blue_clouds','bl_blue_plain','bl_cream','bl_pink_stars','body_collar_beige','shirtbody_blue'],
  bodyS:['bs_striped','bs_pink_hearts','bs_pink_dots','bs_white'],
  bodyT:['bt_grey','tank_grey'],
  slip:['slip_cream','slip_cream_dots','slip_caramel','slip_fleece_navy','slip_plush_pink','slip_knit_burgundy','slip_blue_stars','slip_blue_stars2'],
  slipKnit:['slipknit_cream','slipknit_grey','slipknit_blue','slip_knit_burgundy','slipknit_pink','slipknit_sage'],
  cardigan:['sweater_cream','cardigan_pink'],
  sweater:['sweater_cream','sweater_pink'],
  ovFleece:['ov_fleece_beige','ov_knit_oat','ov_fleece_pink'],
  ovWinter:['ov_winter_navy2','ov_winter_navy','ov_winter_blue','ov_winter_pink','ov_winter_beige','ov_winter_pink2','ov_winter_khaki','ov_winter_cream','ov_winter_pink3','ov_winter_cream2','ov_winter_cream3'],
  ovDemi:['ov_winter_blue','ov_winter_navy'],
  pants:['pants_navy','pants_check_red','pants_pink_stars'],
  shorts:['shorts_beige','shorts_navy','bloomers_rose'],
  dungarees:['dungarees_mustard'],
  jacket:['jacket_khaki'],
  vest:['vest_navy'],
  hat:['hat_sage','bonnet_cream','bonnet_sage'],
  hatWarm:['hatwarm_navy','hat_sage','hatwarm_caramel','hatwarm_cream_ears'],
  panama:['bonnet_cream','panama_white','panama_pink','panama_blue','panama_white_ties','panama_pink_frill','panama_blue_ties'],
  socks:['socks_cream','socks_ecru','socks_navy','booties_pink','socks_grey'],
  mittens:['mittens_blue','mittens_cream','mittens_pink'],
  muslin:['muslin_sage','muslin_sage_stack','muslin_cream','muslin_white','muslin_border_cream','muslin_stack_cream','muslin_blue','muslin_pink','muslin_blue_sq'],
  blanket:['blanket_knit_grey','blanket_sherpa_cream','blanket_quilt_beige','blanket_knit_navy','blanket_sherpa_beige'],
  dress:['bodydress_cream','bodydress_cream_navy','pinafore_check'],
  romper:['romper_blue'],
  wrap:['wrap_terra','wrap_navy'],
  wrapbody:['wrapbody_sage','wrapbody_cream','wrapbody_pink','wrapbody_blue'],
  footpants:['footpants_cream','footpants_pink','footpants_blue','footpants_pink_dots'],
  tank:['tank_grey','tank_white'],
  toy:['toy_ring','toy_bunny','toy_lamb','toy_cloud','toy_cloud_pink','toy_comforter','toy_comforter_blue','toy_ring_bear','toy_ring_fox','toy_bear_mustard','toy_book','toy_ring_knot','toy_bunny_knit','toy_comforter_sage']
};
/* жёсткая метка: вещь читается только как девочковая / мальчуковая */
const GT={
  bl_pink_stars:'g', body_collar_beige:'g', bloomers_rose:'g', bodydress_cream:'g', booties_pink:'g', bs_pink_hearts:'g', ov_fleece_pink:'g', pants_pink_stars:'g', slip_plush_pink:'g', pinafore_check:'g', shirtbody_blue:'b', footpants_pink:'g', wrapbody_pink:'g', bs_pink_dots:'g', cardigan_pink:'g', mittens_pink:'g', panama_pink:'g', panama_pink_frill:'g', muslin_pink:'g', ov_winter_pink:'g', ov_winter_pink2:'g', sweater_pink:'g', footpants_pink_dots:'g', slipknit_pink:'g', ov_winter_pink3:'g'
};
/* мягкое предпочтение: вещь нейтральная, но чуть больше «про мальчика» / «про девочку» */
const LEAN={pants_navy:'b', socks_navy:'b', ov_winter_navy:'b', wrap_navy:'b', muslin_sage:'b', bl_blue_clouds:'b', shorts_beige:'b', romper_blue:'b', slip_knit_burgundy:'b', mittens_blue:'b', vest_navy:'b', jacket_khaki:'b', socks_cream:'g', muslin_cream:'g', slip_cream:'g', blanket_knit_navy:'b', slipknit_grey:'b', slipknit_blue:'b', bodydress_cream_navy:'g', muslin_white:'g', toy_cloud_pink:'g', toy_comforter_blue:'b', wrapbody_sage:'b', hatwarm_navy:'b', slip_fleece_navy:'b', bs_striped:'b', shorts_navy:'b', ov_winter_navy2:'b'};
function okFor(n,g){
  const t=GT[n]; if(!t)return true;
  if(g==='girl')return t==='g';
  if(g==='boy')return t==='b';
  return false;                      // «сюрприз» — только нейтральные вещи
}
/* нарядные вещи — не для обычной прогулки, они пригодятся к празднику */
const FANCY={shirtbody_blue:1, pinafore_check:1, bodydress_cream:1};
function candFor(key){
  const g=S.gender, all=CAND[key]||[];
  const l=all.filter(n=>IMG[n]&&okFor(n,g));
  const tag=g==='girl'?'g':(g==='boy'?'b':'_');
  const score=n=>(GT[n]===tag?2:0)+(LEAN[n]===tag?1:0)-(FANCY[n]?3:0);
  l.sort((a,b)=>score(b)-score(a));
  return l.length?l:[all[0]||'bl_blue_plain'];
}
function pickImg(key,v){
  const l=candFor(key);
  return IMG[l[((v||0)%l.length+l.length)%l.length]]||IMG[l[0]];
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
function sizeForItem(key,m,clothSize){
  const a=accSize(key,m); if(a!==null)return a;
  if(key==='muslin'||key==='blanket'||key==='toy')return '';
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
    {name:'вязаный слой', it:[['slipKnit','вязаный слип'],['cardigan','вязаная кофта'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['socks','тёплые носки']]},
    {name:'два слоя под низ', it:[['bodyL','шерстяное боди'],['slip','тёплый слип'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]}]},

  {max:-5, title:'Мороз', tip:'Шею малышу надёжнее закрыть высоким воротом слипа, чем шарфом — шарф в коляске сползает.', sets:[
    {name:'с флисом', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'вязаный', it:[['slipKnit','вязаный слип'],['ovWinter','зимний комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'полегче', it:[['bodyL','боди д/р'],['slip','хлопковый слип'],['ovWinter','зимний комбинезон'],['socks','тёплые носки']]}]},

  {max:1, title:'Холодно', tip:'Варежки на резинке малыш не потеряет, а без них он будет мёрзнуть именно кистями.', sets:[
    {name:'с флисом', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['ovDemi','утеплённый комбинезон'],['hatWarm','тёплая шапка'],['mittens','варежки']]},
    {name:'с кофтой', it:[['bodyL','боди д/р'],['cardigan','вязаная кофта'],['ovDemi','утеплённый комбинезон'],['hatWarm','тёплая шапка']]},
    {name:'два слоя', it:[['slip','хлопковый слип'],['ovDemi','утеплённый комбинезон'],['socks','носки'],['blanket','плед в коляску']]}]},

  {max:6, title:'Прохладно', tip:'В межсезонье малышу удобнее три тонких слоя, чем один толстый: лишний снимается за секунду.', sets:[
    {name:'с флисом', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['ovDemi','демисезонный'],['hat','шапка']]},
    {name:'со свитером', min:9, it:[['bodyL','боди д/р'],['sweater','вязаный свитер'],['ovDemi','демисезонный'],['hat','шапка']]},
    {name:'полегче', it:[['slip','хлопковый слип'],['ovFleece','флисовый комбинезон'],['hat','шапка'],['muslin','муслин в коляску']]}]},

  {max:11, title:'Свежо', tip:'Зайдёте в магазин — снимите с малыша верхний слой: в помещении он перегревается за десять минут.', sets:[
    {name:'с комбинезоном', it:[['bodyL','боди д/р'],['slip','хлопковый слип'],['ovFleece','флисовый комбинезон'],['hat','шапка']]},
    {name:'флис сверху', it:[['bodyL','боди д/р'],['ovFleece','флисовый комбинезон'],['socks','носки']]},
    {name:'с курткой', min:9, it:[['bodyL','боди д/р'],['pants','штанишки'],['jacket','стёганая куртка'],['hat','шапка']]}]},

  {max:16, title:'Прохладное утро', tip:'Тонкая шапочка малышу нужна до +16: голова у него большая относительно тела и отдаёт много тепла.', sets:[
    {name:'с кофтой', it:[['bodyL','боди д/р'],['cardigan','вязаная кофта'],['pants','штанишки'],['muslin','муслин в коляску']]},
    {name:'слип и кофта', it:[['slip','хлопковый слип'],['cardigan','вязаная кофта'],['hat','тонкая шапочка']]},
    {name:'распашонка и ползунки', max:5, it:[['wrap','распашонка'],['footpants','ползунки'],['hat','тонкая шапочка'],['muslin','муслин в коляску']]},
    {name:'с жилетом', min:9, it:[['bodyL','боди д/р'],['pants','штанишки'],['vest','стёганый жилет'],['socks','носки']]}]},

  {max:21, title:'Тепло', tip:'Запасное боди в сумке — малыш в тепле потеет в складочках, и сухая смена выручает чаще, чем кажется.', sets:[
    {name:'боди и штанишки', it:[['bodyL','боди д/р'],['pants','штанишки'],['panama','панамка'],['socks','носки']]},
    {name:'лёгкий слип', it:[['slip','лёгкий слип'],['panama','панамка'],['muslin','муслин в коляску']]},
    {name:'распашонка и ползунки', max:5, it:[['wrapbody','боди-распашонка'],['footpants','ползунки'],['panama','панамка'],['muslin','муслин в коляску']]},
    {name:'с полукомбинезоном', min:6, it:[['bodyS','боди к/р'],['dungarees','джинсовый полукомбинезон'],['panama','панамка'],['muslin','муслин в коляску']]},
    {name:'платье', only:'girl', it:[['dress','боди-платье'],['panama','панамка'],['socks','носки']]}]},

  {max:25, title:'Жарко', tip:'Носки в жару малышу не нужны — через стопы он как раз сбрасывает лишнее тепло.', sets:[
    {name:'лёгкий набор', it:[['bodyS','боди к/р'],['shorts','шорты'],['panama','панамка'],['muslin','муслин от солнца']]},
    {name:'майка и шорты', it:[['tank','майка'],['shorts','шорты'],['panama','панамка'],['toy','грызунок']]},
    {name:'боди-платье', only:'girl', it:[['dress','боди-платье'],['panama','панамка'],['muslin','муслин от солнца']]},
    {name:'песочник', only:'boy', it:[['romper','песочник'],['panama','панамка'],['muslin','муслин от солнца']]}]},

  {max:99, title:'Очень жарко', tip:'Малышу до года крем от солнца не подходит — его защитит мягкая панамка, тень и прогулка до 11 и после 17.', sets:[
    {name:'минимум', it:[['bodyT','боди-майка'],['panama','панамка'],['muslin','муслин от солнца']]},
    {name:'боди и шорты', it:[['bodyS','боди к/р'],['shorts','лёгкие шорты'],['panama','панамка']]},
    {name:'боди-платье', only:'girl', it:[['dress','боди-платье'],['panama','панамка'],['muslin','муслин от солнца']]},
    {name:'песочник', only:'boy', it:[['romper','песочник'],['panama','панамка'],['muslin','муслин от солнца']]}]}
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
function themeFor(id){return id==='main'?(THEME[S.weather]||'#A8C0D2'):(SCRTHEME[id]||'#FCF7F0');}
