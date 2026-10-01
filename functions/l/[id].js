/* /l/<id> → приложение с данными списка в адресе (#list=… или #sizes=…). Нет такой ссылки — на главную. */
export async function onRequestGet({params,env,request}){
  const origin=new URL(request.url).origin;
  const v=env.LINKS&&await env.LINKS.get(String(params.id||'').slice(0,20));
  if(!v)return Response.redirect(origin+'/',302);
  const {k,d}=JSON.parse(v);
  return Response.redirect(`${origin}/#${k==='sizes'?'sizes':'list'}=${d}`,302);
}
