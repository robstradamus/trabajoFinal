const Sequelize = require('sequelize');
const db = require('../database');

const producto = db.con_sequelize.define('producto', {
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
        type: Sequelize.INTEGER,
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
});

module.exports = producto;
