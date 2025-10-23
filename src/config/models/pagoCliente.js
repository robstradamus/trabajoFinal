const Sequelize = require('sequelize');
const db = require('../database');

const pagoCliente = db.con_sequelize.define('pagoCliente', {
    id_pagoCliente: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_cliente: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    id_venta: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    monto_pago: {
        type: Sequelize.FLOAT
    },
    fecha: {
        type: Sequelize.DATEONLY
    },
    metodo_pago: {
        type: Sequelize.STRING(50)
    },
    observaciones: {
        type: Sequelize.STRING(50)
    }
});

module.exports = pagoCliente;
