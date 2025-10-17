const mProducto = require('./models/producto');
const mProveedor = require('./models/proveedor');

mProveedor.hasMany(mProducto,{
    foreignKey: 'id_proveedor',
    as: 'rel_proveedor_producto'
});
mProducto.belongsTo(mProveedor,{
    foreignKey: 'id_proveedor',
    as: 'rel_proveedor_producto'
});