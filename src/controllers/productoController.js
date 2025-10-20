const { validationResult } = require('express-validator');
const mProducto = require('../config/models/producto');
const mProveedor = require('../config/models/proveedor');
const {request, response} = require('express');
const {fn} = require('sequelize');



module.exports.producto = async (request, response) => {
    let datosProveedores = await mProveedor.findAll(
        {raw:true}
    )
    return response.render('producto/registrar', { paramProveedores:datosProveedores});
};

module.exports.listado = async (request, response) => {
    let listadoProducto = await mProducto.findAll(
        {
            include:{
                model: mProveedor,
                as: 'rel_proveedor_producto',
                attributes: ['nombre']
            }
        }
    );
    listadoProducto=listadoProducto.map(auxproducto => auxproducto.toJSON());
    return response.render('producto/listado', {paramProducto : listadoProducto});
};

module.exports.producto_post = async (request, response) => {
    const errores = validationResult(request);
    if(!errores.isEmpty()){
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/producto/listado');
    }
    const {nombre, precioUnitario, stock, descripcion, codBarra, tipoProducto, idProveedor}= request.body;
    let insertar = await mProducto.create(
        {
            'nombre':nombre,
            'id_proveedor':idProveedor,
            'tipoProducto':tipoProducto,
            'cod_barra':codBarra,
            'precio_unitario':precioUnitario,
            'stock':stock,
            'observacion':descripcion
        }
    );
    if(insertar){
        request.flash('varEstiloMensaje', 'succes');
        request.flash('varMensaje', [{msg: 'Producto registrado con exito'}]);
        return response.redirect('/producto/listado');
    }
    else{
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al registrar el producto'}]);
        return response.redirect('/producto/listado');
    }
};

module.exports.eliminar = async (request, response) => {
    const {id_producto} = request.params;
    let eliminar = await mProducto.destroy(
        {
            where:{'id_producto':id_producto},
            raw:true
        }
    );
    if (eliminar) {
        request.flash('varEstiloMensaje', 'success');
        request.flash('varMensaje', [{msg: 'Eliminación exitosa.'}]);
        return response.redirect('/producto/listado');
    } else {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Fallo en la eliminación, verifique...'}]);
        return response.redirect('/producto/listado');
    }
};

module.exports.modificar = async (request, response) => {
    const {id_producto} = request.params;
    let datosProducto = await mProducto.findOne(
        {
            where: {'id_producto': id_producto},
            include: {
                model: mProveedor,
                as: 'rel_proveedor_producto',
                attributes: ['nombre']
            }
        }
    );
    datosProducto = datosProducto.toJSON();
    let datosProveedores = await mProveedor.findAll(
        {raw:true}
    );
    return response.render('producto/modificar', { paramProveedores:datosProveedores, paramProducto:datosProducto});
};

module.exports.modificar_post = async (request, response) => {
    const {id_producto}=request.params;
    const errores = validationResult(request);
    if(!errores.isEmpty()){
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/producto/listado');
    }
    const {nombre, precioUnitario, stock, descripcion, codBarra, tipoProducto, idProveedor}= request.body;
    let modificar = await mProducto.update(
        {
            'nombre':nombre,
            'id_proveedor':idProveedor,
            'tipoProducto':tipoProducto,
            'cod_barra':codBarra,
            'precio_unitario':precioUnitario,
            'stock':stock,
            'observacion':descripcion
        },
        {
            where:{'id_producto':id_producto}
        }
    );
    if(modificar){
        request.flash('varEstiloMensaje', 'succes');
        request.flash('varMensaje', [{msg: 'Producto modificado con exito'}]);
        return response.redirect('/producto/listado');
    }
    else{
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al modificar el producto'}]);
        return response.redirect('/producto/listado');
    }
};