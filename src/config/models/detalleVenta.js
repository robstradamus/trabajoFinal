const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
    id_detalleVenta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_producto: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    id_venta: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    cantidad: {
        type: Sequelize.FLOAT
    },
    precio_unitario: {
        type: Sequelize.FLOAT
    },
    subtotal: { 
        type: Sequelize.FLOAT
    }
};

const opciones = {
    tableName: 'detalleVenta',
    timestamps: false
};

const detalleVenta = db.con_sequelize.define('detalleVenta', atributos, opciones);

module.exports = detalleVenta;