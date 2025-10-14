const Sequelize = require('sequelize');
const db = require('../database');

const pagoProveedor = db.con_sequelize.define('pagoProveedor', {
    id_pagoProveedor: {
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
    monto: {
        type: Sequelize.FLOAT
    },
    fecha: {
        type: Sequelize.DATEONLY
    },
    metodo_pago: {
        type: Sequelize.STRING(50)
    },
    observaciones: {
        type: Sequelize.STRING(100)
    }
});

module.exports = pagoProveedor;
