const {Op, Sequelize, Model} = require('sequelize');
const Venta = require('../config/models/venta');
const Cliente = require('../config/models/cliente');
const Producto = require('../config/models/producto');
const DetalleVenta = require('../config/models/detalleVenta');


//Definir rango de Dia
const rangoDia = () => {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const d = hoy.getDate().toString().padStart(2, '0');
    
    const fechaHoyString = `${y}-${m}-${d}`;

    const inicioDia = `${fechaHoyString} 00:00:00`;
    const finDia = `${fechaHoyString} 23:59:59`;

    return { inicioDia, finDia };
};

const dashboard = async (request, response) => {
    const { inicioDia, finDia} = rangoDia();

    //Hacemos el calculo del Total por Dia
    const totalDia = Venta.sum('total',{
        where:{
            fecha: {[Op.between]:[inicioDia, finDia]}
        }
    });
    //Hacemos el calculo de Total por Sector: Alamcen y Carniceria
    const totalSector = DetalleVenta.findAll({
        attributes: [
            [Sequelize.col('Producto.tipoProducto'), 'sector'],
            [Sequelize.fn('SUM', Sequelize.col('subtotal')),'totalPorSector']
        ],
        include:[
            {
                model: Venta,
                as: 'Venta',
                attributes: [],
                where:{
                    fecha: {[Op.between]:[inicioDia, finDia]}
                }
            },
            {
                model: Producto,
                as: 'Producto',
                attributes:[]

            }
        ],
        group: ['Producto.tipoProducto'],
        raw: true
    });

    //Registro de las ultimas 10 ventas
    const ultimasVentas = Venta.findAll({
        where: { fecha: { [Op.between]: [inicioDia, finDia] }},
        limit:10,
        order:[['fecha', 'DESC']],
        include:[
            {model: Cliente, as:'Cliente', attributes:['nombre'], required:false}]
    });

    //Productos con bajo stock
    const bajoStock = Producto.findAll({
        where: {stock:{[Op.lt]: 10}},
        limit: 3,
        order: [['stock','ASC']]
    });

    const [totalxDia, totalxSector, ultimasxVentas, bajoxStock ] = await Promise.all([totalDia, totalSector, ultimasVentas, bajoStock]);
    //Formatear los totales
    const totalesPorSector = {almacen: 0, carniceria: 0};
    for(const item of totalxSector){
        if(item.sector.toLowerCase() === 'almacen'){
            totalesPorSector.almacen = item.totalPorSector;
        }else if(item.sector.toLowerCase() === 'carniceria'){
            totalesPorSector.carniceria = item.totalPorSector;
        }
    };

    //Renderizar vista 
    return response.render('dashboard', {
        totalDia: totalxDia || 0, 
        totalesPorSector: totalesPorSector,
        ultimasVentas: ultimasxVentas,
        bajoStock: bajoxStock
    });
};

module.exports = {dashboard};