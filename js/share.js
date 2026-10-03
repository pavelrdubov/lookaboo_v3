/* «показать бабушке» и картинки для шеринга */
/* ================= карточка «показать бабушке» ================= */
function openCard(){
  const sc=SCENES[S.weather]||SCENES.cloud;
  document.getElementById('gHd').style.background=sc.grad;
  document.getElementById('gHd').innerHTML=
    `<b>${S.temp>0?'+':''}${S.temp}°</b><s>${sc.word}</s>`;
  const n=document.getElementById('tLayers').textContent;
  const ctxP={stroller:'в коляске',sling:'в слинге',car:'в машине'}[S.ctx]||'в коляске';
  document.getElementById('gTitle').textContent=personize(`Малышу ${ctxP} нужно ${n}`);
  document.getElementById('gItems').textContent=document.getElementById('items').textContent;
  document.getElementById('gWhy').textContent=S.whyText||'';
  document.getElementById('gTip').textContent=S.tipText||'';
  document.getElementById('shareCard').classList.add('on');
}
function closeCard(){document.getElementById('shareCard').classList.remove('on');}
function expandAbbr(s){return String(s)
  .replace(/боди\s*д\/р/gi,'боди с длинным рукавом')
  .replace(/боди\s*к\/р/gi,'боди с коротким рукавом')
  .replace(/\bд\/р\b/gi,'с длинным рукавом')
  .replace(/\bк\/р\b/gi,'с коротким рукавом');}
function cardText(){
  const sc=SCENES[S.weather]||SCENES.cloud;
  const ctxP={stroller:'в коляске',sling:'в слинге',car:'в машине'}[S.ctx]||'в коляске';
  const head=`${S.temp>0?'+':''}${S.temp}°, ${sc.word}`;
  const layers=document.getElementById('tLayers').textContent;
  const items=expandAbbr(document.getElementById('items').textContent);
  return personize(`${head}. ${cap1(ctxP)} малышу нужно ${layers}:`)+`\n${items}\n\n`
    +`${S.whyText||''}`
    +`${S.tipText?'\n\n'+S.tipText:''}`
    +`\n\nСписок собран в Lookaboo`;
}
function toggleTip(e){if(e)e.stopPropagation();const p=document.getElementById('tipPop');
  const sp=document.getElementById('tipText'); if(sp)sp.textContent=S.tipText||'';
  const on=p.classList.toggle('on');
  const b=document.getElementById('tipBtn'); if(b)b.classList.toggle('act',on);}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('on');
  setTimeout(()=>el.classList.remove('on'),1800);}
async function shareText(title,text){
  try{ if(navigator.share){ await navigator.share({title,text}); return; } }catch(e){}
  try{ await navigator.clipboard.writeText(text); toast('Скопировано — можно вставить в чат'); return; }catch(e){}
  showCopy(text);
}
function showCopy(text){
  const box=document.getElementById('copyBox'), ta=document.getElementById('copyArea');
  ta.value=text; box.classList.add('on');
  setTimeout(()=>{try{ta.focus();ta.setSelectionRange(0,ta.value.length);}catch(e){}},80);
}
function closeCopy(){document.getElementById('copyBox').classList.remove('on');}
function shareCard(){ shareText('Lookaboo', cardText()); }

/* ================= КАРТИНКА ДЛЯ ШЕРИНГА ================= */
const IMGCACHE={};
function loadImg(src){
  if(IMGCACHE[src])return Promise.resolve(IMGCACHE[src]);
  return new Promise(res=>{
    const im=new Image();
    im.onload=()=>{IMGCACHE[src]=im;res(im);};
    im.onerror=()=>res(null);
    im.src=src;
  });
}
async function fontsReady(){
  try{
    await document.fonts.load('800 120px Nunito');
    await document.fonts.load('700 44px Nunito');
    await document.fonts.load('600 46px Caveat');
    await document.fonts.load('900 34px "Playfair Display"');
    await document.fonts.ready;
  }catch(e){}
}
function roundRect(x,a,b,w,h,rad){
  x.beginPath();
  x.moveTo(a+rad,b); x.lineTo(a+w-rad,b); x.quadraticCurveTo(a+w,b,a+w,b+rad);
  x.lineTo(a+w,b+h-rad); x.quadraticCurveTo(a+w,b+h,a+w-rad,b+h);
  x.lineTo(a+rad,b+h); x.quadraticCurveTo(a,b+h,a,b+h-rad);
  x.lineTo(a,b+rad); x.quadraticCurveTo(a,b,a+rad,b); x.closePath();
}
function wrapText(x,text,maxW){
  const words=String(text).split(/\s+/), lines=[]; let cur='';
  words.forEach(w=>{
    const t=cur?cur+' '+w:w;
    if(x.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;}else cur=t;
  });
  if(cur)lines.push(cur);
  return lines;
}
function drawSpaced(x,text,ax,ay,sp){
  let px=ax;
  for(const ch of text){x.fillText(ch,px,ay);px+=x.measureText(ch).width+sp;}
  return px-ax-sp;
}
function spacedWidth(x,text,sp){
  let w=0; for(const ch of text)w+=x.measureText(ch).width+sp; return w-sp;
}
/* рисуем изображение «вписав» его в коробку, как object-fit:contain */
function drawContain(x,im,cx,cy,bw,bh,rot){
  if(!im)return;
  const k=Math.min(bw/im.width,bh/im.height), w=im.width*k, h=im.height*k;
  x.save();
  x.translate(cx,cy); if(rot)x.rotate(rot*Math.PI/180);
  x.shadowColor='rgba(90,74,58,.26)'; x.shadowBlur=22; x.shadowOffsetX=8; x.shadowOffsetY=14;
  x.drawImage(im,-w/2,-h/2,w,h);
  x.restore();
}

/* арка как на экране: круглый верх, скруглённый низ */
function archPath(x,ax,ay,aw,ah,rTop,rBot){
  const r=Math.min(rTop,aw/2,ah-rBot);
  x.beginPath();
  x.moveTo(ax,ay+ah-rBot);
  x.lineTo(ax,ay+r);
  x.quadraticCurveTo(ax,ay,ax+r,ay);
  x.lineTo(ax+aw-r,ay);
  x.quadraticCurveTo(ax+aw,ay,ax+aw,ay+r);
  x.lineTo(ax+aw,ay+ah-rBot);
  x.quadraticCurveTo(ax+aw,ay+ah,ax+aw-rBot,ay+ah);
  x.lineTo(ax+rBot,ay+ah);
  x.quadraticCurveTo(ax,ay+ah,ax,ay+ah-rBot);
  x.closePath();
}
async function renderLookPNG(){
  await fontsReady();
  const W=1080, HEAD=560, AX=56, AY=470, AW=W-112, AH=600;
  const c=document.createElement('canvas');
  c.width=W;c.height=100;
  let x=c.getContext('2d');
  const sc=SCENES[S.weather]||SCENES.cloud;

  /* сначала меряем нижний текст, потом знаем высоту картинки */
  const itemsLine=expandAbbr(document.getElementById('items').textContent);
  const tip=S.tipText||'';
  x.font='700 30px Nunito, sans-serif';
  const iLines=wrapText(x,itemsLine,W-120).slice(0,4);
  x.font='600 29px Nunito, sans-serif';
  const tLines=tip?wrapText(x,tip,W-250).slice(0,4):[];
  const tipH=tLines.length?tLines.length*40+46:0;
  const H=Math.round(AY+AH+92+iLines.length*40+(tipH?tipH+28:0)+96);

  c.height=H; x=c.getContext('2d');
  x.textBaseline='alphabetic';
  x.fillStyle='#FCF7F0'; x.fillRect(0,0,W,H);

  /* шапка с градиентом сцены */
  const GR={rain:['#7E93A2','#BCC8CF'],snow:['#5C6C92','#AFBCD2'],sun:['#6FC8D4','#BFE9E2'],
    cloud:['#A8C0D2','#DCE6DE'],frost:['#333C6B','#6A76AC']}[S.weather]||['#A8C0D2','#DCE6DE'];
  const g=x.createLinearGradient(0,0,W*0.28,HEAD);
  g.addColorStop(0,GR[0]); g.addColorStop(1,GR[1]);
  x.fillStyle=g; x.fillRect(0,0,W,HEAD);

  /* облака — чтобы шапка не была пустой заливкой */
  x.save(); x.globalAlpha=.46; x.fillStyle='#fff';
  [[812,236,98],[912,272,72],[736,286,58]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill();});
  x.restore();

  x.fillStyle='#fff';
  x.font='900 34px "Playfair Display", Georgia, serif';
  drawSpaced(x,'LOOKABOO',60,96,7);

  const fl=S.live?S.feels:Math.round(S.temp-(S.wind>4?3:1));
  x.font='800 168px Nunito, sans-serif'; x.textBaseline='alphabetic';
  x.fillText(((S.temp>0?'+':'')+S.temp+'°'),56,300);

  x.font='800 26px Nunito, sans-serif';
  const city=(S.city||'').toUpperCase();
  const cw=spacedWidth(x,city,3.2);
  drawSpaced(x,city,60,362,3.2);
  x.font='600 40px Caveat, cursive'; x.fillStyle='#F2F6F8';
  x.fillText(`  ·  ${sc.word}`,60+cw,364);

  /* кто и какого размера — с аватаркой */
  const k=kid(), m=kidAgeOf(k), sz=sizeFor(heightNow());
  const who=(kidName(k)?kidName(k)+' · ':'')+`${m} ${monthsWord(m)} · размер ${sz}`;
  x.font='800 27px Nunito, sans-serif';
  const av=k.photo?await loadImg(k.photo):null;
  const avW=(av||kidName(k))?64:0;
  const ww=x.measureText(who).width+52+avW;
  const wx=W-60-ww;
  x.fillStyle='rgba(255,255,255,.94)';
  roundRect(x,wx,50,ww,70,35); x.fill();
  if(avW){
    const ax=wx+9, ay=55, ad=60;
    x.save(); x.beginPath(); x.arc(ax+ad/2,ay+ad/2,ad/2,0,7); x.clip();
    if(av){
      const kk=Math.max(ad/av.width,ad/av.height);
      x.drawImage(av,ax+ad/2-av.width*kk/2,ay+ad/2-av.height*kk/2,av.width*kk,av.height*kk);
    }else{
      x.fillStyle='#EFE7D9'; x.fillRect(ax,ay,ad,ad);
      x.fillStyle='#B3A08A'; x.font='800 30px Nunito, sans-serif'; x.textAlign='center';
      x.fillText(kidLabel(k)[0].toUpperCase(),ax+ad/2,ay+ad/2+11); x.textAlign='left';
    }
    x.restore();
  }
  x.fillStyle='#4E5F6B'; x.font='800 27px Nunito, sans-serif';
  x.fillText(who,wx+26+avW,94);

  /* сколько слоёв и сколько это для малыша */
  x.font='800 27px Nunito, sans-serif';
  const lay=document.getElementById('tLayers').textContent;
  const lw=x.measureText(lay).width+50;
  x.fillStyle='#C4613C'; roundRect(x,60,412,lw,60,30); x.fill();
  x.fillStyle='#FFF6EF'; x.fillText(lay,85,451);
  const whyLine=document.getElementById('tWhy').textContent||'';
  if(whyLine){
    x.fillStyle='rgba(255,255,255,.92)'; x.font='700 25px Nunito, sans-serif';
    x.fillText(whyLine,60+lw+18,451);
  }

  /* белая арка с вещами */
  x.save();
  x.shadowColor='rgba(90,74,58,.18)';x.shadowBlur=40;x.shadowOffsetY=14;
  x.fillStyle='#fff';
  archPath(x,AX,AY,AW,AH,380,44);
  x.fill();
  x.restore();

  /* тот же набор, что на экране */
  const band=bandFor(effTemp()), list=setsFor(band), set=curSet(list);
  let items=lookItems(set.it).slice();
  if(items.length<2)items.push(swaddleFor(effTemp()));
  const heroes=items.filter(i=>!NOTLAYER.includes(i[0]));
  const acc=items.filter(i=>NOTLAYER.includes(i[0]));
  let ordered0=heroes.concat(acc).slice(0,6);
  if(!heroes.length)ordered0=items.slice(0,6);
  const padX=44,padY=34;
  const BW=AW-padX*2, BH=AH-padY*2;
  const {list:ordered,LOOK}=lookWithImgs(ordered0);
  const noteFs=Math.max(40,Math.min(52,Math.min(BW,BH)*0.08));
  /* та же раскладка и та же пометка, что на экране (js/layout.js) */
  const PN=pickNotes(ordered,effTemp(),S.setIdx), nfs=n=>Object.assign({fs:n.style==='fact'?noteFs*.86:noteFs},n);
  const NOTES=PN.map(nfs); NOTES.alts=(PN.alts||[]).map(nfs);
  const rects=layoutLook(ordered.map(x=>({key:x[0],src:LOOK[x[0]]})),BW,BH,(S.setIdx||0)+new Date().getDate(),NOTES,{r:380,ox:padX,oy:padY});
  const srcs=await Promise.all(rects.map(r=>loadImg(r.src)));
  rects.slice().sort((a,b)=>a.z-b.z).forEach(r=>{
    const im=srcs[rects.indexOf(r)]; if(!im)return;
    x.save();
    x.translate(AX+padX+r.cx,AY+padY+r.cy); x.rotate(r.rot*Math.PI/180);
    x.shadowColor='rgba(90,74,58,.26)'; x.shadowBlur=22; x.shadowOffsetX=8; x.shadowOffsetY=14;
    x.drawImage(im,-r.ox,-r.oy,r.iw,r.ih);
    x.restore();
  });
  (rects.notes||[]).forEach(n=>{
    const ox=AX+padX, oy=AY+padY;
    const ar=noteArrow(n,0);
    x.save(); x.translate(ox,oy); x.strokeStyle='#9C8A75'; x.lineCap='round'; x.lineJoin='round';
    x.lineWidth=2.6; x.setLineDash([6,7]); x.beginPath(); x.moveTo(ar.sx,ar.sy); x.quadraticCurveTo(ar.qx,ar.qy,ar.tx,ar.ty); x.stroke();
    x.setLineDash([]); x.lineWidth=3; x.beginPath(); x.moveTo(ar.l1x,ar.l1y); x.lineTo(ar.tx,ar.ty); x.lineTo(ar.l2x,ar.l2y); x.stroke();
    x.restore(); x.save();
    const txt=n.text;
    x.fillStyle='#6B5B4C'; x.font=`600 ${n.fs}px Caveat, cursive`; x.textBaseline='top';
    x.shadowColor='#fff'; x.shadowBlur=10;
    // перенос по словам в ширину пометки
    const words=txt.split(' '), lines=[]; let cur='';
    words.forEach(w=>{const t=cur?cur+' '+w:w; if(x.measureText(t).width>n.w&&cur){lines.push(cur);cur=w;}else cur=t;}); lines.push(cur);
    lines.forEach((l,i)=>x.fillText(l,ox+n.x,oy+n.y+i*n.fs*1.08));
    x.restore();
  });


  /* подпись снизу */
  let y=AY+AH+76;
  const title=band.title;
  x.fillStyle='#3B2E22'; x.font='800 58px Nunito, sans-serif';
  x.fillText(title,60,y);
  const tw=x.measureText(title).width;
  x.fillStyle='#7A6450'; x.font='600 44px Caveat, cursive';
  x.fillText(set.name,60+tw+18,y);

  y+=54;
  x.fillStyle='#3B2E22'; x.font='700 30px Nunito, sans-serif';
  iLines.forEach(l=>{x.fillText(l,60,y);y+=40;});

  /* совет */
  if(tLines.length){
    y+=14;
    x.fillStyle='#F4EFE6'; roundRect(x,60,y,W-120,tipH,26); x.fill();
    x.fillStyle='#C4613C'; x.font='800 22px Nunito, sans-serif';
    x.fillText('СОВЕТ',88,y+48);
    x.fillStyle='#40372F'; x.font='600 29px Nunito, sans-serif';
    let ty=y+48;
    tLines.forEach(l=>{x.fillText(l,196,ty);ty+=40;});
    y+=tipH;
  }

  x.fillStyle='#BCAF9B'; x.font='800 22px Nunito, sans-serif';
  drawSpaced(x,'LOOKABOO',60,H-42,4);

  return await new Promise(res=>c.toBlob(res,'image/png'));
}

async function renderWishPNG(){
  await fontsReady();
  const ids=wishOutIds();
  const W=1080;
  const rowH=132, headH=300;
  const groups={};
  ids.forEach(i=>{const g=WISH[i].src||'Разное';(groups[g]=groups[g]||[]).push(WISH[i]);});
  const gkeys=Object.keys(groups);
  const H=Math.max(1000, headH + gkeys.reduce((s,g)=>s+64+groups[g].length*rowH,0) + 120);
  const c=document.createElement('canvas'); c.width=W;c.height=H;
  const x=c.getContext('2d');
  x.fillStyle='#FCF7F0'; x.fillRect(0,0,W,H);
  const g2=x.createLinearGradient(0,0,W*0.4,headH);
  g2.addColorStop(0,'#C4613C'); g2.addColorStop(1,'#E8A87C');
  x.fillStyle=g2; x.fillRect(0,0,W,headH);

  x.fillStyle='#fff'; x.font='900 30px "Playfair Display", Georgia, serif';
  drawSpaced(x,'LOOKABOO',60,88,7);
  const k=kid(), sz=sizeFor(heightNow());
  x.font='800 66px Nunito, sans-serif';
  x.fillText(personize('Что нужно малышу'),56,190);
  if(kidName(k)){x.font='600 40px Caveat, cursive'; x.fillStyle='#FFEFE3';
    x.fillText(kidName(k),60,244);}

  const imgs=await Promise.all(ids.map(i=>WISH[i].img?loadImg(WISH[i].img):Promise.resolve(null)));
  const imgBy={}; ids.forEach((i,n)=>imgBy[i]=imgs[n]);

  let y=headH+52;
  gkeys.forEach(gk=>{
    x.fillStyle='#A9987F'; x.font='800 24px Nunito, sans-serif';
    drawSpaced(x,gk.toUpperCase(),60,y,2.4);
    y+=34;
    groups[gk].forEach(w=>{
      x.fillStyle='#fff';
      x.save(); x.shadowColor='rgba(90,74,58,.10)';x.shadowBlur=18;x.shadowOffsetY=5;
      roundRect(x,56,y,W-112,rowH-16,28); x.fill(); x.restore();
      const id=ids.find(i=>WISH[i]===w);
      const im=imgBy[id];
      if(im)drawContain(x,im,132,y+(rowH-16)/2,92,84,0);
      x.fillStyle='#3B2E22'; x.font='800 34px Nunito, sans-serif';
      x.fillText(expandAbbr(w.label),206,y+50);
      const sub=[szTxt(w.size),(w.qty>1?'×'+w.qty:''),w.note||''].filter(Boolean).join(' · ');
      if(sub){x.fillStyle='#A9987F'; x.font='700 26px Nunito, sans-serif'; x.fillText(sub,206,y+88);}
      y+=rowH;
    });
    y+=30;
  });
  x.fillStyle='#BCAF9B'; x.font='700 25px Nunito, sans-serif';
  x.fillText('Список собран в Lookaboo',60,H-46);
  return await new Promise(res=>c.toBlob(res,'image/png'));
}

let SHOTBLOB=null, SHOTTEXT='', SHOTURL='';
async function shotMake(kind){
  const w=document.getElementById('shotWait'); w.classList.add('on');
  try{
    SHOTBLOB = kind==='wish' ? await renderWishPNG() : await renderLookPNG();
    SHOTTEXT = kind==='wish' ? wishText() : cardText();
    if(SHOTURL)URL.revokeObjectURL(SHOTURL);
    SHOTURL=URL.createObjectURL(SHOTBLOB);
    document.getElementById('shotImg').src=SHOTURL;
    document.getElementById('shot').classList.add('on');
  }catch(e){
    toast('Картинка не нарисовалась — отправляю текстом');
    shareText('Lookaboo', kind==='wish'?wishText():cardText());
  }finally{ w.classList.remove('on'); }
}
function closeShot(){document.getElementById('shot').classList.remove('on');}
async function shotShare(){
  if(!SHOTBLOB)return;
  const file=new File([SHOTBLOB],'lookaboo.png',{type:'image/png'});
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file]});
      return;
    }
  }catch(e){ if(e&&e.name==='AbortError')return; }
  /* нет системного «Поделиться» с файлом — предлагаем сохранить */
  const a=document.createElement('a');
  a.href=SHOTURL; a.download='lookaboo.png';
  document.body.appendChild(a); a.click(); a.remove();
  toast('Картинка сохранена');
}
function shotText(){ closeShot(); shareText('Lookaboo', SHOTTEXT); }
function wishText(){
  const ids=wishOutIds();
  const groups={};
  ids.forEach(id=>{const g=WISH[id].src||'Разное';(groups[g]=groups[g]||[]).push(WISH[id]);});
  return personize('Что нужно малышу:')+'\n\n'+Object.keys(groups).map(g=>
    g+'\n'+groups[g].map(w=>'— '+expandAbbr(w.label)+(w.size?', '+szTxt(w.size):'')+(w.qty>1?' ×'+w.qty:'')+(w.note?' ('+w.note+')':'')).join('\n')).join('\n\n')
    +'\n\nСписок собран в Lookaboo';
}
