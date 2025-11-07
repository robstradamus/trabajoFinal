const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
    id_detalle_compra: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_compra: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    id_producto: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    cantidad: {
        type: Sequelize.INTEGER
    },
    precio_unitario: {
        type: Sequelize.FLOAT
    },
    subTotal: {
        type: Sequelize.FLOAT
    }
};

const opciones = {
    tableName: 'detalleCompras',
    timestamps: false
};

const detalleCompra = db.con_sequelize.define('detalleCompra', atributos, opciones);

module.exports = detalleCompra;