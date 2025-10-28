const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const cuenta= require('../controllers/clienteController');

router.get('/cuenta-corriente/listado', clienteController.listado);

module.exports = router;