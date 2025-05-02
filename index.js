const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let mensajes = [];

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de mensajes estilo WhatsApp funcionando.');
});

// Obtener todos los mensajes
app.get('/mensajes', (req, res) => {
  res.json(mensajes);
});

// Enviar nuevo mensaje
app.post('/mensajes', (req, res) => {
  const { usuario, texto } = req.body;
  if (!usuario || !texto) {
    return res.status(400).json({ error: 'usuario y texto son obligatorios.' });
  }

  const nuevoMensaje = {
    id: mensajes.length + 1,
    usuario,
    texto,
    fecha: new Date().toISOString()
  };

  mensajes.push(nuevoMensaje);
  res.status(201).json(nuevoMensaje);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
