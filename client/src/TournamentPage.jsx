import { useEffect,useState } from 'react';
import { ArrowRight,Check,Trophy,Save } from 'lucide-react';
import { api,backendAvailable } from './api.js';
import { emptyTournament,participants,chooseWinner } from '../../shared/tournament.js';

const sample={title:'Copa del barrio',teams:['Deportivo Siesta','Pase Corto FC','Los del Tercer Tiempo','La Banda','Barrio Norte FC','Los del Fondo','Atletico Esquina','Union del Parque'],matches:[{scores:['2','1'],winner:0},{scores:['3','0'],winner:2},{scores:['1','2'],winner:5},{scores:['2','0'],winner:6},{scores:['1','0'],winner:0},{scores:['2','1'],winner:5},{scores:['',''],winner:null}]};
const rounds=[{name:'Cuartos de final',indices:[0,1,2,3]},{name:'Semifinales',indices:[4,5]},{name:'Final',indices:[6]}];

function Bracket({value,onChange,disabled=false}){
 const editable=Boolean(onChange)&&!disabled;
 const changeScore=(index,side,score)=>{if(!/^\d{0,2}$/.test(score))return;const matches=value.matches.map(m=>({...m,scores:[...m.scores]}));matches[index].scores[side]=score;onChange({...value,matches});};
 const winner=value.matches[6].winner;
 return <div className="bracket-scroll" tabIndex={0} role="region" aria-label="Fixture de ocho equipos"><div className="bracket">
 {rounds.map(round=><section className="bracket-round" key={round.name}><h3>{round.name}</h3><div className="round-matches">{round.indices.map(index=>{
  const match=value.matches[index],pair=participants(value.matches,index),ready=pair.every(id=>id!==null&&value.teams[id]?.trim());
  return <div className="fixture-match" key={index}>{pair.map((id,side)=><div className={`fixture-team ${id!==null&&match.winner===id?'is-winner':''}`} key={side}>
   {editable?<button disabled={!ready} aria-pressed={id!==null&&match.winner===id} aria-label={`Marcar ganador: ${id===null?'Por definir':value.teams[id]||'Equipo sin nombre'}`} onClick={()=>onChange({...value,matches:chooseWinner(value.matches,index,match.winner===id?null:id)})}><span>{id===null?'Por definir':value.teams[id]||`Equipo ${id+1}`}</span>{id!==null&&match.winner===id&&<Check size={14}/>}</button>:<span className="fixture-name">{id===null?'Por definir':value.teams[id]||`Equipo ${id+1}`}{id!==null&&match.winner===id&&<Check size={14}/>}</span>}
   {editable?<input className="fixture-score" aria-label={`Resultado ${round.name}, partido ${index+1}, equipo ${side+1}`} inputMode="numeric" maxLength={2} value={match.scores[side]} disabled={!ready} onChange={e=>changeScore(index,side,e.target.value)}/>:<span className="fixture-score">{match.scores[side]||'–'}</span>}
  </div>)}</div>;
 })}</div></section>)}
 <section className="bracket-champion"><Trophy size={25}/><span>Campeón</span><strong>{winner===null?'Por definir':value.teams[winner]}</strong></section>
 </div></div>;
}

function AuthForm({onUser}){
 const [register,setRegister]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(event){event.preventDefault();setBusy(true);setError('');const form=new FormData(event.currentTarget);try{const data=await api(`/auth/${register?'register':'login'}`,{method:'POST',body:JSON.stringify(Object.fromEntries(form))});onUser(data.user);}catch(err){setError(err.message);}finally{setBusy(false);}}
 return <section className="tournament-auth"><p className="section-kicker">TU TORNEO, EN TU CUENTA</p><h1>{register?'Creá tu cuenta.':'Iniciá sesión para crear.'}</h1><p>Guardá el fixture y seguí completándolo cuando quieras.</p><form onSubmit={submit}>
 {register&&<label>Nombre<input name="name" autoComplete="name" required maxLength={60}/></label>}
 <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
 <label>Contraseña<input name="password" type="password" autoComplete={register?'new-password':'current-password'} required minLength={register?10:1} maxLength={128}/></label>
 {register&&<small>Usa al menos 10 caracteres.</small>}{error&&<p className="form-error" role="alert">{error}</p>}
 <button className="primary-action" disabled={busy}>{busy?'Un momento...':register?'Crear cuenta':'Iniciar sesión'}<ArrowRight size={16}/></button>
 </form><button className="text-action" disabled={busy} onClick={()=>{setRegister(!register);setError('');}}>{register?'Ya tengo cuenta':'No tengo cuenta: registrarme'}</button></section>;
}

export default function TournamentPage({editor,user,onUser,authLoading,authError,onRetry,onDirty}){
 const [value,setValue]=useState(emptyTournament),[id,setId]=useState(null),[saved,setSaved]=useState([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false);
 useEffect(()=>{onDirty(dirty);return ()=>onDirty(false);},[dirty,onDirty]);
 useEffect(()=>{if(!user){setSaved([]);setValue(emptyTournament());setId(null);setDirty(false);return;}let active=true;api('/tournaments').then(data=>{if(active)setSaved(data.tournaments);}).catch(err=>{if(active)setError(err.message);});return ()=>{active=false;};},[user]);
 useEffect(()=>{if(!dirty)return;const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return ()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 function change(next){setValue(next);setDirty(true);setMessage('');}
 async function save(){setBusy(true);setError('');setMessage('');try{const result=await api(id?`/tournaments/${id}`:'/tournaments',{method:id?'PUT':'POST',body:JSON.stringify(value)});setId(result.id);setDirty(false);setMessage('Torneo guardado. Podés seguirlo más tarde.');const data=await api('/tournaments');setSaved(data.tournaments);}catch(err){setError(err.message);}finally{setBusy(false);}}
 async function load(tournamentId){if(dirty&&!window.confirm('Hay cambios sin guardar. Abrir otro torneo los descartara.'))return;setBusy(true);setError('');try{const data=await api(`/tournaments/${tournamentId}`);setId(data.id);setValue(data.tournament);setDirty(false);setMessage('');}catch(err){setError(err.message);}finally{setBusy(false);}}
 function reset(){if(dirty&&!window.confirm('Hay cambios sin guardar. Crear otro torneo los descartara.'))return;setId(null);setValue(emptyTournament());setDirty(false);setMessage('');setError('');}
 if(!editor)return <main className="tournament-page"><header className="tournament-heading"><p className="section-kicker">ARMAR TORNEO</p><h1>La copa la arman ustedes.</h1><p>Ocho equipos, un fixture y las ganas de levantarla.</p></header><div className="fixture-caption"><span>Copa del barrio</span><small>Fixture de ejemplo · Equipos ficticios</small></div><Bracket value={sample}/><div className="tournament-invite"><h2>Armá tu torneo en la página.</h2><p>Anotá equipos y resultados. Marcá quién gana y avanza. Guardalo y seguilo después.</p><a className="primary-action" href="#crear-torneo">Crear torneo <ArrowRight size={17}/></a></div></main>;
 if(!backendAvailable)return <main className="tournament-page"><section className="tournament-auth"><p className="section-kicker">TU TORNEO, EN TU CUENTA</p><h1>Tu copa empieza aca.</h1><p>Para crear y guardar tu torneo, vas a necesitar iniciar sesion. Estamos preparando esta funcion.</p><a className="primary-action" href="#torneos">Volver al fixture de ejemplo <ArrowRight size={16}/></a></section></main>;
 if(authLoading)return <main className="tournament-page"><p role="status">Comprobando sesión...</p></main>;
 if(authError)return <main className="tournament-page"><p className="form-error" role="alert">{authError}</p><button className="primary-action" onClick={onRetry}>Reintentar</button></main>;
 if(!user)return <main className="tournament-page"><AuthForm onUser={onUser}/></main>;
 return <main className="tournament-page"><header className="tournament-heading"><p className="section-kicker">EL TORNEO DE {user.name.toUpperCase()}</p><h1>{id?'Seguí tu torneo.':'Armá tu torneo.'}</h1><p>Ocho equipos. Completá los nombres y tocá al ganador de cada partido para que avance.</p></header><div className="tournament-workspace"><aside className="saved-tournaments"><h2>Mis torneos</h2><button className="text-action" disabled={busy} onClick={reset}>+ Nuevo torneo</button>{saved.length===0&&<p>Tus torneos guardados van a aparecer acá.</p>}{saved.map(t=><button className={t.id===id?'selected':''} aria-pressed={t.id===id} key={t.id} disabled={busy} onClick={()=>load(t.id)}>{t.title}</button>)}</aside><div className="tournament-editor"><fieldset disabled={busy}><legend className="sr-only">Datos del torneo</legend><label className="tournament-title-label">Nombre del torneo<input maxLength={100} value={value.title} placeholder="Copa de los jueves" onChange={e=>change({...value,title:e.target.value})}/></label><div className="team-inputs">{value.teams.map((name,index)=><label key={index}>Equipo {index+1}<input value={name} maxLength={60} placeholder="Nombre del equipo" onChange={e=>{const teams=[...value.teams];teams[index]=e.target.value;let matches=value.matches;if(name.trim()&&!e.target.value.trim()){const matchIndex=Math.floor(index/2);matches=chooseWinner(matches,matchIndex,null);matches[matchIndex]={scores:['',''],winner:null};}change({...value,teams,matches});}}/></label>)}</div></fieldset></div></div>
 <p className="editor-hint">Tocá un equipo para marcarlo en verde. Los resultados son manuales; en un empate, elegí al que avanzó por penales.</p><Bracket value={value} onChange={change} disabled={busy}/><div className="save-row"><button className="primary-action" disabled={busy||!value.title.trim()} onClick={save}><Save size={16}/>{busy?'Guardando...':'Guardar torneo'}</button><span role="status">{message||(dirty?'Cambios sin guardar':'')}</span></div>{error&&<p className="form-error" role="alert">{error}</p>}
 </main>;
}
