export const backendAvailable=import.meta.env.VITE_API_ENABLED==='true'||Boolean(import.meta.env.VITE_API_URL)||(import.meta.env.DEV&&import.meta.env.VITE_API_ENABLED!=='false');
const configuredBase=import.meta.env.VITE_API_URL||'/api';
const apiBase=configuredBase.endsWith('/')?configuredBase.slice(0,-1):configuredBase;
export async function api(path,options={}){
 let response;
 try{response=await fetch(`${apiBase}${path}`,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers}});}catch{throw Error('No pudimos conectar con el servidor.');}
 let data;try{data=await response.json();}catch{throw Error('El servidor no esta disponible.');}
 if(!response.ok){const error=new Error(data.error||'No se pudo completar la solicitud.');error.status=response.status;throw error;}
 return data;
}
