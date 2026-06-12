const path = require('path');
const express = require('express');
const cors = require('cors');
const descriptorDao = require('./dao/descriptorDao');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/descriptores', async (req, res) => {
  try {
    const corrEmpresa = Number(req.query.empresa || 1);
    const data = await descriptorDao.getDescriptoresResumen(corrEmpresa);
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'No se pudo consultar la lista de descriptores.',
      detail: error.message
    });
  }
});

app.get('/api/descriptores/:id', async (req, res) => {
  try {
    const corrEmpresa = Number(req.query.empresa || 1);
    const corrDescriptorPuesto = Number(req.params.id);
    const data = await descriptorDao.getDescriptorCompleto(corrEmpresa, corrDescriptorPuesto);

    if (!data) {
      res.status(404).json({ ok: false, message: 'Descriptor no encontrado.' });
      return;
    }

    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'No se pudo consultar el descriptor.',
      detail: error.message
    });
  }
});

app.get('/prueba', (req, res) => {
  res.sendFile(path.join(__dirname, 'prueba.html'));
});

app.listen(port, () => {
  console.log(`Servidor listo: http://localhost:${port}/prueba.html`);
});
