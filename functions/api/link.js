/* Короткие ссылки на список и размеры (Cloudflare Pages Function).
   POST /api/link  {k:'list'|'sizes', d:'<данные из ссылки>'}  →  {id}
   Данные хранятся в KV-хранилище LINKS год; ссылка /l/<id> ведёт на /#list=<данные>.
   Нужна привязка KV-хранилища с именем LINKS в настройках проекта Cloudflare Pages
   (как настроить — README). Без неё отвечаем 501, и приложение отдаёт длинную ссылку. */
const ABC='abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // без похожих 0/O, 1/l/I
function newId(n){const b=crypto.getRandomValues(new Uint8Array(n));return Array.from(b,x=>ABC[x%ABC.length]).join('');}

export async function onRequestPost({request,env}){
  if(!env.LINKS)return new Response('KV LINKS не подключено',{status:501});
  let body=null; try{body=await request.json();}catch(e){}
  const k=body&&body.k==='sizes'?'sizes':'list', d=body&&typeof body.d==='string'?body.d:'';
  if(!d||d.length>24000||!/^[A-Za-z0-9%+/=_-]+$/.test(d))return new Response('bad',{status:400});
  let id=newId(7);
  for(let i=0;i<3&&await env.LINKS.get(id);i++)id=newId(7);
  await env.LINKS.put(id,JSON.stringify({k,d}),{expirationTtl:60*60*24*365});
  return Response.json({id});
}
