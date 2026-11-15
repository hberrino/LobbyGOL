import { ArrowUpRight, Plus } from 'lucide-react';

const openings = [
  { name: 'Los del Tercer Tiempo', format: 'F5', level: 'RISAS', need: 'Cualquier puesto', representative: 'Nico' },
  { name: 'Deportivo Siesta', format: 'F8', level: 'CHILL', need: 'Arquero', representative: 'Juli' },
  { name: 'Barrio Norte FC', format: 'F11', level: 'VIVIDO', need: 'Defensor', representative: 'Facu' },
  { name: 'La Banda del Barrio', format: 'F6', level: 'RISAS', need: 'Cualquier puesto', representative: 'Santi' },
  { name: 'Pase Corto FC', format: 'F5', level: 'CHILL', need: 'Delantero', representative: 'Agus' },
];

export default function PlayersPage({ onPublish, onApply }) {
  return <main className="players-page">
    <header className="players-heading">
      <p className="section-kicker">BUSCAR JUGADORES</p>
      <h1>A un jugador del partido.</h1>
      <p>Si les falta alguien, publiquen su equipo. Si buscás dónde jugar, postulate.</p>
    </header>
    <section className="publish-row" aria-labelledby="publish-title">
      <div><h2 id="publish-title">¿Les falta uno?</h2><p>Pongan a su equipo en buscando jugador, con su formato y nivel.</p></div>
      <button className="primary-action" onClick={onPublish}><Plus size={17} aria-hidden="true"/>Mi equipo busca jugador</button>
    </section>
    <section className="openings-section" aria-labelledby="openings-title">
      <div className="openings-heading"><h2 id="openings-title">Equipos buscando jugador</h2><span>Datos de muestra</span></div>
      <div className="openings-scroll" tabIndex={0} role="region" aria-label="Equipos buscando jugador, tabla desplazable">
        <table className="openings-table">
          <caption className="sr-only">Equipos ficticios buscando un jugador. Formato, nivel, puesto y representante.</caption>
          <thead><tr><th scope="col">Equipo</th><th scope="col">Formato</th><th scope="col">Nivel</th><th scope="col">Buscan</th><th scope="col">Representante</th><th scope="col"><span className="sr-only">Postulación</span></th></tr></thead>
          <tbody>{openings.map(team=><tr key={team.name}>
            <th scope="row">{team.name}</th><td>{team.format}</td><td><span className={`table-level level-${team.level.toLowerCase()}`}>{team.level}</span></td><td>{team.need}</td><td>{team.representative}</td>
            <td><button className="apply-button" onClick={()=>onApply(team.name)} aria-label={`Postularme a ${team.name}`}>Postularme <ArrowUpRight size={15} aria-hidden="true"/></button></td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="openings-note">Las publicaciones y postulaciones estarán disponibles al habilitar el inicio de sesión.</p>
    </section>
  </main>;
}
