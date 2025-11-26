const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/reportes/diario', reporteController.mostrarReporteDiario);

router.post('/reportes/generar-pdf', reporteController.generarReportePDF);

router.get('/reportes/historial', reporteController.mostrarHistorial);

router.get('/reportes/descargar/:id', reporteController.descargarReporte);
module.exports = router;