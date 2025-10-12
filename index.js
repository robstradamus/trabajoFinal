const app = require('./src/app');
const { con_sequelize, conectar } = require('./src/config/database');

//Conexion al servido y base de datos
(async () => {
    try {
        await conectar();
        await con_sequelize.sync({ force: false });
        console.log('Conexión a la base de datos establecida');
        
        app.listen(process.env.PORT, () => {
            console.log('Servidor corriendo en http://localhost:' + process.env.PORT);
        });
    } catch (error) {
        console.log('No se pudo conectar a la base de datos: ' + error);
        process.exit(1);
    }
})();