const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const proveedorController = require('../controllers/proveedorController');

////////////////////////// Proveedores ///////////////////////////////
// Registrar Proveedor
router.get('/proveedor/registrar', proveedorController.mostrarRegistrar);
router.post('/proveedor/registrar', [
    body('nombre', 'El nombre es invalido').trim().notEmpty().isLength({min:2, max:50}).escape(),
    body('tipoRubro', 'Debes seleccionar un tipo de rubro').trim().notEmpty().isIn(['Carniceria', 'Almacen']).escape(),
    body('numTel', 'El telefono es obligatorio').trim().escape().isLength({min:8, max:10}).withMessage('El telefono debe tener 8 a 10 caracteres'),
    body('tipoProducto', 'El tipo de producto es invalido').trim().notEmpty().isLength({min:2, max:50}).escape(),
    body('observaciones', 'Observaciones no validas').trim().isLength({max:100}).escape()
], proveedorController.registrarPost);

// Listado Proveedores
router.get('/proveedor/listado', proveedorController.mostrarListado);
// Eliminar Proveedor
router.get('/proveedor/eliminar/:id_proveedor', proveedorController.eliminar);
// Modificar Proveedor
router.get('/proveedor/modificar/:id_proveedor', proveedorController.mostrarModificar);
router.post('/proveedor/modificar/:id_proveedor', [
    body('nombre', 'El nombre es invalido').trim().notEmpty().isLength({min:2, max:50}).escape(),
    body('tipoRubro', 'Debes seleccionar un tipo de rubro').trim().notEmpty().escape(),
    body('numTel', 'El telefono es obligatorio').trim().escape().isLength({min:8, max:10}).withMessage('El telefono debe tener 8 a 10 caracteres'),
    body('tipoProducto', 'El tipo de producto es invalido').trim().notEmpty().isLength({min:2, max:50}).escape(),
    body('observaciones', 'Observaciones no validas').trim().isLength({max:100}).escape()
], proveedorController.modificar);

module.exports = router;