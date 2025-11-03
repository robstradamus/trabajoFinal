const mProducto = require('../config/models/producto');
const mDetalleVenta = require('../config/models/detalleVenta');
const mVenta = require('../config/models/venta');
const mCliente = require('../config/models/cliente');
const mPagoCliente = require('../config/models/pagoCliente');
const { validationResult } = require('express-validator');
const { where } = require('sequelize');

module.exports.buscarProducto = async (request, response) => {
    const cod = request.params.code;
    console.log(cod);
    try {
        let buscar = await mProducto.findOne({
            where: {'cod_barra': cod},
            raw: true
        });

        if (buscar.stock <= 0) {
            response.status(501).json({error: 'No hay stock.'});
        } else {
            response.status(200).json(buscar);
        }
    } catch (error) {
        response.status(500).json({ error: 'No se encontró el producto.' });
    }
}

module.exports.registrarVenta = async (request, response) => {
    let listadoClientes = await mCliente.findAll({
        raw: true
    });

    let datosProducto = await mProducto.findAll({
        raw: true
    });

    console.log(listadoClientes);

    const today = new Date();
    const año = today.getFullYear();
    const mes = String(today.getMonth() + 1).padStart(2, '0'); 
    const dia = String(today.getDate()).padStart(2, '0'); 
    let fecha = año + "-" + mes + "-" + dia;

    return response.render('venta/registrar', {paramProducto: datosProducto, fechaActual: fecha, paramCliente: listadoClientes});
}

module.exports.registrarVentaPost2 = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/venta/registrar');
    }

    const {cliente, fecha, total, producto, cantidad, precio_unitario, subtotal} = request.body;
    console.log(request.body);
    let insertarVenta = await mVenta.create({
        'id_cliente': cliente,
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
    let estado;

    if (tipo_pago === "CORRIENTE") {
        saldo_pendiente = total;
        estado = "PENDIENTE";
    } else {
        saldo_pendiente = 0;
        estado = "PAGADO";
    }

    let insertarVenta;
    if (id_cliente) {
        insertarVenta = await mVenta.create({
            'id_cliente': id_cliente,
            'fecha': fecha,
            'total': total,
            'saldo_pendiente': saldo_pendiente
        });
    } else {
        insertarVenta = await mVenta.create({
            'fecha': fecha,
            'total': total,
            'saldo_pendiente': saldo_pendiente
        });
    }
    console.log(insertarVenta)

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
            { model: mCliente, as: 'Cliente', attributes: ['nombre', 'dni'] }
        ],
        raw: true
    });

    const listadoVentaLimpia = listadoVenta.map(venta => {
        venta.nombre_cliente = venta['Cliente.nombre'];
        venta.dni_cliente = venta['Cliente.dni'];
        delete venta['Cliente.nombre']; 
        delete venta['Cliente.dni']; 
        return venta;
    });

    console.log(listadoVentaLimpia);
    return response.render('venta/listado', {paramListadoVentas: listadoVentaLimpia});
}

module.exports.mostrarDetalle = async (request, response) => {
    const {id_venta} = request.params;
    let detalleVenta = await mVenta.findOne({
        where: {'id_venta': id_venta},
        include: [
            {model: mCliente, as: 'Cliente', attributes: ['nombre', 'dni']}
        ],
        raw: true
    });

    let listadoDetalle = await mDetalleVenta.findAll({
        where: {'id_venta': id_venta},
        include: [
            {model: mProducto, as: 'Producto', attributes: ['nombre']},
            {model: mVenta, as: 'Venta', attributes: ['fecha']},
        ],
        raw: true
    });

    detalleVenta.nombre = detalleVenta['Cliente.nombre'];
    delete detalleVenta['Cliente.nombre']; 
    detalleVenta.dni = detalleVenta['Cliente.dni'];
    delete detalleVenta['Cliente.dni']; 

    let pagado = detalleVenta.total - detalleVenta.saldo_pendiente;
    detalleVenta.pagado = pagado;

    const listadoDetalleLimpia = listadoDetalle.map(detalles => {
        detalles.producto_nombre = detalles['Producto.nombre'];
        delete detalles['Producto.nombre']; 
        detalles.fecha = detalles['Venta.fecha'];
        delete detalles['Venta.fecha']; 
        return detalles;
    });

    return response.render('venta/detalle', {paramVenta: detalleVenta, paramDetallesVenta: listadoDetalleLimpia});
}

module.exports.listadoPagos = async (request, response) => {
    const {id_venta} = request.params;

    let listadoVenta = await mVenta.findOne({
        where: {'id_venta': id_venta},
        raw: true
    });

    let listadoPagos = await mPagoCliente.findAll({
        where: {'id_venta': id_venta},
        include: [
            {model: mVenta, as: 'Venta', attributes: ['fecha'], include: [
                {model: mCliente, as: 'Cliente', attributes: ['nombre', 'dni']}
            ]}
        ],
        raw: true
    });

    let listadoPagosLimpia = listadoPagos.map(pagos => {
        pagos.fecha_venta = pagos['Venta.fecha'];
        delete pagos['Venta.fecha']; 
        pagos.cliente_nombre = pagos['Venta.Cliente.nombre'];
        delete pagos['Venta.Cliente.nombre'];
        pagos.cliente_dni = pagos['Venta.Cliente.dni'];
        delete pagos['Venta.Cliente.dni'];
        return pagos;
    });


    console.log(listadoPagosLimpia);
    return response.render('venta/pagos', {paramListadoPagosVentas: listadoPagosLimpia, id_venta: id_venta, saldo_pendiente: listadoVenta.saldo_pendiente});
}

module.exports.registrarPago = async (request, response) => {
    const {id_venta} = request.params;
    let datosVenta = await mVenta.findOne({
        where: {'id_venta': id_venta},
        include: [
            {model: mCliente, as: 'Cliente', attributes: ['nombre', 'dni']}
        ],
        raw: true
    });

    datosVenta.nombre_cliente = datosVenta['Cliente.nombre'];
    datosVenta.dni_cliente = datosVenta['Cliente.dni'];
    delete datosVenta['Cliente.nombre'];
    delete datosVenta['Cliente.dni'];

    console.log(datosVenta);
    return response.render('venta/registrarPago', {paramDatosVenta: datosVenta});
}

module.exports.registrarPagoPost = async (request, response) => {
    const {id_venta} = request.params;
    const errores = validationResult(request);

    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/venta/pago/registrar/' + id_venta);
    }

    const {monto, fecha, metodo_pago, observaciones} = request.body;

    let datosVenta = await mVenta.findOne({
        where: {'id_venta': id_venta},
        raw: true
    });

    let nuevo_saldo_pendiente = datosVenta.saldo_pendiente - monto;
    if (nuevo_saldo_pendiente < 0) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'No se pudo realizar el registro del Pago porque el monto a pagar es mayor al pendiente.'}]);
        return response.redirect('/venta/pago/registrar/' + id_venta);
    }

    let insertarPago = await mPagoCliente.create({
        "id_cliente": datosVenta.id_cliente,
        "id_venta": id_venta,
        "monto_pago": monto,
        "fecha": fecha,
        "metodo_pago": metodo_pago,
        "observaciones": observaciones
    });

    if (insertarPago) {
        let actualizarVenta = await mVenta.update({
            'saldo_pendiente': nuevo_saldo_pendiente
        }, {where: {'id_venta': id_venta}});

        if (actualizarVenta) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Registro Exitoso.'}]);
            return response.redirect('/venta/pago/listado/' + id_venta);
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'No se pudo actualizar el saldo pendiente de la compra.'}]);
            return response.redirect('/venta/pago/registrar/' + id_venta);
        }
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'No se pudo realizar el registro del Pago.'}]);
        return response.redirect('/venta/pago/registrar/' + id_venta);
    }
}