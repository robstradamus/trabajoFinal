const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/venta/listado', ventaController.mostrarListado);
router.get('/venta/detalle/:id_venta', ventaController.mostrarDetalle);

router.get('/producto/buscar/:code', ventaController.buscarProducto);
router.get('/venta/registrar', ventaController.registrarVenta);
router.post('/venta/registrar', [
    body('id_cliente').if(body('tipo_pago').equals('CORRIENTE'))
    .notEmpty().withMessage('Debe seleccionar un cliente para Cuenta Corriente.')
    .toInt(),
    body('id_cliente', 'Cliente incorrecto.').optional({ checkFalsy: true }).trim().toInt(),
    body('fecha', 'La fecha es obligatoria.').notEmpty().isDate(),
    body('productos', 'Debe incluir al menos un producto.').isArray({min: 1}),
    body('productos.*.id_producto', 'El debe seleccionar el producto.').notEmpty().toInt(),
    body('productos.*.cantidad', 'La cantidad es obligatoria').notEmpty().isInt({min: 1}).toInt(),
    body('productos.*.precio_unitario', 'El precio es obligatorio').notEmpty().isFloat().toFloat(),
    body('tipo_pago', 'El tipo de pago es obligatorio').trim()
], ventaController.registrarVentaPost);

router.get('/venta/pago/listado/:id_venta', ventaController.listadoPagos);
router.get('/venta/pago/registrar/:id_venta', ventaController.registrarPago);

router.post('/venta/pago/registrar/:id_venta', [
    body('monto', 'Debe incluir un monto.').notEmpty().isFloat().escape(),
    body('fecha', 'La fecha es obligatoria.').notEmpty().isDate(),
    body('metodo_pago', 'El metodo de pago es obligatorio.').trim().notEmpty().isLength({min:1, max:50}).escape(),
    body('observaciones', 'La observacion no puede superar los 100 caracteres.').isLength({max: 100}).escape()
], ventaController.registrarPagoPost);
module.exports = router;