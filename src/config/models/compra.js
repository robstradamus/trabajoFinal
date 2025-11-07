const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
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
};

const opciones = {
    tableName: 'compras', 
    timestamps: false
};

const compra = db.con_sequelize.define('compra', atributos, opciones);

module.exports = compra;