const Sequelize = require('sequelize');
const db = require('../database');

const detalleCompra = db.con_sequelize.define('detalleCompra', {
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
});

module.exports = detalleCompra;
