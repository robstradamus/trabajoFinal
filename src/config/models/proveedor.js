const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
    id_producto: {
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
    nombre: {
        type: Sequelize.STRING(50)
    },
    tipoProducto: {
        type: Sequelize.STRING(50)
    },
    cod_barra: {
        type: Sequelize.STRING(50),
        unique: true
    },
    precio_unitario: {
        type: Sequelize.FLOAT
    },
    stock: {
        type: Sequelize.INTEGER
    },
    observacion: {
        type: Sequelize.STRING(100)
    }
};

const opciones = {
    tableName: 'productos',
    timestamps: false
};

const producto = db.con_sequelize.define('producto', atributos, opciones);

module.exports = producto;