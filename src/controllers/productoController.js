const { validationResult } = require('express-validator');
const mProducto = require('../config/models/producto');
const mProveedor = require('../config/models/proveedor');
const { Op } = require('sequelize');

module.exports.producto = async (request, response) => {
    try{
        let datosProveedores = await mProveedor.findAll({
            raw: true
        });
        return response.render('producto/registrar', { paramProveedores: datosProveedores });
    
    }catch(error) {
        console.error("Error al mostrar formulario de producto:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la pagina de registro'}]);

        return response.redirect('/producto/listado');
    }
};

module.exports.listado = async (request, response) => {
    try{
        let listadoProducto = await mProducto.findAll({
            include: {
                model: mProveedor,
                as: 'rel_proveedor_producto',
                attributes: ['nombre']
            }
        });

        listadoProducto = listadoProducto.map(auxproducto => auxproducto.toJSON());
        return response.render('producto/listado', { paramProducto: listadoProducto });
    
    }catch(error) {
        console.error("Error al mostrar listado de productos:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar el listado de productos'}]);

        return response.redirect('/dashboard');
    }
};

module.exports.producto_post = async (request, response) => {
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/producto/registrar'); 
    }

    try{
        const { nombre, precioUnitario, stock, descripcion, codBarra, tipoProducto, idProveedor } = request.body;
        //valida si el codigo de barras exister
        let producto_existe = await mProducto.findOne({
            where: { 'cod_barra': codBarra },
            raw: true
        });
        if (producto_existe) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'El Código de Barras ya está registrado'}]);
            return response.redirect('/producto/registrar');
        }
        // si no existe lo crea
        let insertar = await mProducto.create({
            'nombre': nombre,
            'id_proveedor': idProveedor,
            'tipoProducto': tipoProducto,
            'cod_barra': codBarra,
            'precio_unitario': precioUnitario,
            'stock': stock,
            'observacion': descripcion
        });
        if (insertar) {
            request.flash('varEstiloMensaje', 'success'); 
            request.flash('varMensaje', [{ msg: 'Producto registrado con exito' }]);
            return response.redirect('/producto/listado');
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error al registrar el producto' }]);
            return response.redirect('/producto/registrar'); 
        }
    }catch (error) {
        console.error("Error al registrar producto:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al registrar el producto.'}]);
        return response.redirect('/producto/registrar');
    }
};

module.exports.eliminar = async (request, response) => {
    try {
        const { id_producto } = request.params;
        let eliminar = await mProducto.destroy({
            where: { 'id_producto': id_producto }
        });

        if (eliminar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{ msg: 'Eliminación exitosa' }]);

        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'No se encontró el producto' }]);
        }
        return response.redirect('/producto/listado');

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error: El producto no se puede eliminar '}]);

        return response.redirect('/producto/listado');
    }
};

module.exports.modificar = async (request, response) => {
    try {
        const { id_producto } = request.params;
        let datosProducto = await mProducto.findOne({
            where: { 'id_producto': id_producto },
            include: {
                model: mProveedor,
                as: 'rel_proveedor_producto',
                attributes: ['nombre']
            }
        });
        if (!datosProducto) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'No se encontró el producto'}]);
            return response.redirect('/producto/listado');
        }

        datosProducto = datosProducto.toJSON();
        
        let datosProveedores = await mProveedor.findAll({
            raw: true
        });
        
        return response.render('producto/modificar', { paramProveedores: datosProveedores, paramProducto: datosProducto });
    
    } catch (error) {
        console.error("Error al mostrar modificar producto:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error al cargar la pagina'}]);
        return response.redirect('/producto/listado');
    }
};

module.exports.modificar_post = async (request, response) => {
    const { id_producto } = request.params;
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', errores.array());
        return response.redirect('/producto/modificar/' + id_producto); 
    }

    try{
        const { nombre, precioUnitario, stock, descripcion, codBarra, tipoProducto, idProveedor } = request.body;
        let producto_existe = await mProducto.findOne({
            where: {
                cod_barra: codBarra,
                id_producto: { [Op.ne]: id_producto }
            },
            raw: true
        });

        if (producto_existe) {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{msg: 'Ese Codigo de Barras ya está en uso por otro producto'}]);

            return response.redirect('/producto/modificar/' + id_producto);
        }

        let modificar = await mProducto.update(
            {
                'nombre': nombre,
                'id_proveedor': idProveedor,
                'tipoProducto': tipoProducto,
                'cod_barra': codBarra,
                'precio_unitario': precioUnitario,
                'stock': stock,
                'observacion': descripcion
            },
            {
                where: { 'id_producto': id_producto }
            }
        );

        if (modificar) {
            request.flash('varEstiloMensaje', 'success');
            request.flash('varMensaje', [{ msg: 'Producto modificado con exito' }]);
            return response.redirect('/producto/listado');
        } else {
            request.flash('varEstiloMensaje', 'danger');
            request.flash('varMensaje', [{ msg: 'Error al modificar el producto' }]);

            return response.redirect('/producto/modificar/' + id_producto);
        }
    }catch (error) {
        console.error("Error al modificar producto:", error);
        request.flash('varEstiloMensaje', 'danger');
        request.flash('varMensaje', [{msg: 'Error interno al modificar el producto.'}]);
        return response.redirect('/producto/modificar/' + id_producto);
    }
};