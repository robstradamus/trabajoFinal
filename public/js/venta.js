// public/js/venta.js - Versión mínima
let productoCount = 1;

function agregarProducto() {
    const container = document.querySelector('.mb-4');
    
    const productoHTML = `
        <div class="row mb-2 producto-dinamico">
            <div class="col-md-5">
                <select class="form-select" name="productos[${productoCount}][id_producto]">
                    <option value="">Seleccione producto</option>
                </select>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" name="productos[${productoCount}][cantidad]" placeholder="Cantidad" min="1">
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" name="productos[${productoCount}][precio_unitario]" placeholder="Precio" step="0.01">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-sm btn-danger" onclick="eliminarProducto(this)">×</button>
            </div>
        </div>
    `;
    
    const boton = container.querySelector('button');
    container.insertBefore(htmlToElement(productoHTML), boton);
    productoCount++;
}

function eliminarProducto(button) {
    button.closest('.producto-dinamico').remove();
}

function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// -----------------------------------------------
$(document).ready(function() {
    tabla = $('#tablaVentas').DataTable({
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros por página",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando página _PAGE_ de _PAGES_",
            "infoEmpty": "No hay registros disponibl    es",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "search": "Buscar:",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            },
        }
    });
});
let indiceFila = 0;



// Verifica si el producto ya esta agregado para aumentarle la cantidad

function manejarProductoEscaneado(producto) {
    let productoEncontrado = false;

    document.querySelectorAll("#tablaProductos tbody tr").forEach(row => {
        const idInput = row.querySelector('.producto-id'); 
        
        if (idInput && idInput.value == producto.id_producto) {
            
            const cantidadInput = row.querySelector(".cantidad");
            
            let nuevaCantidad = parseInt(cantidadInput.value) + 1;
            cantidadInput.value = nuevaCantidad;

            row.querySelector(".precio").value = producto.precio_unitario;

            productoEncontrado = true;
        }
    });

    if (productoEncontrado) {
        actualizarTotales();
    } else {
        agregarFilaProducto(producto);
    }
}

document.getElementById("agregarProducto").addEventListener("click", () => {
    agregarFilaProducto(); 
});

// Se calcula el total de la venta

function actualizarTotales() {
    let total = 0;
    document.querySelectorAll("#tablaProductos tbody tr").forEach(row => {
        const cantidad = parseFloat(row.querySelector(".cantidad").value) || 0;
        const precio = parseFloat(row.querySelector(".precio").value) || 0;
        const subtotal = cantidad * precio;
        
        row.querySelector(".subtotal").value = subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById("total").value = total.toFixed(2); 
}

// Se obtiene el input del cod 

const scanInput = document.getElementById('scanInput');
scanInput.focus();

scanInput.addEventListener('keydown', etiqueta => {
    if(etiqueta.key === "Enter") {
        etiqueta.preventDefault(); 
        let code = etiqueta.target.value.trim();
        etiqueta.target.value = "";
        obtenerDatosProducto(code); 
    }
});

// Se busca el cod

function obtenerDatosProducto(code) {
    const url = `/producto/buscar/${code}`; 

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.id_producto) {
                manejarProductoEscaneado(data); 
            } else {
                alert("Producto no encontrado o código inválido.");
            }
        })
        .catch(error => {
            console.error("Hubo un problema con la petición fetch:", error);
            alert("Error al buscar producto: " + error.message);
        });
}