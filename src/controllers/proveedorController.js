const { validationResult } = require("express-validator");
const mProveedor = require('../config/models/proveedor');
const {Op} = require('sequelize');

module.exports.mostrarRegistrar = (request, response) => {
    return response.render('proveedor/registrar');
}

module.exports.registrarPost = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/proveedor/registrar');
    }

    const {nombre, tipoRubro, numTel, tipoProducto, observaciones} = request.body;
    let numeroTel_exist = await mProveedor.findOne({
        where: {'num_tel': numTel.trim()},
        raw: true
    });

    if (numeroTel_exist) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Numero de Telefono ya existe.'}]);
        return response.redirect('/proveedor/registrar');
    } else {
        let insertar = await mProveedor.create({
            'nombre': nombre,
            'tipo_rubro': tipoRubro,
            'num_tel': numTel,
            'tipo_producto': tipoProducto,
            'observaciones': observaciones
        });

        if (insertar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Registro exitoso.'}])
            return response.redirect('/proveedor/listado')
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Error en el registro.'}])
            return response.redirect('/proveedor/registrar')
        }
    }
}

module.exports.mostrarListado = async (request, response) => {
    let listadoProveedor = await mProveedor.findAll({
        raw: true
    });
    return response.render('proveedor/listado', {paramListadoProveedores: listadoProveedor});
}

module.exports.eliminar = async (request, response) => {
    const {id_proveedor} = request.params;
    let eliminar = await mProveedor.destroy({
        where: {'id_proveedor': id_proveedor},
        raw: true
    });

    if (eliminar) {
        request.flash('varEstiloMensaje', 'success');
        request.flash('varMensaje', [{msg: 'Eliminación exitosa.'}]);
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Fallo en la eliminación, verifique...'}]);
    }

    return response.redirect('/proveedor/listado');
}

module.exports.mostrarModificar = async (request, response) => {
    const {id_proveedor} = request.params;
    let infoProveedor = await mProveedor.findOne({
        where: {'id_proveedor': id_proveedor},
        raw: true
    });
    return response.render('proveedor/modificar.hbs', {paramProveedor: infoProveedor});
}

module.exports.modificar = async (request, response) => {
    const {id_proveedor} = request.params;

    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/proveedor/modificar/' + id_proveedor);
    }

    const {nombre, tipoRubro, numTel, tipoProducto, observaciones} = request.body;
    let numeroTel_exist = await mProveedor.findOne({
        where: {[Op.and]: [
            {'id_proveedor': id_proveedor},
            {'num_tel': {[Op.ne]: numTel}}
        ]},
        raw: true
    });

    if (numeroTel_exist) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Numero ya existente.'}]);
        return response.redirect('/proveedor/modificar/' + id_proveedor);
    } else {
        let modificar = await mProveedor.update({
            'nombre': nombre,
            'tipo_rubro': tipoRubro,
            'num_tel': numTel,
            'tipo_producto': tipoProducto,
            'observaciones': observaciones
        }, {where: {'id_proveedor': id_proveedor}});

        if (modificar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Modificación Exitosa.'}]);
            return response.redirect('/proveedor/listado');
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Fallo en la actualización, verifique...'}]);
            return response.redirect('/proveedor/modificar/' + id_proveedor);
        }
    }
}