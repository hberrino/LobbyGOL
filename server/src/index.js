import { passwordHash,passwordMatches } from './passwords.js';
import express from 'express';
import { pool } from './db.js';
import { authLimit,createSession,getUser,logout,requireUser } from './auth.js';
import { validateTournament } from '../../shared/tournament.js';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{
 if(['POST','PUT','DELETE'].includes(req.method)){
  const origin=req.get('origin'),allowed=process.env.APP_ORIGIN||'http://localhost:5173';
  if((origin&&origin!==allowed&&!(process.env.NODE_ENV!=='production'&&origin==='http://127.0.0.1:5173'))||req.get('sec-fetch-site')==='cross-site')return res.status(403).json({error:'Origen no permitido.'});
  if(!req.is('application/json'))return res.status(415).json({error:'Se requiere JSON.'});
 }next();
});
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'LobbyGOL API'}));
app.get('/api/auth/me',async(req,res)=>res.json({user:await getUser(req)}));
app.post('/api/auth/register',authLimit,async(req,res)=>{
 const {name,email,password}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.trim().length>60||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<10||password.length>128)return res.status(400).json({error:'Completa tu nombre, email y una contrasena de 10 a 128 caracteres.'});
 const normalized=email.trim().toLowerCase(),hash=await passwordHash(password);let result;
 try{[result]=await pool.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)',[name.trim(),normalized,hash]);}catch(error){if(error.code==='ER_DUP_ENTRY')return res.status(409).json({error:'No se pudo registrar ese email. Proba iniciar sesion.'});throw error;}
 await createSession(res,result.insertId);res.status(201).json({user:{id:result.insertId,name:name.trim(),email:normalized}});
});
app.post('/api/auth/login',authLimit,async(req,res)=>{
 const {email,password}=req.body||{};
 if(typeof email!=='string'||email.length>254||typeof password!=='string'||password.length>128)return res.status(400).json({error:'Email o contrasena invalidos.'});
 const [rows]=await pool.execute('SELECT * FROM users WHERE email=?',[email.trim().toLowerCase()]);const user=rows[0];
 const valid=await passwordMatches(password,user?.password_hash||`${'0'.repeat(32)}:${'0'.repeat(128)}`);
 if(!user||!valid)return res.status(401).json({error:'Email o contrasena incorrectos.'});
 await createSession(res,user.id);res.json({user:{id:user.id,name:user.name,email:user.email}});
});
app.post('/api/auth/logout',logout);
app.use('/api/tournaments',requireUser);
app.get('/api/tournaments',async(req,res)=>{const [rows]=await pool.execute('SELECT id,title,updated_at FROM tournaments WHERE user_id=? ORDER BY updated_at DESC',[req.user.id]);res.json({tournaments:rows});});
app.get('/api/tournaments/:id',async(req,res)=>{const [rows]=await pool.execute('SELECT id,bracket FROM tournaments WHERE id=? AND user_id=?',[req.params.id,req.user.id]);if(!rows[0])return res.status(404).json({error:'Torneo no encontrado.'});res.json({id:rows[0].id,tournament:typeof rows[0].bracket==='string'?JSON.parse(rows[0].bracket):rows[0].bracket});});
function validated(req,res){try{return validateTournament(req.body);}catch(error){res.status(400).json({error:error.message});return null;}}
app.post('/api/tournaments',async(req,res)=>{const data=validated(req,res);if(!data)return;const [result]=await pool.execute('INSERT INTO tournaments (user_id,title,bracket) VALUES (?,?,?)',[req.user.id,data.title,JSON.stringify(data)]);res.status(201).json({id:result.insertId});});
app.put('/api/tournaments/:id',async(req,res)=>{const data=validated(req,res);if(!data)return;const [result]=await pool.execute('UPDATE tournaments SET title=?,bracket=? WHERE id=? AND user_id=?',[data.title,JSON.stringify(data),req.params.id,req.user.id]);if(!result.affectedRows)return res.status(404).json({error:'Torneo no encontrado.'});res.json({id:Number(req.params.id)});});
app.use((_req,res)=>res.status(404).json({error:'Ruta no encontrada'}));
app.use((error,_req,res,_next)=>{if(error.type==='entity.parse.failed')return res.status(400).json({error:'JSON invalido.'});if(error.type==='entity.too.large')return res.status(413).json({error:'Solicitud demasiado grande.'});console.error('API error:',error.code||error.name);res.status(503).json({error:'No pudimos conectar con el servicio. Revisa la configuracion de MySQL y sus tablas.'});});
const port=Number(process.env.PORT||3001);
app.listen(port,'127.0.0.1',()=>console.log(`LobbyGOL API: http://127.0.0.1:${port}`));
