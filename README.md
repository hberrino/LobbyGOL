# LobbyGOL

Primera vista: navbar responsive, hero y carrusel automático de equipos ficticios F5, F6, F8 y F11. Sin datos en vivo ni funcionalidades de matchmaking todavía. Los botones futuros muestran un aviso; no crean cuentas ni partidos.

## Desarrollo

Requiere Node.js 22.12+ (probado con Node 24).

```sh
npm install
npm run dev
```

Abrir http://localhost:5173. El comando inicia React/Vite y Express en paralelo. La API escucha en http://127.0.0.1:3001; `GET /api/health` permite comprobarla. Vite redirige `/api` hacia Express.

```sh
npm run build
```

Genera el frontend en `client/dist`. Para previsualizarlo: `npm run preview -w client`.

## Estructura

- `client/src/App.jsx`: componentes y datos de muestra.
- `client/src/styles.css`: Tailwind 4 y estilos visuales.
- `server/src/index.js`: base Express.
- `server/src/db.js`: pool MySQL listo para conectar desde futuras rutas.
- `server/sql/schema.sql`: creación de base, sin tablas prematuras.

MySQL no es necesario para ver esta landing. Para preparar la siguiente etapa, copiar `server/.env.example` a `server/.env`, completar credenciales y ejecutar `server/sql/schema.sql` en MySQL. La conexión todavía no se usa en las rutas. Las tipografías se sirven localmente mediante paquetes npm.

El carrusel avanza cada 3,5 segundos, se detiene mientras está bajo el puntero o tiene foco, tiene controles manuales y respeta la preferencia de movimiento reducido.
