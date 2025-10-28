const Sequelize = require('sequelize');
const db = require('../database');

const cliente = db.con_sequelize.define('cliente', {
    id_cliente: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: Sequelize.STRING(50)
    },
    dni: {
        type: Sequelize.INTEGER,
    },
    telefono: {
        type: Sequelize.INTEGER
    },
    observaciones: {
        type: Sequelize.STRING(100)
    }
});

module.exports = cliente;
