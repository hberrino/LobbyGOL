import { randomBytes,createHash } from 'node:crypto';
import { pool } from './db.js';
const digest=value=>createHash('sha256').update(value).digest('hex');
const cookieName='lobbygol_session';
export const cookieOptions={httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'};
export async function createSession(res,userId){const token=randomBytes(32).toString('hex');await pool.execute('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY))',[digest(token),userId]);res.cookie(cookieName,token,{...cookieOptions,maxAge:7*24*60*60*1000});}
export function tokenHash(req){const token=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith(`${cookieName}=`))?.slice(cookieName.length+1);return token&&/^[a-f0-9]{64}$/.test(token)?digest(token):null;}
export async function getUser(req){const token=tokenHash(req);if(!token)return null;const [rows]=await pool.execute('SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()',[token]);return rows[0]||null;}
export async function requireUser(req,res,next){req.user=await getUser(req);if(!req.user)return res.status(401).json({error:'Inicia sesion para continuar.'});next();}
export async function logout(req,res){const token=tokenHash(req);if(token)await pool.execute('DELETE FROM sessions WHERE token_hash=?',[token]);res.clearCookie(cookieName,cookieOptions);res.json({ok:true});}
const attempts=new Map();
export function authLimit(req,res,next){const now=Date.now();for(const [key,v] of attempts)if(v.until<now)attempts.delete(key);const key=req.ip,entry=attempts.get(key)||{count:0,until:now+15*60*1000};entry.count++;attempts.set(key,entry);if(entry.count>30)return res.status(429).json({error:'Demasiados intentos. Proba de nuevo en 15 minutos.'});next();}
