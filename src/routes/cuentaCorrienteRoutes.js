const express = require('express');
const router = express.Router();
const cuentaCorrienteController = require('../controllers/cuentaCorrienteController');

router.get('/cuentas-corrientes/listado', cuentaCorrienteController.listado);
module.exports = router;