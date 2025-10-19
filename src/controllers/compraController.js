const { validationResult } = require('express-validator');
const mProveedor = require('../config/models/proveedor');
const mCompra = require('../config/models/compra');
const mDetalleCompra = require('../config/models/detalleCompra');
const mPagoProveedor = require('../config/models/pagoProveedor')


module.exports.mostrarRegistrar = async (request, response) => {
    let datosProveedor = await mProveedor.findAll({
        raw: true
    });
    return response.render('compra/registrar', {paramProveedor: datosProveedor});
}

module.exports.registrar = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/compra/registrar');
    }

    const {proveedor, fecha, total, producto, cantidad, precio_unitario, subtotal} = request.body;
    let insertarCompra = await mCompra.create({
        'id_proveedor': proveedor,
        'fecha': fecha,
        'total': total,
        'saldo_pendiente': total
    });
    console.log(total);

    if (insertarCompra) {
        const id_compra = insertarCompra.id_compra;
        for (let i = 0; i < producto.length; i++) {
            const insertarDetalle = await mDetalleCompra.create({
                'id_compra': id_compra,
                'id_producto': producto[i],
                'cantidad': cantidad[i],
                'precio_unitario': precio_unitario[i],
                'subTotal': subtotal[i]
            });

            if (!insertarDetalle) {
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{msg: 'Error en el registro de Detalle.'}])
                return response.redirect('/compra/registrar')
            }
        }

        return response.redirect('/compra/lista');
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error en el registro.'}])
        return response.redirect('/compra/registrar');
    }

}

module.exports.mostrarListado = async (request, response) => {
    let listadoCompra = await mCompra.findAll({
        include: [
            { model: mProveedor, as: 'Proveedor', attributes: ['nombre'] }
        ],
        raw: true
    });

    const listadoCompraLimpia = listadoCompra.map(compra => {
        compra.nombre_proveedor = compra['Proveedor.nombre'];
        delete compra['Proveedor.nombre']; 
        return compra;
    });

    console.log(listadoCompraLimpia);
    return response.render('compra/lista', {paramListadoCompras: listadoCompraLimpia});
}

module.exports.mostrarDetalle = async (request, response) => {
    const {id_compra} = request.params;
    let listadoDetalle = await mDetalleCompra.findAll({
        where: {'id_compra': id_compra},
        raw: true
    });
    console.log(listadoDetalle);
    return response.render('compra/detalle', {paramListadoDetalleCompra: listadoDetalle});
}

module.exports.mostrarPagos = async (request, response) => {
    const {id_compra} = request.params;

    let listadoCompra = await mCompra.findOne({
        where: {'id_compra': id_compra},
        raw: true
    });

    let listadoPagos = await mPagoProveedor.findAll({
        where: {'id_compra': id_compra},
        include: [
            {
                model: mCompra,
                as: 'Compras',
                attributes: ['fecha'],
                include: [{
                    model: mProveedor,
                    as: 'Proveedor',
                    attributes: ['nombre']
                }]
            }
        ],
        raw: true
    });

    const listadoPagosLimpia = listadoPagos.map(pagos => {
        pagos.fecha_compra = pagos['Compras.fecha'];
        delete pagos['Compras.fecha']; 
        pagos.nombre_proveedor = pagos['Compras.Proveedor.nombre'];
        delete pagos['Compras.Proveedor.nombre'];
        return pagos;
    });

    console.log(listadoPagosLimpia);
    console.log(listadoCompra.saldo_pendiente);
    return response.render('compra/pagos', {paramListadoPagosProveedores: listadoPagosLimpia, idCompra: id_compra, montoPendiente: listadoCompra.saldo_pendiente});
}

module.exports.registrarPago = async (request, response) => {
    const {id_compra} = request.params;
    let datosCompra = await mCompra.findOne({
        where: {'id_compra': id_compra},
        include: [
            {model: mProveedor, as: 'Proveedor', attributes: ['nombre']}
        ],
        raw: true
    });

    datosCompra.nombre_proveedor = datosCompra['Proveedor.nombre'];
    delete datosCompra['Proveedor.nombre'];

    console.log(datosCompra);
    return response.render('compra/registrarPago', {paramDatosCompra: datosCompra});
}

module.exports.registrarPagoPost = async (request, response) => {
    let {id_compra} = request.params;
    const errores = validationResult(request);

    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/compra/pagos/registrar/' + id_compra);
    }

    const {monto, fecha, metodo_pago, observaciones} = request.body;

    let datosCompra = await mCompra.findOne({
        where: {"id_compra": id_compra},
        raw: true
    });

    let nuevo_saldo_pendiente = datosCompra.saldo_pendiente - monto;
    if (nuevo_saldo_pendiente < 0) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'No se pudo realizar el registro del Pago porque el monto a pagar es mayor al pendiente.'}]);
        return response.redirect('/compra/pagos/registrar/' + id_compra);
    }

    let insertarPago = await mPagoProveedor.create({
        "id_compra": id_compra,
        "monto": monto,
        "fecha": fecha,
        "metodo_pago": metodo_pago,
        "observaciones": observaciones
    });

    if (insertarPago) {
        let actualizarCompra = await mCompra.update({
            'saldo_pendiente': nuevo_saldo_pendiente
        }, {where: {'id_compra': id_compra}});

        if (actualizarCompra) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Registro Exitoso.'}]);
            return response.redirect('/compra/pagos/' + id_compra);
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'No se pudo actualizar el saldo pendiente de la compra.'}]);
            return response.redirect('/compra/pagos/registrar/' + id_compra);
        }
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'No se pudo realizar el registro del Pago.'}]);
        return response.redirect('/compra/pagos/registrar/' + id_compra);
    }
}