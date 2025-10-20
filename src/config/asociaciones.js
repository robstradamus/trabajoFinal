const mProducto = require('./models/producto');
const mProveedor = require('./models/proveedor');
const mCompra = require('./models/compra');
const mDetalleCompra = require('./models/detalleCompra');
const mPagoProveedor = require('./models/pagoProveedor');

mProveedor.hasMany(mProducto,{
    foreignKey: 'id_proveedor',
    as: 'rel_proveedor_producto'
});
mProducto.belongsTo(mProveedor,{
    foreignKey: 'id_proveedor',
    as: 'rel_proveedor_producto'
});

mCompra.belongsTo(mProveedor, {
    as: 'Proveedor',
    foreignKey: 'id_proveedor'
});

mProveedor.hasMany(mCompra, {
    as: 'Compras',
    foreignKey: 'id_proveedor'
});


mPagoProveedor.belongsTo(mCompra, {
    as: 'Compras',
    foreignKey: 'id_compra'
});

mCompra.hasMany(mPagoProveedor, {
    as: 'PagosProveedor',
    foreignKey: 'id_compra'
});

mDetalleCompra.belongsTo(mProducto, {
    as: 'Producto',
    foreignKey: 'id_producto' 
});

mProducto.hasMany(mDetalleCompra, {
    as: 'DetallesCompra',
    foreignKey: 'id_producto'
});