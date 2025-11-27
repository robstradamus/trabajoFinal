const { Op, Sequelize } = require('sequelize'); 
const Venta = require('../config/models/venta');
const Cliente = require('../config/models/cliente');
const Producto = require('../config/models/producto');
const DetalleVenta = require('../config/models/detalleVenta');

//Definir rango de Dia
const rangoDia = () => {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);
    return {inicioDia, finDia};
};
const dashboard = async (request, response) => {
    
    try {
        const {inicioDia, finDia} = rangoDia(); 

        const filtroFecha = {
            fecha: {[Op.between]: [inicioDia, finDia] }
        };
        //Hacemos el calculo del Total por Dia
        const totalDia = Venta.sum('total', {
            where: filtroFecha 
        });

        //Hacemos el calculo de Total por Sector
        const totalSector = DetalleVenta.findAll({
            attributes: [
                [Sequelize.col('Producto.tipoProducto'), 'sector'],
                [Sequelize.fn('SUM', Sequelize.col('subtotal')), 'totalPorSector']
            ],
            include: [
                {
                    model: Venta,
                    as: 'Venta',
                    attributes: [],
                    where: filtroFecha 
                },
                {
                    model: Producto,
                    as: 'Producto',
                    attributes: []
                }
            ],
            group: ['Producto.tipoProducto'],
            raw: true
        });

        //Registro de las ultimas 10 ventas
        const ultimasVentas = Venta.findAll({
            where: filtroFecha,
            limit: 10,
            order: [['fecha', 'DESC']],
            include: [
                { model: Cliente, as: 'Cliente', attributes: ['nombre'], required: false }
            ],
            raw: true,  
            nest: true
        });

        //Productos con bajo stock
        const bajoStock = Producto.findAll({
            where: { stock: { [Op.gt]: 0, [Op.lt]: 10}},
            limit: 10,
            order: [['stock', 'ASC']],
            raw: true 
        });
        const [totalxDia, totalxSector, ultimasxVentas, bajoxStock] = await Promise.all([totalDia, totalSector, ultimasVentas, bajoStock]);
        
        const totalesPorSector = { almacen: 0, carniceria: 0 };
        for (const item of totalxSector) {
            if (item.sector === null) {
                continue;
            }
            if (item.sector.toLowerCase() === 'almacen') {
                totalesPorSector.almacen = item.totalPorSector;
            } else if (item.sector.toLowerCase() === 'carniceria') {
                totalesPorSector.carniceria = item.totalPorSector;
            }
        };
        return response.render('dashboard', {
            showSidebar: true,
            title: 'Dashboard',
            totalDia: totalxDia || 0,
            totalesPorSector: totalesPorSector,
            ultimasVentas: ultimasxVentas,
            bajoStock: bajoxStock
        });

    } catch (error) {
        console.error("Error al cargar el dashboard", error);
    }
};

module.exports = {dashboard};