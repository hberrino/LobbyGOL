import TournamentPage from './TournamentPage.jsx';
import { api,backendAvailable } from './api.js';
import { useEffect, useRef, useState } from 'react';
import PlayersPage from './PlayersPage.jsx';
import { ArrowUpRight, ArrowRight, Menu, X, Smile, Coffee, Flame } from 'lucide-react';

const teams = [
  {name:'Deportivo Siesta',initials:'DS',division:'Chill',format:8,rows:[1,3,3,1],color:'#a7c5ae'},
  {name:'Los del Tercer Tiempo',initials:'TT',division:'Risas',format:5,rows:[1,2,1,1],color:'#d5bd90'},
  {name:'Barrio Norte FC',initials:'BN',division:'Vivido',format:11,rows:[1,4,3,3],color:'#aebacb'},
  {name:'La Última y Nos Vamos',initials:'UV',division:'Chill',format:6,rows:[1,2,2,1],color:'#c5b0b9'},
  {name:'Atlético de la Esquina',initials:'AE',division:'Risas',format:8,rows:[1,2,3,2],color:'#b6bf92'},
];
const divisions = [
 {name:'Risas',icon:Smile,label:'Para equipos que juegan por divertirse',title:'¿Son de madera? Hay otro equipo en la misma.',text:'Nunca tocaron una pelota, tienen dos pies izquierdos o simplemente quieren divertirse entre amigos. No importa: encuentren otro equipo que también quiera pasarla bien, sin preocuparse por el resultado.',note:'Menos exigencia. Más risas. Un rival en la misma.'},
 {name:'Chill',icon:Coffee,label:'Buen fútbol, sin tanta historia',title:'Les gusta jugar bien, pero sin volverse locos.',text:'Se juntan, tiran unas paredes y disfrutan de un buen partido. Si una jugada no sale, no pasa nada. Encuentren otro equipo que busque ese mismo plan: buen ritmo, buena onda y cero drama.',note:'Un rival con quien dé gusto volver a jugar.'},
 {name:'Vivido',icon:Flame,label:'Para equipos que se la viven',title:'¿Discuten la formación en el grupo? Es por acá.',text:'Arman la táctica, se toman cada pelota en serio y salen a ganar, aunque sea un martes a la noche. Encuentren otro equipo que lo viva igual y les haga un buen partido, siempre con respeto.',note:'Un rival a su altura. La misma intensidad.'},
];

function Pitch({team}) {
 let number=0;
 return <div className="pitch" aria-label={`Formación de fútbol ${team.format}: ${team.rows.slice(1).join('-')}`}>
   <svg viewBox="0 0 320 230" preserveAspectRatio="none" aria-hidden="true"><rect x="12" y="10" width="296" height="210" rx="1"/><path d="M12 115H308 M105 10V47H215V10 M130 10V25H190V10 M105 220V183H215V220 M130 220V205H190V220"/><circle cx="160" cy="115" r="30"/><circle cx="160" cy="115" r="2"/></svg>
   <div className="players">{[...team.rows].reverse().map((count,row)=><div className="player-row" key={row}>{Array.from({length:count},(_,i)=>{number++;return <span className={`player ${row===team.rows.length-1?'keeper':''}`} style={{'--team':team.color}} key={i}>{row===team.rows.length-1?'1':number+1}</span>;})}</div>)}</div>
 </div>;
}
const divisionDescriptions = {
 Risas: 'Este equipo busca divertirse y pasar un buen rato. El resultado es lo de menos.',
 Chill: 'Este equipo disfruta del buen fútbol, con buen ritmo y sin presión competitiva.',
 Vivido: 'Este equipo vive cada partido con intensidad y sale a ganar, siempre con respeto.',
};

function TeamCard({team}) {
 return <article className="team-card" style={{'--team':team.color}}>
   <div className="team-identity"><span className="team-initials">{team.initials.toUpperCase()}</span><h3>{team.name}</h3></div>
   <div className="card-top"><span className="format">F{team.format}</span><span className="division-tag">{team.division.toUpperCase()}</span></div>
   <Pitch team={team}/>
   <p className="card-bottom">{divisionDescriptions[team.division]}</p>
 </article>;
}

function routeFromHash(){return {'#jugadores':'players','#torneos':'tournaments','#crear-torneo':'createTournament'}[window.location.hash]||'home';}
export default function App(){
 const tournamentDirty=useRef(false),lastHash=useRef(window.location.hash);
 const [user,setUser]=useState(null),[authLoading,setAuthLoading]=useState(true),[authError,setAuthError]=useState('');
 const refreshUser=async()=>{if(!backendAvailable){setAuthLoading(false);return;}setAuthLoading(true);setAuthError('');try{const data=await api('/auth/me');setUser(data.user);}catch(error){setAuthError(error.message);}finally{setAuthLoading(false);}};
 useEffect(()=>{refreshUser();},[]);
 const signOut=async()=>{if(tournamentDirty.current&&!window.confirm('Hay cambios sin guardar. Cerrar sesion los descartara.'))return;try{await api('/auth/logout',{method:'POST',body:'{}'});setUser(null);}catch(error){window.alert(error.message);}};
 const [menu,setMenu]=useState(false),[notice,setNotice]=useState('');
 const [page,setPage]=useState(()=>routeFromHash());
 const [authIntent,setAuthIntent]=useState(null);
 useEffect(()=>{const sync=()=>{if(tournamentDirty.current&&lastHash.current==='#crear-torneo'&&window.location.hash!=='#crear-torneo'&&!window.confirm('Hay cambios sin guardar. Salir los descartara.')){window.location.hash=lastHash.current;return;}lastHash.current=window.location.hash;setPage(routeFromHash());setMenu(false);};window.addEventListener('hashchange',sync);return ()=>window.removeEventListener('hashchange',sync);},[]);
 const navigate=(destination)=>{setMenu(false);window.location.hash=({players:'jugadores',tournaments:'torneos',createTournament:'crear-torneo'}[destination]||'inicio');window.scrollTo({top:0,behavior:'instant'});};
 const requestLogin=(intent)=>{setAuthIntent(intent);setMenu(false);dialog.current.showModal();};
 const track=useRef(null),dialog=useRef(null);
 const openNotice=(name)=>{setMenu(false);setAuthIntent(null);setNotice(name);dialog.current.showModal();};
 useEffect(()=>{
   const id=setInterval(()=>{
     const el=track.current;
     if(!el)return;
     const end=el.scrollWidth-el.clientWidth;
     el.scrollTo({left:el.scrollLeft>=end-4?0:el.scrollLeft+el.firstElementChild.offsetWidth+20,behavior:'smooth'});
   },3500);
   return ()=>clearInterval(id);
 },[]);
 const navItems=['Encontrar partido','Buscar jugadores','Armar torneo'];
 const selectNav=(index)=>navigate(['home','players','tournaments'][index]);
 return <><header className="site-header"><div className="nav-shell"><a href="#inicio" onClick={()=>navigate('home')} className="brand" aria-label="LobbyGOL, inicio"><span className="brand-mark">L<span>G</span></span><span>Lobby<span className="brand-gol">GOL</span><span className="brand-period">.</span></span></a><nav className="desktop-nav" aria-label="Navegación principal">{navItems.map((item,i)=><button className={(i===0&&page==='home')||(i===1&&page==='players')||(i===2&&(page==='tournaments'||page==='createTournament'))?'active':''} aria-current={(i===0&&page==='home')||(i===1&&page==='players')||(i===2&&(page==='tournaments'||page==='createTournament'))?'page':undefined} key={item} onClick={()=>selectNav(i)}>{item}</button>)}</nav><button className="login" onClick={()=>user?signOut():navigate('createTournament')}>{user?'Cerrar sesión':'Iniciar sesión'} <ArrowUpRight size={15}/></button><button className="menu-toggle" aria-label={menu?'Cerrar menú':'Abrir menú'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>{menu&&<nav className="mobile-nav" aria-label="Navegación móvil">{navItems.map((item,i)=><button key={item} onClick={()=>selectNav(i)}>{item}<ArrowUpRight size={16}/></button>)}</nav>}</header>
 {page==='tournaments'||page==='createTournament'?<TournamentPage editor={page==='createTournament'} user={user} onUser={setUser} authLoading={authLoading} authError={authError} onRetry={refreshUser} onDirty={value=>{tournamentDirty.current=value;}}/>:page==='players'?<PlayersPage onPublish={()=>requestLogin({type:'publish'})} onApply={(team)=>requestLogin({type:'apply',team})}/>:<main><section className="hero" aria-labelledby="hero-title"><div className="hero-field" aria-hidden="true"><div/><span/></div><div className="hero-content"><div className="eyebrow"><span/> MENOS VUELTAS. MÁS FÚTBOL. <span/></div><h1 id="hero-title">Tu equipo.<br/>Su próximo <span>partido.</span></h1><p className="hero-description">El grupo ya está. Ahora falta el rival.<br/><span>Registrá tu equipo, elegí su división y encontrá partido.</span></p></div></section>
 <section id="equipos" className="teams-section" aria-labelledby="teams-title"><div className="section-heading"><div><p className="section-kicker">ENCONTRAR PARTIDO</p><h2 id="teams-title">Mirá algunos equipos buscando match:</h2></div><div className="match-preview"><p>Un rival con su formato y sus ganas de jugar.</p><div className="example-sequence" aria-label="Ejemplo de equipo, nivel y formato"><strong>EQUIPO1</strong><span aria-hidden="true">-</span><strong>RISAS</strong><span aria-hidden="true">-</span><strong>F5</strong></div></div></div><div className="carousel" ref={track} role="region" aria-roledescription="carrusel" aria-label="Equipos de muestra">{teams.map((team)=><TeamCard team={team} key={team.name}/>)}</div><div className="sample-note"><span/> Equipos ficticios. Una muestra de lo que se viene.</div><div className="actions"><button className="primary-action" onClick={()=>openNotice('Encontrar partido')}>Encontrar partido <ArrowRight size={17}/></button><button className="secondary-action" onClick={()=>openNotice('Registrar mi equipo')}>Registrar mi equipo <ArrowUpRight size={17}/></button></div></section><section className="division-section" aria-labelledby="division-title"><div className="division-intro"><h2 id="division-title" className="choices-title">Dos elecciones y a jugar</h2><div className="match-steps"><div className="match-step"><h3>Formato</h3><div className="format-examples" aria-label="Formatos de ejemplo"><span>F5</span><span>F6</span><span>F8</span><span>F11</span></div></div><div className="match-step"><h3>Nivel</h3><div className="division-examples"><span>RISAS</span><span>CHILL</span><span>VIVIDO</span></div></div></div></div><div className="divisions">{divisions.map(({name,icon:Icon,label,title,text,note})=><article className={`division division-${name.toLowerCase()}`} key={name}><div className="division-top"><Icon size={30} strokeWidth={1.5}/><span className="division-label">{label}</span></div><h3>{name}</h3><h4>{title}</h4><p>{text}</p><div className="division-note">{note}</div></article>)}</div></section><div className="closing-line"><span/>LA CANCHA NOS ENCUENTRA.<span/></div></main>}
 <dialog ref={dialog} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}><button className="dialog-close" aria-label="Cerrar" onClick={()=>dialog.current.close()}><X size={20}/></button>{authIntent?<><span className="section-kicker">INICIAR SESIÓN</span><h2>{authIntent.type==='publish'?'Publiquen su búsqueda.':'Un paso antes de postularte.'}</h2><p>{authIntent.type==='publish'?'Para poner a tu equipo en buscando jugador, primero necesitás iniciar sesión. Después podrás elegir tu equipo registrado, con su formato y nivel.':`Iniciá sesión para postularte y contactar al representante de ${authIntent.team}.`}</p><p className="preview-disclaimer">Vista de muestra. Las publicaciones y los mensajes todavía no están habilitados.</p><button className="primary-action" onClick={()=>dialog.current.close()}>Entendido <ArrowRight size={16}/></button></>:<><span className="section-kicker">ESTAMOS ARMANDO EL EQUIPO</span><h2>{notice}</h2><p>Esta función llega en la próxima etapa. Por ahora, conocé la primera vista de LobbyGOL.</p><button className="primary-action" onClick={()=>dialog.current.close()}>Volver a la cancha <ArrowRight size={16}/></button></>}</dialog></>;
}
