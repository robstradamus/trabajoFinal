//Desarrollar Logica de rutas y validaciones aqui
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productoController=require('../controllers/productoController.js');

router.get('/producto/registrar', productoController.producto);
router.get('/producto/listado', productoController.listado);

router.post('/producto/registrar', 
    [
        body('nombre', 'El nombre es obligatorio').trim().notEmpty().escape(),
        body('tipoProducto', 'Debe seleccionar el tipo de producto').notEmpty(),
        body('codBarra', 'El codigo de  barra es obligatorio').notEmpty(),
        body('idProveedor', 'Debe seleccionar un proveedor').notEmpty(),
        body('precioUnitario', 'El precio unitario es obligatorio').notEmpty(),
        body('stock', 'El stock es obligatorio').notEmpty(),
        body('descripcion', 'La descripcion no es valida').trim().isLength({max:100}).escape()
    ]
,productoController.producto_post);

router.get('/producto/eliminar/:id_producto', productoController.eliminar);

router.get('/producto/modificar/:id_producto', productoController.modificar);

router.post('/producto/modificar/:id_producto', 
    [
        body('nombre', 'El nombre es obligatorio').trim().notEmpty().escape(),
        body('tipoProducto', 'Debe seleccionar el tipo de producto').notEmpty(),
        body('codBarra', 'El codigo de  barra es obligatorio').notEmpty(),
        body('idProveedor', 'Debe seleccionar un proveedor').notEmpty(),
        body('precioUnitario', 'El precio unitario es obligatorio').notEmpty(),
        body('stock', 'El stock es obligatorio').notEmpty(),
        body('descripcion', 'La descripcion no es valida').trim().isLength({max:100}).escape()
    ]
,productoController.modificar_post);

module.exports = router;