const mGasto = require('../config/models/gasto');

//ACA EL CONTROLADOR DE GASTO - LISTADO Y REGISTRAR EN PRUEBA

module.exports.mostrarFormularioRegistro = (request, response) => {
    return response.render('gasto/registrar'); //Comentar, eliminar o midificar este modulo.
};

module.exports.listado = async (request, response) => {
    return response.render('gasto/listado'); //Comentar, eliminar o midificar este modulo.
}

