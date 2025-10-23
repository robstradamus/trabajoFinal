const mProducto = require('../config/models/producto');
const mDetalleVenta = require('../config/models/detalleVenta');
const mVenta = require('../config/models/venta');
const mCliente = require('../config/models/cliente');
const { validationResult } = require('express-validator');

module.exports.buscarProducto = async (request, response) => {
    const cod = request.params.code;
    //console.log(cod);
    try {
        let buscar = await mProducto.findOne({
            where: {'cod_barra': cod},
            raw: true
        });
        response.status(200).json(buscar);
    } catch (error) {
        response.status(500).json({ error: 'No se encontró el producto.' });
    }
}

module.exports.registrarVenta = async (request, response) => {
    let datosProducto = await mProducto.findAll({
        raw: true
    });

    const today = new Date();
    const año = today.getFullYear();
    const mes = String(today.getMonth() + 1).padStart(2, '0'); 
    const dia = String(today.getDate()).padStart(2, '0'); 
    let fecha = año + "-" + mes + "-" + dia;

    return response.render('venta/registrar', {paramProducto: datosProducto, fechaActual: fecha});
}

module.exports.registrarVentaPost2 = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/venta/registrar');
    }

    const {id_cliente, fecha, total, producto, cantidad, precio_unitario, subtotal} = request.body;
    let insertarVenta = await mVenta.create({
        'id_cliente': 1,
        'fecha': fecha,
        'total': total,
        'saldo_pendiente': total
    });
    //console.log(insertarVenta);

    if (insertarVenta) {
        const id_venta = insertarVenta.id_venta;
        for (let i = 0; i < producto.length; i++) {
            const insertarDetalle = await mDetalleVenta.create({
                'id_producto': producto[i],
                'id_venta': id_venta,
                'cantidad': cantidad[i],
                'precio_unitario': precio_unitario[i],
                'subTotal': subtotal[i]
            });

            const datosProducto = await mProducto.findOne({
                where: {'id_producto': producto[i]},
                raw: true
            });

            let nuevoStock = parseInt(datosProducto.stock) - parseInt(cantidad[i]);

            const actualizarStock = await mProducto.update({
                "stock": nuevoStock
            }, {where: {"id_producto": producto[i]}});

            //console.log(actualizarStock);

            if (!insertarDetalle) {
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{msg: 'Error en el registro de Detalle.'}])
                return response.redirect('/venta/registrar')
            }
        }

        return response.redirect('/venta/lista');
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error en el registro.'}])
        return response.redirect('/venta/registrar');
    }
}

module.exports.registrarVentaPost = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/venta/registrar');
    }

    const {id_cliente, fecha, total, tipo_pago, productos} = request.body;
    let saldo_pendiente;
    //console.log(fecha, '\t', total, '\t', tipo_pago, '\t', productos);

    if (tipo_pago === "CORRIENTE") {
        saldo_pendiente = 0;
    } else {
        saldo_pendiente = total;
    }

    let insertarVenta = await mVenta.create({
        'fecha': fecha,
        'total': total,
        'saldo_pendiente': saldo_pendiente
    });
    //console.log(insertarVenta);

    if (insertarVenta) {
        const id_venta = insertarVenta.id_venta;
        for (const item of productos) {
            console.log(item.subtotal);
            const subtotalDetalle = (item.cantidad * item.precio_unitario).toFixed(2);
            const insertarDetalle = await mDetalleVenta.create({
                'id_producto': item.id_producto,
                'id_venta': id_venta,
                'cantidad': item.cantidad,
                'precio_unitario': item.precio_unitario,
                'subtotal': subtotalDetalle
            });

            if (!insertarDetalle) {
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{msg: 'Error en el registro de Detalle.'}])
                return response.redirect('/venta/registrar')
            }

            const datosProducto = await mProducto.findOne({
                where: {'id_producto': item.id_producto},
                raw: true
            });

            let nuevoStock = parseInt(datosProducto.stock) - parseInt(item.cantidad);

            const actualizarStock = await mProducto.update({
                "stock": nuevoStock
            }, {where: {"id_producto": item.id_producto}});

            //console.log(actualizarStock);
        }
        request.flash('varEstiloMensaje', 'success');
        request.flash('varMensaje', [{msg: "Venta registrada con éxito." }]);
        return response.redirect('/venta/listado');
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error en el registro.'}])
        return response.redirect('/venta/registrar');
    }
}

module.exports.mostrarListado = async (request, response) => {
    let listadoVenta = await mVenta.findAll({
        include: [
            { model: mCliente, as: 'Cliente', attributes: ['nombre'] }
        ],
        raw: true
    });

    const listadoVentaLimpia = listadoVenta.map(venta => {
        venta.nombre_cliente = venta['Cliente.nombre'];
        delete venta['Cliente.nombre']; 
        return venta;
    });

    //console.log(listadoVentaLimpia);
    return response.render('venta/listado', {paramListadoVentas: listadoVentaLimpia});
}

module.exports.mostrarDetalle = async (request, response) => {
    const {id_venta} = request.params;
    let detalleVenta = await mVenta.findOne({
        where: {'id_venta': id_venta},
        raw: true
    });

    let listadoDetalle = await mDetalleVenta.findAll({
        where: {'id_venta': id_venta},
        include: [
            {model: mProducto, as: 'Producto', attributes: ['nombre']},
            {model: mVenta, as: 'Venta', attributes: ['fecha']}
        ],
        raw: true
    });

    const listadoDetalleLimpia = listadoDetalle.map(detalles => {
        detalles.producto_nombre = detalles['Producto.nombre'];
        delete detalles['Producto.nombre']; 
        detalles.fecha = detalles['Venta.fecha'];
        delete detalles['Venta.fecha']; 
        return detalles;
    });

    console.log(listadoDetalleLimpia);
    return response.render('venta/detalle', {paramVenta: detalleVenta, paramDetallesVenta: listadoDetalleLimpia});
}