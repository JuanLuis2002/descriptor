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

app.patch('/api/descriptores/:id/estado', async (req, res) => {
  try {
    const corrEmpresa = Number(req.query.empresa || 1);
    const corrDescriptorPuesto = Number(req.params.id);
    const { estado, observacion, usuario, rolUsuario, estacion } = req.body || {};

    if (!estado) {
      res.status(400).json({ ok: false, message: 'Debe indicar el nuevo estado.' });
      return;
    }

    const result = await descriptorDao.cambiarEstadoDescriptor(corrEmpresa, corrDescriptorPuesto, estado, {
      observacion,
      usuario,
      rolUsuario,
      estacion
    });

    if (!result.ok) {
      res.status(400).json(result);
      return;
    }

    res.json({ ok: true, message: 'Estado actualizado y bitácora registrada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'No se pudo actualizar el estado del descriptor.',
      detail: error.message
    });
  }
});

app.post('/api/descriptores/:id/nueva-version', async (req, res) => {
  try {
    const corrEmpresa = Number(req.query.empresa || 1);
    const corrDescriptorPuesto = Number(req.params.id);
    const { usuario, rolUsuario, estacion } = req.body || {};

    const result = await descriptorDao.crearNuevaVersionDescriptor(corrEmpresa, corrDescriptorPuesto, {
      usuario,
      rolUsuario,
      estacion
    });

    if (!result.ok) {
      res.status(400).json(result);
      return;
    }

    res.json({
      ok: true,
      message: `Nueva versión creada: DES-${result.descriptor.CORR_DESCRIPTOR_PUESTO}, versión ${result.descriptor.VERSION}.`,
      data: result.descriptor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'No se pudo crear la nueva versión del descriptor.',
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
