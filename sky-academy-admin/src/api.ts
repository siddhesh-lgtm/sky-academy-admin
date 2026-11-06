/** API-ready boundary. UI runs with demo data until real endpoints/auth are configured. */
const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
export const apiConfig={base, mode:import.meta.env.VITE_API_MODE || 'mock'};
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export async function apiRequest<T>(surface:'admin'|'app/parent'|'app/coach'|'public',path:string, options:RequestInit={},token?:string):Promise<T>{
 const response=await fetch(`${base}/${surface}/${path.replace(/^\//,'')}`,{
  ...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...options.headers},credentials:'include'
 });
 if(!response.ok)throw new ApiError(response.status,await response.text());
 if(response.status===204)return undefined as T;
 return response.json() as Promise<T>;
}
/** Frontend access checks are display-only. Node.js must enforce RBAC, center scope and feature flags. */
