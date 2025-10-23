const Sequelize = require('sequelize');
const db = require('../database');

const gasto = db.con_sequelize.define('gasto', {
    id_gasto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.STRING(100)
    },
    monto: {
        type: Sequelize.FLOAT
    },
    fecha: {
        type: Sequelize.DATEONLY
    },
    tipoGasto: {
        type: Sequelize.STRING(50)
    }
});

module.exports = gasto;
