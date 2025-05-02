const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 10000;

app.use(cors());
app.use(express.json());

const FILE = path.join(__dirname, 'mensajes.json');

// Inicializa archivo si no existe
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, '[]');
}

app.get('/', (req, res) => {
  res.send('Servidor de mensajes en funcionamiento');
});

app.get('/mensajes', (req, res) => {
  const mensajes = JSON.parse(fs.readFileSync(FILE));
  res.json(mensajes);
});

app.post('/mensajes', (req, res) => {
  const { usuario, texto } = req.body;
  if (!usuario || !texto) {
    return res.status(400).json({ error: 'usuario y texto son requeridos' });
  }

  const mensajes = JSON.parse(fs.readFileSync(FILE));
  mensajes.push({ usuario, texto, fecha: new Date().toISOString() });
  fs.writeFileSync(FILE, JSON.stringify(mensajes, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
