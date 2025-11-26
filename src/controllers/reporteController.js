const mVenta = require('../config/models/venta');
const mGasto = require('../config/models/gasto');
const mDetalleVenta = require('../config/models/detalleVenta');
const mReporteGenerado = require('../config/models/reportes');
const { Sequelize, Op } = require('sequelize');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

module.exports = {
    //Mostrar view de Reoporte a generar
    mostrarReporteDiario: async (request, response) => {
        try {
            const resultado = await mGasto.sequelize.query('SELECT CURDATE() as hoy', {type: Sequelize.QueryTypes.SELECT });
            const hoyBD = resultado[0].hoy;
            //GASTOS TOTALES
            const totalGastos = await mGasto.sum('monto', {where: { fecha: hoyBD }}) || 0;
            //VENTAS TOTALES 
            const totalVentas = await mVenta.sum('total', {where: { fecha: hoyBD }}) || 0;

            //VENTAS POR SECTOR TOTALES
            const ventasPorSector = await mDetalleVenta.sequelize.query(`
                SELECT p.tipoProducto as sector, SUM(dv.subTotal) as total_ventas
                FROM detalleVenta dv
                INNER JOIN productos p ON dv.id_producto = p.id_producto
                INNER JOIN venta v ON dv.id_venta = v.id_venta
                WHERE v.fecha = ?
                GROUP BY p.tipoProducto`, 
                { replacements: [hoyBD], type: Sequelize.QueryTypes.SELECT 
            });

            //BALANCE
            const balance = totalVentas - totalGastos;
            //DEUDAS DE CLIENTES
            const deudasClientes = await mVenta.sum('saldo_pendiente', {
                where: { saldo_pendiente: { [Op.gt]: 0 }}
            }) || 0;
            //Obtebner nombres por sector (Mapeado)
            const nombresSectores = {'Almacen': 'Almacén', 'Carniceria': 'Carnicería'};
            const ventasFormateadas = ventasPorSector.map(venta => ({
                sector: venta.sector,
                nombre: nombresSectores[venta.sector] || venta.sector,
                total: parseFloat(venta.total_ventas || 0).toFixed(2)
            }));
            //Fecha formateda
            const fechaDisplay = new Date(hoyBD).toLocaleDateString('es-AR');
            
            response.render('reportes/reportes', {
                fecha: fechaDisplay,
                // Ventas
                totalVentas: totalVentas.toFixed(2),
                ventasPorSector: ventasFormateadas,
                // Gastos y Balance
                totalGastos: totalGastos.toFixed(2),
                balance: balance.toFixed(2),
                deudasClientes: deudasClientes.toFixed(2)
            });
            
        } catch (error) {
            console.error('Error en reporte diario:', error);
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error al generar el reporte' }]);
            request.redirect('/dashboard'); //Redireeccion a dashboard
        }
    },
    //Generar PDF
    generarReportePDF: async (request, response) => {
    let browser;
    try {
        const resultado = await mGasto.sequelize.query('SELECT CURDATE() as hoy', {type: Sequelize.QueryTypes.SELECT});
        const fechaReporte = resultado[0].hoy;        
        //Obtener datos para el PDF
        const totalVentas = await mVenta.sum('total', {where: { fecha: fechaReporte }}) || 0;
        const totalGastos = await mGasto.sum('monto', {where: { fecha: fechaReporte }}) || 0;
        
        //Obtener ventas por sector
        const ventasPorSector = await mDetalleVenta.sequelize.query(`
            SELECT p.tipoProducto as sector, SUM(dv.subTotal) as total_ventas
            FROM detalleVenta dv
            INNER JOIN productos p ON dv.id_producto = p.id_producto
            INNER JOIN venta v ON dv.id_venta = v.id_venta
            WHERE v.fecha = ?
            GROUP BY p.tipoProducto`,
            {replacements: [fechaReporte], type: Sequelize.QueryTypes.SELECT
        });

        const nombresSectores = {'Almacen': 'Almacén', 'Carniceria': 'Carnicería'};
        const deudasClientes = await mVenta.sum('saldo_pendiente', { where: { saldo_pendiente: { [Op.gt]: 0 } }}) || 0;
        
        //Balance
        const balance = totalVentas - totalGastos;
        //Crear html para el PDF
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Reporte Diario</title>
            <style>
                body { 
                    font-family: 'Arial', sans-serif; 
                    margin: 0; 
                    padding: 25px; 
                    color: #333;
                    line-height: 1.4;
                    font-size: 12px;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 3px solid #2c5aa0; 
                    padding-bottom: 15px; 
                    margin-bottom: 25px; 
                }
                .header h1 { 
                    color: #2c5aa0; 
                    margin: 0 0 8px 0; 
                    font-size: 22px;
                }
                .header h3 { 
                    color: #666; 
                    margin: 0;
                    font-weight: normal;
                    font-size: 16px;
                }
                .section { 
                    margin-bottom: 20px; 
                }
                .section-title { 
                    background-color: #2c5aa0; 
                    color: white;
                    padding: 8px 15px; 
                    font-weight: bold; 
                    margin-bottom: 12px;
                    font-size: 14px;
                    border-radius: 4px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 8px; 
                    font-size: 11px;
                }
                th, td { 
                    padding: 8px 10px; 
                    text-align: left; 
                    border-bottom: 1px solid #ddd; 
                }
                th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                }
                .positive { color: #28a745; font-weight: bold; }
                .negative { color: #dc3545; font-weight: bold; }
                .total-row { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                    font-size: 13px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #ddd;
                    text-align: center;
                    color: #666;
                    font-size: 10px;
                }
                .valor {
                    text-align: right;
                    font-family: 'Courier New', monospace;
                }
                .sector-item {
                    padding-left: 15px;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>REPORTES - SISTEMA DE GESTION DE VENTAS Y STOCK</h1>
                <h3>Fecha: ${fechaReporte}</h3>
            </div>
            <div class="section">
                <div class="section-title">VENTAS POR SECTOR</div>
                <table>
                    ${ventasPorSector.map(venta => `
                    <tr>
                        <td width="70%" class="sector-item">${nombresSectores[venta.sector] || venta.sector}:</td>
                        <td width="30%" class="valor">$ ${parseFloat(venta.total_ventas || 0).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td>TOTAL VENTAS:</td>
                        <td class="valor">$ ${totalVentas.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            <div class="section">
                <div class="section-title">RESUMEN</div>
                <table>
                    <tr>
                        <td width="70%">Ventas Totales:</td>
                        <td width="30%" class="valor">$ ${totalVentas.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Gastos Totales:</td>
                        <td class="valor">$ ${totalGastos.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Balance:</td>
                        <td class="valor ${balance >= 0 ? 'positive' : 'negative'}">
                            $ ${balance.toFixed(2)}
                        </td>
                    </tr>
                </table>
            </div>
            <div class="section">
                <div class="section-title">SALDOS PENDIENTES (CUENTA CORRIENTE)</div>
                <table>
                    <tr>
                        <td width="70%">Total en Cuentas Corrientes por Cobrar:</td>
                        <td width="30%" class="valor">$ ${deudasClientes.toFixed(2)}</td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                <p>${new Date().toLocaleString('es-AR')} - Sistema de Gestion de Ventas y Stock</p>
            </div>
        </body>
        </html>
        `;

        //Configuracion de puppeteer
        browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        //Generar PDF
        const pdfBuffer = await page.pdf({
            format: 'A4', //tamaño
            printBackground: true, //colres de fondo
            margin: { //margenes del documento 
                top: '15mm',
                right: '10mm',
                bottom: '15mm',
                left: '10mm'
            }
        });
        await browser.close();
        //Guarda el historial en la base de datos
        try {
            //Crea el directorio si no existe
            const backupDir = path.join(__dirname, '../../backups/reportes');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            //Guarda el PDF en el sistema de archivos
            const nombreArchivo = `reporte_${fechaReporte}.pdf`;
            const rutaArchivo = path.join(backupDir, nombreArchivo);
            fs.writeFileSync(rutaArchivo, pdfBuffer);
            //Guarda la metadata en la base de datos
            await mReporteGenerado.create({
                nombre_archivo: nombreArchivo,
                fecha_reporte: fechaReporte,
                total_ventas: totalVentas,
                total_gastos: totalGastos,
                balance: balance,
                ruta_archivo: rutaArchivo
            });            
        } catch (error) {
            console.error('Error guardando en historial:', error);
        }
        
        //Descarga el pdf
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename=reporte_${fechaReporte}.pdf`);
        response.send(pdfBuffer);

    } catch (error) {
        if (browser) {
            await browser.close();
        }
        console.error('Error al generar PDF:', error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{ msg: 'Error al generar el PDF' }]);
        response.redirect('/reportes/diario');
    }
    },
    mostrarHistorial: async (request, response) => {
        try {
            const reportes = await mReporteGenerado.findAll({
                order: [['fecha_reporte', 'DESC']],
                raw: true
            });            
            response.render('reportes/historial', { 
                reportes: reportes,
                hayReportes: reportes.length > 0
            });
            
        } catch (error) {
            console.error('Error al cargar historial de reportes:', error);
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error al cargar el historial de reportes' }]);
            response.redirect('/reportes/diario');
        }
    },
    descargarReporte: async (request, response) => {
        try {
            const { id } = request.params;

            //Busca el reporte en la base de datos
            const reporte = await mReporteGenerado.findOne({where: { id_reporte: id },raw: true});

            if (!reporte) {
                console.log('Reporte no encontrado');
                request.flash('varEstiloMensaje', 'warning');
                request.flash('varMensaje', [{ msg: 'Reporte no encontrado' }]);
                return response.redirect('/reportes/historial');
            }            
            //Verificar que el archivo exista
            if (!fs.existsSync(reporte.ruta_archivo)) {
                console.log('Archivo PDF no encontrado en:', reporte.ruta_archivo);
                request.flash('varEstiloMensaje', 'warning');
                request.flash('varMensaje', [{ msg: 'El archivo PDF no se encuentra disponible' }]);
                return response.redirect('/reportes/historial');
            }
            
            //Enviar archivo como descarga
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename="${reporte.nombre_archivo}"`);
            const fileStream = fs.createReadStream(reporte.ruta_archivo);
            fileStream.pipe(response);
        } catch (error) {
            console.error('Error al descargar reporte:', error);
            req.flash('varEstiloMensaje', 'danger');
            req.flash('varMensaje', [{ msg: 'Error al descargar el reporte' }]);
            res.redirect('/reportes/historial');
        }
    }
};