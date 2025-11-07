const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
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
        type: Sequelize.STRING(10) 
    },
    observaciones: {
        type: Sequelize.STRING(100)
    }
};

const opciones = {
    tableName: 'clientes',
    timestamps: false
};

const cliente = db.con_sequelize.define('cliente', atributos, opciones);

module.exports = cliente;