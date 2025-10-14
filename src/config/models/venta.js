const Sequelize = require('sequelize');
const db = require('../database');

const venta = db.con_sequelize.define('venta', {
    id_venta: {
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
    fecha: {
        type: Sequelize.DATEONLY
    },
    total: {
        type: Sequelize.FLOAT
    },
    saldo_pendiente: {
        type: Sequelize.FLOAT
    }
});

module.exports = venta;
