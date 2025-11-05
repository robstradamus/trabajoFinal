const gastoController = require('../controllers/gastoController');
const { body } = require('express-validator');
const express = require('express');
const router = express.Router();


router.get('/gasto/registrar', gastoController.mostrarFormularioRegistro);

router.get('/gasto/listado', gastoController.listado);

router.post('/gasto/registrar', 
    [
        body('fecha', '...').escape().isDate(),
        body('tipoGasto', 'El tipo de gasto es obligatorio').trim().notEmpty().escape(),
        body('descripcion', 'Maximo de caracteres alcanzado (100)').isLength({max: 100}).escape(),
        body('monto', 'El monto es obligatorio').notEmpty().isFloat().escape()
    ]
,gastoController.registro);

module.exports = router;