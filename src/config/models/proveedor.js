const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
    id_proveedor: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: Sequelize.STRING(50)
    },
    tipo_rubro: {
        type: Sequelize.STRING(50)
    },
    num_tel: {
        type: Sequelize.STRING(50)
    },
    tipo_producto: {
        type: Sequelize.STRING(50)
    },
    observaciones: {
        type: Sequelize.STRING(100)
    }
};


const opciones = {
    tableName: 'proveedors',
    timestamps: false
};

const proveedor = db.con_sequelize.define('proveedor', atributos, opciones);

module.exports = proveedor;