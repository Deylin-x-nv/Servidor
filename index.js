const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const tmp = require('tmp');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('MP3 Cover Proxy está en funcionamiento.');
});

app.get('/proxy-mp3', async (req, res) => {
  const { audioUrl, imageUrl } = req.query;

  if (!audioUrl || !imageUrl) {
    return res.status(400).json({ error: 'Se requieren audioUrl e imageUrl.' });
  }

  const audioTmp = tmp.fileSync({ postfix: '.mp3' });
  const imageTmp = tmp.fileSync({ postfix: '.jpg' });
  const outputTmp = tmp.fileSync({ postfix: '.mp3' });

  try {
    // Descargar audio
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error('Error al descargar el audio.');
    await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(audioTmp.name);
      audioRes.body.pipe(stream);
      audioRes.body.on('error', reject);
      stream.on('finish', resolve);
    });

    // Descargar imagen
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error('Error al descargar la imagen.');
    await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(imageTmp.name);
      imageRes.body.pipe(stream);
      imageRes.body.on('error', reject);
      stream.on('finish', resolve);
    });

    // Procesar con ffmpeg
    ffmpeg()
      .input(audioTmp.name)
      .input(imageTmp.name)
      .outputOptions([
        '-map 0:a',
        '-map 1:v',
        '-c:a libmp3lame', // Requiere recodificar para añadir portada
        '-c:v mjpeg',      // Portada como jpeg
        '-id3v2_version 3',
        '-metadata:s:v title="Album cover"',
        '-metadata:s:v comment="Cover (front)"'
      ])
      .on('end', () => {
        res.setHeader('Content-Disposition', 'attachment; filename="audio_con_portada.mp3"');
        res.setHeader('Content-Type', 'audio/mpeg');
        const stream = fs.createReadStream(outputTmp.name);
        stream.pipe(res);
      })
      .on('error', (err) => {
        console.error('Error en ffmpeg:', err);
        res.status(500).json({ error: 'Error procesando el audio con ffmpeg.' });
      })
      .save(outputTmp.name);

  } catch (err) {
    console.error('Error general:', err);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
