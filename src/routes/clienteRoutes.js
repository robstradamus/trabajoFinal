//Desarrollar logica y validaciones de Clientes 
//Importar ruta en app.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const mCliente = require('../config/models/cliente');

router.get('/cliente/listado', clienteController.listado);

router.get('/cliente/registrar', clienteController.cliente);

router.post('/cliente/registrar', 
    [
        body('nombre', 'El nombre es obligatorio').trim().notEmpty().escape(),
        body('dni', 'El DNI es obligatorio').trim().escape(),
        body('telefono', 'El telefono es obligatorio').trim().escape(),
        body('observaciones', 'Maximo de caracteres 100').isLength({max:100})
    ]
,clienteController.registrar);

router.get('/cliente/eliminar/:id_cliente', clienteController.eliminar);

router.get('/cliente/modificar/:id_cliente', clienteController.modificar);

router.post('/cliente/modificar/:id_cliente', 
    [
        body('nombre', 'El nombre es obligatorio').trim().notEmpty().escape(),
        body('dni', 'El DNI es obligatorio').trim().escape(),
        body('telefono', 'El telefono es obligatorio').trim().escape(),
        body('observaciones', 'Maximo de caracteres 100').isLength({max:100})
    ]
,clienteController.modificar_post)


module.exports = router;