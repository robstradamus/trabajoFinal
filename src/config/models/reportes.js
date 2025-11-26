const Sequelize = require('sequelize');
const db = require('../database');

const atributos = {
    id_reporte: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_archivo: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    fecha_reporte: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    total_ventas: {
        type: Sequelize.DECIMAL(10,2),
        defaultValue: 0
    },
    total_gastos: {
        type: Sequelize.DECIMAL(10,2),
        defaultValue: 0
    },
    balance: {
        type: Sequelize.DECIMAL(10,2),
        defaultValue: 0
    },
    ruta_archivo: {
        type: Sequelize.STRING(500)
    },
    fecha_generacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
};
const opciones = { tableName: 'reportes_generados', timestamps: false };
const ReporteGenerado = db.con_sequelize.define('ReporteGenerado', atributos, opciones);
module.exports = ReporteGenerado;