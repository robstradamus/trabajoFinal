const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
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
};

const opciones = {
    tableName: 'venta', 
    timestamps: false
};

const venta = db.con_sequelize.define('venta', atributos, opciones);

module.exports = venta;