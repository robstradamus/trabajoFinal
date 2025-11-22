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
    body('productos.*.id_producto', 'Debe seleccionar el producto.').notEmpty().toInt(),
    body('productos.*.cantidad', 'La cantidad es obligatoria').notEmpty().isFloat({ min: 0.01 }).toFloat(),
    body('productos.*.precio_unitario', 'El precio es obligatorio').notEmpty().isFloat({ min: 0.01 }).toFloat(),
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

router.post('/crear_producto',
    [
        body('nombre', 'El nombre es obligatorio').trim().notEmpty().escape(),
        body('tipoProducto', 'Debe seleccionar el tipo de producto').notEmpty(),
        body('codBarra', 'El codigo de  barra es obligatorio').notEmpty(),
        body('idProveedor', 'Debe seleccionar un proveedor').notEmpty(),
        body('precioUnitario', 'El precio unitario es obligatorio').notEmpty().isFloat({min: 0.1}).withMessage('El precio unitario debe ser positivo.').escape(),
        body('stock', 'El stock es obligatorio').notEmpty().isInt({min: 1}).withMessage('El stock debe ser positivo.').escape(),
        body('descripcion', 'La descripcion no es valida').trim().isLength({max:100}).escape()
    ]
, ventaController.crearProducto);
module.exports = router;