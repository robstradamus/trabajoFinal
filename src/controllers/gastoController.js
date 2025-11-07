const mGasto = require('../config/models/gasto');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

module.exports.mostrarFormularioRegistro = (request, response) => {
    const fechaActualObjeto = new Date();
    const anio = fechaActualObjeto.getFullYear();
    const mes = String(fechaActualObjeto.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActualObjeto.getDate()).padStart(2, '0');
    const fechaFormateada = `${anio}-${mes}-${dia}`;
    
    return response.render('gasto/registrar', {fechaactual: fechaFormateada});
};

module.exports.listado = async (request, response) => {
    const {busqueda, tipoGasto} = request.query;
    const condiciones = {};
    if(tipoGasto && tipoGasto !== '') { 
        condiciones.tipoGasto = tipoGasto; 
    }
    if (busqueda) {
        condiciones.descripcion = {
            [Op.like]: `%${busqueda}%` 
        };
    }
    try{
        const datosGasto = await mGasto.findAll({
            where: condiciones, 
            raw: true
        });

        return response.render('gasto/listado', {
            paramGasto: datosGasto,
            filtros: { busqueda, tipoGasto } 
        });
        
    }catch (error) {
        console.error("Error al buscar gastos", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar el listado de gastos.'}]);
        return response.redirect('/dashboard');
    }
};

module.exports.registro = async (request, response) => {
    const errores = validationResult(request);
        if (!errores.isEmpty()) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', errores.array());

            return response.redirect('/gasto/registrar');
        }
    try{
        const {fecha, tipoGasto, descripcion, monto} = request.body;
        let insertar = await mGasto.create(
            {
                'fecha':fecha,
                'tipoGasto':tipoGasto,
                'descripcion':descripcion,
                'monto':monto
            }
        )
        if(insertar){
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{msg: 'Gasto registrado con exito'}]);
            return response.redirect('/gasto/listado');
        }
        else{
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Error al registrar el gasto'}]);
            return response.redirect('/gasto/registrar');
        }
    }catch(error) {
        console.error("Error al registrar el gasto:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Ocurrió un error interno al guardar el gasto'}]);
        
        return response.redirect('/gasto/registrar');
    }
};