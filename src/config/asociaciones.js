const mProducto = require('./models/producto');
const mProveedor = require('./models/proveedor');
const mCompra = require('./models/compra');
const mDetalleCompra = require('./models/detalleCompra');
const mPagoProveedor = require('./models/pagoProveedor');
const mCliente = require('./models/cliente');
const mVenta = require('./models/venta');
const mDetalleVenta = require('./models/detalleVenta');
const mPagoCliente = require('./models/pagoCliente');

//                  Relacion PROVEEDOR - PRODUCTO
//Un proveedor puede tener muchos productos
mProveedor.hasMany(mProducto,{
    foreignKey: 'id_proveedor',
    as: 'rel_proveedor_producto'
});

//Un producto pertenece a un proveedor
mProducto.belongsTo(mProveedor,{
    foreignKey: 'id_proveedor',
    as: 'rel_proveedor_producto'
});

//                  Relacion PROVEEDOR - COMPRA
//Una Compra pertenece a un Proveedor
mCompra.belongsTo(mProveedor, {
    as: 'Proveedor',
    foreignKey: 'id_proveedor'
});

//Un Proveedor puede tener muchas Compras
mProveedor.hasMany(mCompra, {
    as: 'Compras',
    foreignKey: 'id_proveedor'
});

//                  Relacion COMPTRA - PAGO PROVEEDOR
//Un PagoProveedor pertenece a una Compra
mPagoProveedor.belongsTo(mCompra, {
    as: 'Compras',
    foreignKey: 'id_compra'
});

//Una Compra puede tener muchos PagoProveedor
mCompra.hasMany(mPagoProveedor, {
    as: 'PagosProveedor',
    foreignKey: 'id_compra'
});

//                  Relacion DETALLE COMPRA - PRODUCTOS
//Un detalle de compra hace referencia a una compa
mDetalleCompra.belongsTo(mProducto, {
    as: 'Producto',
    foreignKey: 'id_producto' 
});

//Un producto puede tener muchos detalles de compra
mProducto.hasMany(mDetalleCompra, {
    as: 'DetallesCompra',
    foreignKey: 'id_producto'
});

//                  Relacion CLIENTE - VENTA
//Una Venta pertence a un Cliente
mVenta.belongsTo(mCliente, {
    as: 'Cliente',
    foreignKey: 'id_cliente'
});

//Una Cliente puede tener muchas ventas
mCliente.hasMany(mVenta, {
    as: 'Ventas',
    foreignKey: 'id_cliente'
});

//                 Relacion VENTA - DETALLE VENTA
//Un detalle de venta pertenece a una venta
mDetalleVenta.belongsTo(mVenta, {
    as: 'Venta',
    foreignKey: 'id_venta'
});

//Una venta puede tener muchos detalles de venta
mVenta.hasMany(mDetalleVenta, {
    as: 'DetallesVenta',
    foreignKey: 'id_venta'
});

//              Realacion DETALLE VENTA - PRODUCTO
//Un detalle de venta hace referencia a un producto
mDetalleVenta.belongsTo(mProducto, {
    as: 'Producto',
    foreignKey: 'id_producto'
});

//Un producto puede aparecer em muchos detalles de venta
mProducto.hasMany(mDetalleVenta, {
    as: 'DetallesVenta',
    foreignKey: 'id_producto'
});

//              Relacion VENTA - PAGO CLIENTE
//Un pago de Cliente pertence a una venta
mPagoCliente.belongsTo(mVenta, {
    as: 'Venta',
    foreignKey: 'id_venta'
});

//Una venta puede tener muchos pagos de cliente
mVenta.hasMany(mPagoCliente, {
    as: 'PagosCliente',
    foreignKey: 'id_venta'
});

module.exports = {mProducto, mProveedor, mCompra, mDetalleCompra, mPagoProveedor, mCliente, mVenta, mDetalleVenta, mPagoCliente};