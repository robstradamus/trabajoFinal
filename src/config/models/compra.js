const Sequelize = require('sequelize');
const db = require('../database');

const compra = db.con_sequelize.define('compra', {
    id_compra: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_proveedor: {
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

module.exports = compra;
