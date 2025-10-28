let indiceFila = 0;
function configurarScanner() {
    const scanInput = document.getElementById('scanInput');
    scanInput.focus();
    //Escuchar cuando se escanea 
    scanInput.addEventListener('keydown', function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const codigo = this.value.trim();
            if (codigo) {
                buscarProducto(codigo);
                this.value = ""; // Limpiar campo
            }
        }
    });
}
//Buscar producto por código
function buscarProducto(codigo) {
    fetch(`/producto/buscar/${codigo}`)
        .then(response => {
            if (!response.ok) throw new Error('Producto no encontrado');
            return response.json();
        })
        .then(producto => {
            if (producto && producto.id_producto) {
                agregarProductoAVenta(producto);
            } else {
                alert("Producto no encontrado");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al buscar producto: " + error.message);
        });
}

//Agregar producto a la tabla
function agregarProductoAVenta(producto) {
    // Verificar si ya existe
    const filas = document.querySelectorAll("#tbodyProductos tr");
    let productoExiste = false;
    
    filas.forEach(fila => {
        const idInput = fila.querySelector('.producto-id');
        if (idInput && idInput.value == producto.id_producto) {
            //Incrementar cantidad si ya existe
            const cantidadInput = fila.querySelector(".cantidad");
            const nuevaCantidad = parseInt(cantidadInput.value) + 1;
            const stock = parseInt(idInput.getAttribute('data-stock'));
            if (nuevaCantidad > stock) {
                alert(`No hay suficiente stock. Stock disponible: ${stock}`);
                return;
            }
            cantidadInput.value = nuevaCantidad;
            productoExiste = true;
        }
    });    
    if (!productoExiste) {
        agregarFilaProducto(producto);
    }
    
    actualizarTotales();
}
function agregarFilaProducto(producto = null) {
    const tbody = document.getElementById("tbodyProductos");
    const esPorEscaneo = producto !== null;
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>
            ${esPorEscaneo 
                ? `
                    ${producto.nombre}
                    <input type="hidden" 
                           name="productos[${indiceFila}][id_producto]" 
                           value="${producto.id_producto}" 
                           class="producto-id"
                           data-stock="${producto.stock}">
                    <br><small class="text-muted">Stock: ${producto.stock}</small>
                    `
                : `
                    <input type="text" 
                           name="productos[${indiceFila}][nombre_manual]" 
                           class="form-control" 
                           placeholder="Descripción del producto" 
                           required>
                    <input type="hidden" 
                           name="productos[${indiceFila}][id_producto]" 
                           value="0">
            `}
        </td>
        <td>
            <input type="number" 
                   name="productos[${indiceFila}][cantidad]" 
                   class="form-control cantidad" 
                   value="1" 
                   min="1" 
                   ${esPorEscaneo ? `max="${producto.stock}"` : ''}
                   required>
        </td>
        <td>
            <input type="number" 
                   name="productos[${indiceFila}][precio_unitario]" 
                   class="form-control precio" 
                   value="${esPorEscaneo ? producto.precio_unitario : '0'}" 
                   step="0.01" 
                   required>
        </td>
        <td>
            <input type="number" 
                   class="form-control subtotal" 
                   readonly 
                   value="${esPorEscaneo ? producto.precio_unitario : '0'}">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="eliminarFila(this)">Quitar</button>
        </td>
    `;
    tbody.appendChild(fila);
    //Agregar eventos para actualizar totales
    fila.querySelector(".cantidad").addEventListener("input", actualizarTotales);
    fila.querySelector(".precio").addEventListener("input", actualizarTotales);
    
    indiceFila++;
}
// Eliminar fila
function eliminarFila(boton) {
    boton.closest("tr").remove();
    actualizarTotales();
}
// Actualizar totales
function actualizarTotales() {
    let total = 0;
    const filas = document.querySelectorAll("#tbodyProductos tr");
    filas.forEach(fila => {
        const cantidad = parseFloat(fila.querySelector(".cantidad").value) || 0;
        const precio = parseFloat(fila.querySelector(".precio").value) || 0;
        const subtotal = cantidad * precio;
        fila.querySelector(".subtotal").value = subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById("totalVenta").textContent = total.toFixed(2);
    document.getElementById("totalInput").value = total.toFixed(2);
    document.getElementById("totalHidden").value = total.toFixed(2);
}
//Forzar foco en escáner
function focusScanner() {
    document.getElementById('scanInput').focus();
}
// Validar formulario antes de enviar
document.getElementById('formVenta').addEventListener('submit', function(e) {
    const filas = document.querySelectorAll("#tbodyProductos tr");
    
    if (filas.length === 0) {
        e.preventDefault();
        alert("Debe agregar al menos un producto a la venta");
        return false;
    }
    
    return true;
});

// Agregar producto manualmente
document.getElementById("agregarProducto").addEventListener("click", function() {
    agregarFilaProducto();
});

//Inicializar scanneer cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    configurarScanner();
    console.log('Escáner de ventas listo');
});