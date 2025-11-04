const gastoController = require('../controllers/gastoController');
const express = require('express');
const router = express.Router();


router.get('/gasto/registrar', gastoController.mostrarFormularioRegistro);

router.get('/gasto/listado', gastoController.listado);

module.exports = router;