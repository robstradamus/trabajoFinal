const { validationResult } = require('express-validator');
const mCliente = require('../config/models/cliente');
const mVenta = require('../config/models/venta');
const { Op } = require('sequelize');

module.exports.listado = async (request, response) => {
    try {
        let listadoCategoria = await mCliente.findAll({
            raw: true
        });
        return response.render('cliente/listado', { paramCliente: listadoCategoria });
    
    } catch (error) {
        console.error("Error al mostrar el listado de clientes:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar el listado de clientes.'}]);
        return response.redirect('/dashboard');
    }
};

module.exports.cliente = (request, response) => {
    return response.render('cliente/registrar');
};

module.exports.registrar = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/cliente/registrar'); 
    }
    try {
        const {nombre, dni, telefono, observaciones} = request.body;
        
        let cliente_existe = await mCliente.findOne({
            where: { 'dni': dni },
            raw: true
        });
        if (cliente_existe) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'El DNI ya esta registrado' }]);
            return response.redirect('/cliente/registrar');
        } else {
            let insertar = await mCliente.create({
                'nombre': nombre,
                'dni': dni,
                'telefono': telefono,
                'observaciones': observaciones
            });
            if (insertar) {
                request.flash('varEstiloMensaje', 'success'); 
                request.flash('varMensaje', [{ msg: 'Cliente registrado con exito' }]);
                return response.redirect('/cliente/listado');
            } else {
                request.flash('varEstiloMensaje', 'danger');
                request.flash('varMensaje', [{ msg: 'Error al registrar el cliente' }]);
                return response.redirect('/cliente/registrar');
            }
        }
    }catch(error) {
        console.error("Error al registrar el cliente:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Ocurrió un error al registrar.'}]);
        return response.redirect('/cliente/registrar');
    }
};

module.exports.eliminar = async (request, response) => {

    try{
        const {id_cliente} = request.params;

        const saldoPendientes = await mVenta.findOne({
            where: {
                'id_cliente': id_cliente,
                'saldo_pendiente': {[Op.gt]: 0}
            },
            raw: true
        });

        if (saldoPendientes) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'No se pudo eliminar el cliente. El cliente adeuda en su cuenta corriente.' }]);
            return response.redirect('/cliente/listado');
        }


        let eliminar = await mCliente.destroy({
            where: { 'id_cliente': id_cliente },
            raw: true
        });

        if (eliminar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{ msg: 'Cliente eliminado con exito' }]);
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error al eliminar el cliente' }]);
        }
        return response.redirect('/cliente/listado');

    }catch(error) {
        console.error("Error al eliminar el cliente:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error: No se pudo eliminar el cliente'}]);
        return response.redirect('/cliente/listado');
    }
};

module.exports.modificar = async (request, response) => {
    try{
        const { id_cliente } = request.params;
        let infoCliente = await mCliente.findOne({
            where: { 'id_cliente': id_cliente },
            raw: true
        });        
        if (infoCliente) {
            return response.render('cliente/modificar', { paramCliente: infoCliente });
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'No se encontro el cliente a modificar.'}]);
            return response.redirect('/cliente/listado');
        }
    }catch(error) {
        console.error("Error al buscar cliente para modificar:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la pagina'}]);
        return response.redirect('/cliente/listado');
    }
};

module.exports.modificar_post = async (request, response) => {
    const { id_cliente } = request.params;
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/cliente/modificar/' + id_cliente); 
    }

    try {
        const {nombre, dni, telefono, observaciones} = request.body;

        let dni_existe = await mCliente.findOne({
            where: {
                dni: dni,
                id_cliente: { [Op.ne]: id_cliente }
            },
            raw: true
        });

        if (dni_existe) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Ese DNI ya está en uso por otro cliente.'}]);
            return response.redirect('/cliente/modificar/' + id_cliente);
        }

        let modificar = await mCliente.update(
            {
                'nombre': nombre,
                'dni': dni,
                'telefono': telefono,
                'observaciones': observaciones
            },{
                where: { 'id_cliente': id_cliente } 
            }
        );

        if (modificar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{ msg: 'Cliente modificado con éxito' }]);
            return response.redirect('/cliente/listado');
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error al modificar el cliente' }]);
            return response.redirect('/cliente/modificar/' + id_cliente);
        }
    } catch (error) {
        console.error("Error al modificar el cliente:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al procesar la modificación.'}]);
        return response.redirect('/cliente/modificar/' + id_cliente);
    }
};