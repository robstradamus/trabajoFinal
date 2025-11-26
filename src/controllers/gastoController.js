const mGasto = require('../config/models/gasto');
const { validationResult } = require('express-validator');
const { Sequelize, Op } = require('sequelize');

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
    
    try {
        const { fecha, tipoGasto, descripcion, monto } = request.body;
        
        // ✅ SOLUCIÓN DEFINITIVA: INSERT DIRECTAMENTE CON CURDATE()
        await mGasto.sequelize.query(`
            INSERT INTO gastos (descripcion, monto, fecha, tipoGasto) 
            VALUES (?, ?, CURDATE(), ?)
        `, {
            replacements: [descripcion, monto, tipoGasto],
            type: Sequelize.QueryTypes.INSERT
        });
        
        console.log('✅ Gasto insertado con CURDATE()');
        
        request.flash('varEstiloMensaje', 'success');
        request.flash('varMensaje', [{msg: 'Gasto registrado con éxito'}]);
        return response.redirect('/gasto/listado');
        
    } catch(error) {
        console.error("Error al registrar el gasto:", error);
        request.flash('varEstiloMensaje', 'danger');
        req.flash('varMensaje', [{msg: 'Ocurrió un error interno al guardar el gasto'}]);
        return response.redirect('/gasto/registrar');
    }
};