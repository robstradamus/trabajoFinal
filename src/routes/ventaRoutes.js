const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/venta/listado', ventaController.mostrarListado);
router.get('/venta/detalle/:id_venta', ventaController.mostrarDetalle);

router.get('/producto/buscar/:code', ventaController.buscarProducto);
router.get('/venta/registrar', ventaController.registrarVenta);
router.post('/venta/registrar', [
    body('fecha', 'La fecha es obligatoria').notEmpty().isDate(),
    body('productos', 'Debe incluir al menos un producto.').isArray({min: 1}),
    body('productos.*.id_producto', 'El debe seleccionar el producto.').notEmpty().toInt(),
    body('productos.*.cantidad', 'La cantidad es obligatoria').notEmpty().isInt({min: 1}).toInt(),
    body('productos.*.precio_unitario', 'El precio es obligatorio').notEmpty().isFloat().toFloat(),
    body('tipo_pago', 'El tipo de pago es obligatorio').trim()
], ventaController.registrarVentaPost);
module.exports = router;