const { validationResult } = require('express-validator');
const mProveedor = require('../config/models/proveedor');
const mCompra = require('../config/models/compra');
const mDetalleCompra = require('../config/models/detalleCompra');
const mPagoProveedor = require('../config/models/pagoProveedor');
const mProducto = require('../config/models/producto');
const { listado } = require('./productoController');

module.exports.mostrarRegistrar = async (request, response) => {
    try{
        let datosProveedor = await mProveedor.findAll({
            raw: true
        });

        let datosProducto = await mProducto.findAll({
            raw: true
        });
        return response.render('compra/registrar', { paramProveedor: datosProveedor, paramProducto: datosProducto });
    
    }catch (error) {
        console.error("Error en mostrarRegistrar", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la pagina de registro'}]);
        return response.redirect('/compra/lista');
    }
}

module.exports.registrar = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/compra/registrar');
    }
    try {
        const { proveedor, fecha, total, producto, cantidad, precio_unitario, subtotal } = request.body;
        let insertarCompra = await mCompra.create({
            'id_proveedor': proveedor,
            'fecha': fecha,
            'total': total,
            'saldo_pendiente': total
        });
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

                const datosProducto = await mProducto.findOne({
                    where: { 'id_producto': producto[i] },
                    raw: true
                });

                let nuevoStock = parseInt(datosProducto.stock) + parseInt(cantidad[i]);

                const actualizarStock = await mProducto.update({
                    "stock": nuevoStock
                }, { where: { "id_producto": producto[i] } });
                if (!insertarDetalle) { 
                    request.flash('varEstiloMensaje', 'danger');
                    request.flash('varMensaje', [{ msg: 'Error en el registro de Detalle' }])
                    return response.redirect('/compra/registrar')
                }
            }

            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Compra registrada con éxito'}]);
            return response.redirect('/compra/lista');
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error en el registro' }])
            return response.redirect('/compra/registrar');
        }
    } catch (error) {
        console.error("Error al registrar la compra:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{ msg: 'Error al guardar la compra' }]);
        return response.redirect('/compra/registrar');
    }
}

module.exports.mostrarListado = async (request, response) => {
    try{
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

        return response.render('compra/lista', { paramListadoCompras: listadoCompraLimpia });
    
    }catch(error) {
        console.error("Error al mostrar listado de compras:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar el listado'}]);
        return response.redirect('/dashboard');
    }
}

module.exports.mostrarDetalle = async (request, response) => {
    try{ 
        const { id_compra } = request.params;
        let listadoDetalle = await mDetalleCompra.findAll({
            where: { 'id_compra': id_compra },
            include: [
                { model: mProducto, as: 'Producto', attributes: ['nombre'] }
            ],
            raw: true
        });
        const listadoDetalleLimpia = listadoDetalle.map(detalles => {
            detalles.nombre_producto = detalles['Producto.nombre'];
            delete detalles['Producto.nombre'];
            return detalles;
        });

        return response.render('compra/detalle', { paramListadoDetalleCompra: listadoDetalleLimpia });
    
    }catch(error) {
        console.error("Error al mostrar detalle de compra:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar el detalle'}]);
        return response.redirect('/compra/lista');
    }
}

module.exports.mostrarPagos = async (request, response) => {
    try {
        const { id_compra } = request.params;
        let listadoCompra = await mCompra.findOne({
            where: { 'id_compra': id_compra },
            raw: true
        });
        if (!listadoCompra) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'La compra no existe'}]);
            return response.redirect('/compra/lista');
        }
        let listadoPagos = await mPagoProveedor.findAll({
            where: { 'id_compra': id_compra },
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

        return response.render('compra/pagos', { paramListadoPagosProveedores: listadoPagosLimpia, idCompra: id_compra, montoPendiente: listadoCompra.saldo_pendiente });
    
    }catch (error) {
        console.error("Error al mostrar pagos de compra: ", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la página'}]);
        return response.redirect('/compra/lista');
    }
}

module.exports.registrarPago = async (request, response) => {
    try{
        const { id_compra } = request.params;


        let datosCompra = await mCompra.findOne({
            where: { 'id_compra': id_compra },
            include: [
                { model: mProveedor, as: 'Proveedor', attributes: ['nombre'] }
            ],
            raw: true
        });

        if (!datosCompra) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Esa compra no existe'}]);
            return response.redirect('/compra/lista');
        }

        datosCompra.nombre_proveedor = datosCompra['Proveedor.nombre'];
        delete datosCompra['Proveedor.nombre'];

        return response.render('compra/registrarPago', { paramDatosCompra: datosCompra});
    
    }catch (error) {
        console.error("Error al mostrar formulario de registrar pago", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la página'}]);
        return response.redirect('/compra/pagos/' + request.params.id_compra);
    }
}

module.exports.registrarPagoPost = async (request, response) => {
    let { id_compra } = request.params;
    const errores = validationResult(request);
    if(!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/compra/pagos/registrar/' + id_compra);
    }

    try{
        const { monto, fecha, metodo_pago, observaciones } = request.body;
        let datosCompra = await mCompra.findOne({
            where: { "id_compra": id_compra },
            raw: true
        });

        let nuevo_saldo_pendiente = datosCompra.saldo_pendiente - monto;
        if (nuevo_saldo_pendiente < 0) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'No se pudo realizar el registro del Pago porque el monto a pagar es mayor al pendiente' }]);
            return response.redirect('/compra/pagos/registrar/' + id_compra);
        }
        let insertarPago = await mPagoProveedor.create({
            "id_compra": id_compra,
            "monto": monto,
            "fecha": fecha,
            "metodo_pago": metodo_pago,
            "observaciones": observaciones
        });
        if(insertarPago) {
            let actualizarCompra = await mCompra.update({
                'saldo_pendiente': nuevo_saldo_pendiente
            }, { where: { 'id_compra': id_compra } });

            if (actualizarCompra) {
                request.flash('varEstiloMensaje', 'success');
                request.flash('varMensaje', [{ msg: 'Registro Exitoso.' }]);
                return response.redirect('/compra/pagos/' + id_compra);
            } else {
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{ msg: 'No se pudo actualizar el saldo pendiente de la compra' }]);
                
                return response.redirect('/compra/pagos/registrar/' + id_compra);
            }
        }else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'No se pudo realizar el registro del Pago' }]);

            return response.redirect('/compra/pagos/registrar/' + id_compra);
        }
    }catch (error) {
        console.error("Error al registrar el pago de proveedor:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{ msg: 'Error al registrar el pago' }]);
        return response.redirect('/compra/pagos/registrar/' + id_compra);
    }
}

module.exports.listadoProductos = async (request, response) => {
    try {
        const productos = await mProducto.findAll({
            attributes: ['id_producto', 'nombre']
        });

        response.json({ ok: true, productos });
    } catch (error) {
        response.json({ ok: false, msg: "Error obteniendo productos" });
    }
}