const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const compraController = require('../controllers/compraController');

router.get('/compra/registrar', compraController.mostrarRegistrar);
router.post('/compra/registrar', [
    body('proveedor', 'Debe asignarse a un Proveedor').notEmpty(),
    body('fecha', 'La fecha es obligatoria').notEmpty().isDate(),
    body('producto', 'Debe incluir al menos un producto.').isArray({min: 1}),
    body('producto.*', 'El debe seleccionar el producto.').notEmpty().escape(),
    body('cantidad', 'Debe incluir cantidad.').isArray({min: 1}),
    body('cantidad.*', 'La cantidad es obligatoria').notEmpty().isInt({min: 1}).escape(),
    body('precio_unitario', 'Debe incluir el precio unitario.').isArray({min: 1}),
    body('precio_unitario.*', 'El precio es obligatorio').notEmpty().isFloat()
], compraController.registrar);

router.get('/compra/lista', compraController.mostrarListado);

router.get('/compra/detalle/:id_compra', compraController.mostrarDetalle);

router.get('/compra/pagos/:id_compra', compraController.mostrarPagos);
router.get('/compra/pagos/registrar/:id_compra', compraController.registrarPago);
router.post('/compra/pagos/registrar/:id_compra', [
    body('monto', 'Debe incluir un monto.').notEmpty().isFloat({min:0.1}).withMessage('El monto debe ser positivo.').escape(),
    body('fecha', 'La fecha es obligatoria.').notEmpty().isDate(),
    body('metodo_pago', 'El metodo de pago es obligatorio.').trim().notEmpty().isLength({min:1, max:50}).escape(),
    body('observaciones', 'La observacion no puede superar los 100 caracteres.').isLength({max: 100}).escape()
], compraController.registrarPagoPost);
module.exports = router;