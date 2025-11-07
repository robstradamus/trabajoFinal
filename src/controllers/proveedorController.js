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

    try{
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
                request.flash('varMensaje', [{msg: 'Registro exitoso'}])
                return response.redirect('/proveedor/listado')
            } else {
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{msg: 'Error en el registro'}])
                return response.redirect('/proveedor/registrar')
            }
        }
    }catch(error) {
        console.error("Error al registrar proveedor:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al registrar el proveedor'}]);

        return response.redirect('/proveedor/registrar');
    }
}

module.exports.mostrarListado = async (request, response) => {
    try{
        let listadoProveedor = await mProveedor.findAll({
            raw: true
        });
        return response.render('proveedor/listado', {paramListadoProveedores: listadoProveedor});
    
    }catch(error) {
        console.error("Error al mostrar listado de proveedores:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar el listado de proveedores'}]);
        return response.redirect('/dashboard');
    }
}

module.exports.eliminar = async (request, response) => {
    try {
        const {id_proveedor} = request.params;
        let eliminar = await mProveedor.destroy({
            where: {'id_proveedor': id_proveedor}
        });

        if (eliminar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Eliminación exitosa'}]);
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Fallo en la eliminación, no se encontró el proveedor'}]);
        }
        return response.redirect('/proveedor/listado');

    } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error: No se pudo eliminar'}]);
        return response.redirect('/proveedor/listado');
    }
}

module.exports.mostrarModificar = async (request, response) => {
    try {
        const {id_proveedor} = request.params;
        let infoProveedor = await mProveedor.findOne({
            where: {'id_proveedor': id_proveedor},
            raw: true
        });
        if (infoProveedor) {
            return response.render('proveedor/modificar.hbs', {paramProveedor: infoProveedor});
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'No se encontró el proveedor a modificar'}]);

            return response.redirect('/proveedor/listado');
        }

    } catch (error) {
        console.error("Error al buscar proveedor para modificar:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la pagina'}]);

        return response.redirect('/proveedor/listado');
    }
}
module.exports.modificar = async (request, response) => {
    const {id_proveedor} = request.params;
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/proveedor/modificar/' + id_proveedor);
    }

    try{
        const {nombre, tipoRubro, numTel, tipoProducto, observaciones} = request.body;
        let numeroTel_exist = await mProveedor.findOne({

            where: {
                'num_tel': numTel.trim(),
                'id_proveedor': { [Op.ne]: id_proveedor } 
            },
            raw: true
        });

        if (numeroTel_exist) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Numero ya existente'}]);
            return response.redirect('/proveedor/modificar/' + id_proveedor);
        }else {
            let modificar = await mProveedor.update({
                'nombre': nombre,
                'tipo_rubro': tipoRubro,
                'num_tel': numTel,
                'tipo_producto': tipoProducto,
                'observaciones': observaciones
            }, {where: {'id_proveedor': id_proveedor}});

            if (modificar) {
                request.flash('varEstiloMensaje', 'success');
                request.flash('varMensaje', [{msg: 'Modificación Exitosa'}]);

                return response.redirect('/proveedor/listado');
            } else{
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{msg: 'Fallo en la actualización, verifique...'}]);
                return response.redirect('/proveedor/modificar/' + id_proveedor);
            }
        }
    }catch(error) {
        console.error("Error al modificar proveedor:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al actualizar el proveedor.'}]);
        
        return response.redirect('/proveedor/modificar/' + id_proveedor);
    }
}