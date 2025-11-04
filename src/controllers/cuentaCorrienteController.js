const {Op, fn, col} = require('sequelize');
const { validationResult } = require('express-validator');
const mDetalleVenta = require('../config/models/detalleVenta');
const mVenta = require('../config/models/venta');
const mCliente = require('../config/models/cliente');

module.exports.listado = async (request, response) => {
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

    console.log(listadoCuentaCorriente);
    return response.render('cuentas-corrientes/listado', {paramListadoCuentaCorriente: listadoCuentaCorriente});
}