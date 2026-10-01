/* имя малыша и склонения */
/* ================= ИМЯ МАЛЫША ================= */
/* если мама вписала имя — говорим «Саше», а не «малышу» */
const SIB='жшчщ', SIBC='жшчщц', VEL='гкх';
function nameCases(n){
  n=String(n).trim();
  const low=n.toLowerCase(), last=low.slice(-1), st=n.slice(0,-1), stl=low.slice(0,-1);
  const end=c=>stl.slice(-1)===c;
  if(low.length<2||'оеиуюэы'.includes(last))                      // Нико, Лео — не склоняем
    return {nom:n,gen:n,dat:n,acc:n,ins:n,pre:n};
  if(low.endsWith('ия'))
    return {nom:n,gen:n.slice(0,-1)+'и',dat:n.slice(0,-1)+'и',acc:n.slice(0,-1)+'ю',ins:n.slice(0,-1)+'ей',pre:n.slice(0,-1)+'и'};
  if(last==='а')
    return {nom:n,gen:st+((SIB+VEL).includes(stl.slice(-1))?'и':'ы'),dat:st+'е',acc:st+'у',
            ins:st+(SIBC.includes(stl.slice(-1))?'ей':'ой'),pre:st+'е'};
  if(last==='я')
    return {nom:n,gen:st+'и',dat:st+'е',acc:st+'ю',ins:st+'ей',pre:st+'е'};
  if(last==='й'||last==='ь')
    return {nom:n,gen:st+'я',dat:st+'ю',acc:st+'я',ins:st+'ем',pre:st+'е'};
  return {nom:n,gen:n+'а',dat:n+'у',acc:n+'а',ins:n+'ом',pre:n+'е'};
}
const BABYDEF={nom:'малыш',gen:'малыша',dat:'малышу',acc:'малыша',ins:'малышом',pre:'малыше'};
function babyCases(){
  const nm=kidName(kid());
  return nm?nameCases(nm):BABYDEF;
}
/* подставляем имя во все тексты, где написано «малыш» */
function personize(t){
  if(!t)return t;
  const nm=kidName(kid()); if(!nm)return t;
  const c=nameCases(nm);
  return String(t)
    .replace(/малышом(?![а-яё])/g,c.ins)
    .replace(/малышу(?![а-яё])/g,c.dat)
    .replace(/(на |за |про |через |в )малыша(?![а-яё])/g,(m,p)=>p+c.acc)
    .replace(/малыша(?![а-яё])/g,c.gen)
    .replace(/малыше(?![а-яё])/g,c.pre)
    .replace(/малыш(?![а-яё])/g,c.nom)
    .replace(/Малышом(?![а-яё])/g,cap1(c.ins))
    .replace(/Малышу(?![а-яё])/g,cap1(c.dat))
    .replace(/Малыша(?![а-яё])/g,cap1(c.gen))
    .replace(/Малыш(?![а-яё])/g,cap1(c.nom));
}
function cap1(s){return s?s[0].toUpperCase()+s.slice(1):s;}
