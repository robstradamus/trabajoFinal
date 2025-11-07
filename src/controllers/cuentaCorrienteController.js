const {Op, fn, col} = require('sequelize');
const mVenta = require('../config/models/venta');
const mCliente = require('../config/models/cliente');

module.exports.listado = async (request, response) => {
    try{
        const listadoCuentaCorriente = await mCliente.findAll({
            attributes: [
                'id_cliente',
                'nombre',
                'dni',
                'telefono',
                [fn('SUM', col('Ventas.saldo_pendiente')), 'saldo_pendiente']
            ],
            include: [{
                model: mVenta,
                as: 'Ventas',
                attributes: []
            }],
            where: {
                '$Ventas.saldo_pendiente$': { [Op.gt]: 1 }
            },
            group: ['id_cliente'],
            raw: true
        });

        // console.log(listadoCuentaCorriente); // Tu console.log
        return response.render('cuentas-corrientes/listado', {paramListadoCuentaCorriente: listadoCuentaCorriente});

    } catch (error) {
        console.error("Error al cargar el listado de Cuentas Corrientes:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar las cuentas corrientes'}]);
        return response.redirect('/dashboard'); 
    }
}
