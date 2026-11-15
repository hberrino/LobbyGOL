# LobbyGOL

React + Tailwind, Express y MySQL. Landing, muestra de equipos, directorio visual de jugadores y torneos personales de ocho equipos.

## Iniciar

Node.js 22.12+ (desarrollo con Node 24). Desde la raiz:

```sh
npm install
npm run dev
```

Frontend: http://localhost:5173. API: http://127.0.0.1:3001. Vite redirige /api al servidor.

## MySQL y cuentas

La landing y la muestra del fixture funcionan sin base de datos. Para registrar usuarios y guardar torneos:

1. Crear `server/.env` copiando `server/.env.example`. Completar credenciales de MySQL. No subir este archivo.
2. Ejecutar `server/sql/schema.sql` en MySQL Workbench (crea `lobbygol` y las tablas users, sessions, tournaments sin borrar tablas existentes).
3. Alternativa si la base ya existe: `npm run db:init -w server` crea las tablas usando las credenciales de `.env`.
4. Reiniciar `npm run dev`, ir a Armar torneo > Crear torneo y registrar una cuenta.

`APP_ORIGIN` debe coincidir con el origen del frontend, por defecto http://localhost:5173. Para produccion, configurar el origen real, NODE_ENV=production y HTTPS para las cookies Secure. Esta base no implementa recuperacion de contrasena ni verificacion de email.

## Torneos

- Muestra publica con equipos ficticios; no modifica la base.
- Crear torneo abre una pantalla con inicio de sesion/registro antes del editor.
- Ocho nombres, cuartos, semifinales y final. Se permiten borradores incompletos con titulo.
- Los resultados se ingresan manualmente. Tocar el ganador lo pinta de verde y lo avanza. Se puede desmarcar; cambiar el ganador limpia los cruces dependientes.
- Guardar torneo persiste el fixture en MySQL. Mis torneos permite reabrirlo. Solo su propietario puede leerlo o editarlo.
- No hay guardado automatico. Las pantallas avisan antes de salir con cambios pendientes.
- Los nombres son libres; estos equipos no requieren estar registrados en matchmaking.

Las contrasenas usan scrypt con salt. Las sesiones usan tokens aleatorios en cookie HttpOnly/SameSite y solo el hash se guarda en MySQL. Las consultas usan parametros y filtran por el usuario autenticado. La API limita intentos de acceso.

El directorio Buscar jugadores sigue siendo una maqueta: no publica solicitudes ni envia mensajes.

## Comprobaciones

```sh
npm run test -w server
npm run build
```

Las pruebas unitarias comprueban avances, invalidacion de rondas, validacion de borradores y contrasenas. La prueba de guardado real requiere MySQL y las dependencias del servidor instaladas.

## Desplegar el frontend en Vercel

Importar el repositorio LobbyGOL y dejar **Root Directory en la raiz del repositorio** (no client). `vercel.json` ya define:

- Framework: Vite.
- Install Command: `npm install`.
- Build Command: `npm run build`.
- Output Directory: `client/dist`.

No hacen falta variables de entorno para esta version publica. En produccion, la API queda desactivada por defecto: se ven landing, directorio y fixture de ejemplo. Crear torneo muestra un aviso mientras se prepara el inicio de sesion. Las rutas usan hash (#torneos, #crear-torneo, #jugadores) y pueden recargarse sin reglas de reescritura.

Para habilitar funciones mas adelante: conectar /api mediante un proxy del mismo dominio al servidor Express y definir `VITE_API_ENABLED=true` antes de reconstruir. `VITE_API_URL` permite cambiar la base de las solicitudes (debe incluir /api); un dominio distinto requiere configurar CORS y cookies antes de usarlo. Nunca poner credenciales MySQL en variables VITE_.
