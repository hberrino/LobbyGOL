import express from 'express';
const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.get('/api/health', (_req,res) => res.json({status:'ok',service:'LobbyGOL API'}));
app.use((_req,res) => res.status(404).json({error:'Ruta no encontrada'}));
const port = Number(process.env.PORT || 3001);
app.listen(port,'127.0.0.1',()=>console.log(`LobbyGOL API: http://127.0.0.1:${port}`));
