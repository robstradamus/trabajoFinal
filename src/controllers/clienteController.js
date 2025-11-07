const { validationResult } = require('express-validator');
const mCliente = require('../config/models/cliente');

module.exports.listado = async (request, response) => {
    let listadoCategoria = await mCliente.findAll(
        {
            raw: true
        }
    );
    return response.render('cliente/listado', {paramCliente : listadoCategoria});
};

module.exports.cliente = (request, response) => {
    return response.render('cliente/registrar');
};

module.exports.registrar = async (request, response) => {
    const errores = validationResult(request);
    if(!errores.isEmpty()){
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/cliente/listado');
    }
    const {nombre, dni, telefono, observaciones}= request.body;
    let cliente_existe = await mCliente.findOne(
        {
            where:{'dni': dni},
            raw:true
        }
    );
    if(cliente_existe){
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'El DNI ya esta registrado'}]);
        return response.redirect('/cliente/listado');
    }
    else{
    let insertar = await mCliente.create(
        {
            'nombre': nombre,
            'dni': dni,
            'telefono': telefono,
            'observaciones': observaciones
        }
    );
    if(insertar){
        request.flash('varEstiloMensaje', 'succes');
        request.flash('varMensaje', [{msg: 'Cliente registrado con exito'}]);
        return response.redirect('/cliente/listado');
    }
    else{
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al registrar el cliente'}]);
        return response.redirect('/cliente/listado');
    }
    }
};

module.exports.eliminar = async (request, response) => {
    const {id_cliente} = request.params;
    let eliminar = await mCliente.destroy(
        {
            where:{'id_cliente':id_cliente},
            raw:true
        }
    );
    if(eliminar){
        request.flash('varEstiloMensaje', 'succes');
        request.flash('varMensaje', [{msg: 'Cliente eliminado con exito'}]);
        return response.redirect('/cliente/listado');
    }
    else{
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al eliminar el cliente'}]);
        return response.redirect('/cliente/listado');
    }
};

module.exports.modificar = async (request, response) => {
    const {id_cliente}=request.params;
    let infoCliente = await mCliente.findOne(
        {
            where:{'id_cliente': id_cliente},
            raw:true
        }
    );
    return response.render('cliente/modificar', {paramCliente : infoCliente});
};

module.exports.modificar_post = async (request, response) => {
    const {id_cliente} = request.params;
    const errores = validationResult(request);
    
    if(!errores.isEmpty()){
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/cliente/listado');
    }
    
    const {nombre, dni, telefono, observaciones} = request.body;
    let modificar = await mCliente.update(
            {
                'nombre': nombre,
                'dni': dni,
                'telefono': telefono,
                'observaciones': observaciones
            },
            {
                where: {'id_cliente': id_cliente}
            }
        );
        
        if(modificar){
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Cliente modificado con éxito'}]);
            return response.redirect('/cliente/listado');
        }
        else{
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Error al modificar el cliente'}]);
            return response.redirect('/cliente/listado');
        }
};