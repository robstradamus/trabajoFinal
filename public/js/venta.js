
$(document).ready(function() {
    $('#id_cliente').select2({
        theme: 'bootstrap-5',   
        placeholder: 'Buscar cliente...',
        allowClear: true
    });
    const lenguageEs = { 
        "processing": "Procesando...",
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "emptyTable": "Ningún dato disponible en esta tabla",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "search": "Buscar:",
        "loadingRecords": "Cargando...",
        "paginate": {
            "first": "Primero",
            "last": "Último",
            "next": "Siguiente",
            "previous": "Anterior"
        },
        "aria": {
            "sortAscending": ": Activar para ordenar la columna de manera ascendente",
            "sortDescending": ": Activar para ordenar la columna de manera descendente"
        }        
    };
    //CUENTAS CORRIENTES: Se ejecuta si existe la tabla
    if ($('#tablaCuentaCorriente').length > 0) {
        let tablaCuentaCorriente = $('#tablaCuentaCorriente').DataTable({
            "language": lenguageEs
        });
    }

    // PAGOS: Se ejecuta si existe la tabla
    if ($('#tablaPagosVentas').length > 0) {
        let tablaPagosListado = $('#tablaPagosVentas').DataTable({
            "language": lenguageEs
        });
    }

    //LISTADO VENTAS: Se ejecuta si existe la tabla
    let tablaListado;
    if ($('#tablaVentas').length > 0) {
        tablaListado = $('#tablaVentas').DataTable({
            "language": lenguageEs,
            "columnDefs": [
                { "type": "date", "targets": 1 } 
            ]
        });
    }

    //LOGICA DE REGISTRAR VENTA: Se ejecuta si existe el formulario
    if (document.getElementById('formVenta')) {        
        let indiceFila = 0;
        function configurarScanner() {
            const scanInput = document.getElementById('scanInput');
            scanInput.focus();
            scanInput.addEventListener('keydown', function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const codigo = this.value.trim();
                    if (codigo) {
                        buscarProducto(codigo);
                        this.value = ""; 
                    }
                }
            });
        }
        function buscarProducto(codigo) {
            fetch(`/producto/buscar/${codigo}`)
                .then(response => {
                    if (response.status === 501) throw new Error('No hay stock suficiente.');
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
        function agregarProductoAVenta(producto) {
            const filas = document.querySelectorAll("#tbodyProductos tr");
            let productoExiste = false;
            let error = false;
            filas.forEach(fila => {
                const idInput = fila.querySelector('.producto-id');
                if (idInput && idInput.value == producto.id_producto) {
                    const cantidadInput = fila.querySelector(".cantidad");
                    const nuevaCantidad = parseFloat(cantidadInput.value) + 1;
                    const stock = parseFloat(idInput.getAttribute('data-stock'));
                    if (nuevaCantidad > stock) {
                        alert(`No hay suficiente stock. Stock disponible: ${stock}`);
                        error = true;
                        return;
                    } else {
                        cantidadInput.value = nuevaCantidad;
                        productoExiste = true;
                    }
                }
            });    
            if (!productoExiste && error !== true) {
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
                           min="0.01" 
                           step="0.01"
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
            
            fila.querySelector(".cantidad").addEventListener("input", actualizarTotales);
            fila.querySelector(".precio").addEventListener("input", actualizarTotales);
            
            indiceFila++;
        }
        window.eliminarFila = function(boton) {
            boton.closest("tr").remove();
            actualizarTotales();
        }
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

        window.focusScanner = function() {
            document.getElementById('scanInput').focus();
        }
        document.getElementById('formVenta').addEventListener('submit', function(e) {
            const filas = document.querySelectorAll("#tbodyProductos tr");
            if (filas.length === 0) {
                e.preventDefault();
                alert("Debe agregar al menos un producto a la venta");
                return false;
            }
            return true;
        });
        //document.getElementById("agregarProducto").addEventListener("click", function() {
            //agregarFilaProducto();
        //});
        configurarScanner();
        console.log('Escáner de ventas listo');
    }

    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            const min = $('#minDate').val();
            const max = $('#maxDate').val();
            const date = data[1]; 

            const partes = date.split('/');
            const cellDate = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`); // YYYY-MM-DD

            if (isNaN(cellDate)) {
            console.warn('Fecha no válida en fila:', date);
            return true;
            }

            // Convertimos las fechas del filtro también
            const minDate = min ? new Date(min) : null;
            const maxDate = max ? new Date(max) : null;

            // Lógica del filtro
            if ((minDate && cellDate < minDate) || (maxDate && cellDate > maxDate)) {
            return false;
            }
            return true;
        }
    );

    $('#minDate, #maxDate').on('change', function () {
        tablaListado.draw(); 
    });

    $('#clearDateFilter').on('click', function () {
        $('#minDate').val('');
        $('#maxDate').val('');
        tablaListado.draw();
    });

    let modalProducto;
    document.getElementById("agregarProducto").addEventListener("click", () => {
        modalProducto = new bootstrap.Modal(document.getElementById("modalProducto"));
        $('#idProveedor').select2({
            theme: 'bootstrap-5',   
            placeholder: 'Buscar Proveedor...',
            allowClear: true,
            dropdownParent: $('#modalProducto') 
        });
        modalProducto.show();
    });

    document.getElementById("btnAgregarDesdeModal").addEventListener("click", async () => {
        const nombre = document.getElementById("nombre").value;
        const tipoProducto = document.querySelector("select[name='tipoProducto']").value;
        const codBarra = document.getElementById("codBarra").value;
        const idProveedor = document.getElementById("idProveedor").value;
        const precioUnitario = parseFloat(document.getElementById("precioUnitario").value);
        const stock = parseFloat(document.getElementById("stock").value);
        const descripcion = document.getElementById("descripcion").value;


        const res = await fetch("/crear_producto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre,
                tipoProducto,
                codBarra,
                idProveedor,
                precioUnitario,
                stock,
                descripcion
            })
        });

        const data = await res.json();

        if (!data.ok) {
            alert(data.msg);
            return;
        }

        const producto = {
        id_producto: data.producto.id_producto,
        nombre: data.producto.nombre,
        stock: data.producto.stock,
        precio_unitario: data.producto.precio_unitario
        };

        agregarFilaProducto(producto);
        modalProducto.hide();
    });
});