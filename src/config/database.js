const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const con_sequelize = new Sequelize('gestion_almacen', 'root', '',{
    host: 'localhost',
    dialect: 'mysql',
    port: '3306',
    logging: false,
    define: { timestamps: false},
    pool : {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

async function conectar(){
    const connection = await mysql.createConnection({host: 'localhost', user: 'root', password: ''});
    await connection.query(
        "CREATE DATABASE IF NOT EXISTS gestion_almacen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    );
    await connection.end();
}

module.exports = {con_sequelize, conectar};