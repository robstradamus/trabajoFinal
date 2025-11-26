$(document).ready(function () {
    $('#proveedor').select2({
        theme: 'bootstrap-5',
        placeholder: 'Buscar Proveedor...',
        allowClear: true
    });

    // llenar select con listaProductos
    window.llenarSelectProductos = function (select) {
        select.innerHTML = "";

        listaProductos.forEach(p => {
            const opt = new Option(p.nombre, p.id_producto);
            select.add(opt);
        });

        $(select).select2({
            theme: "bootstrap-5",
            width: '100%',
            placeholder: "Seleccionar producto",
            allowClear: true
        });
    };

    // Agregar fila de producto
    $("#agregarProducto").click(function () {
        const tbody = document.querySelector("#tablaProductos tbody");
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><select class="form-select w-200 select-producto" name="producto[]"></select></td>
            <td><input type="number" name="cantidad[]" class="form-control cantidad" min="1" required></td>
            <td><input type="number" name="precio_unitario[]" class="form-control precio" step="0.01" min="0.01" required></td>
            <td><input type="number" name="subtotal[]" class="form-control subtotal" readonly></td>
            <td><button type="button" class="btn btn-danger btn-sm eliminar">X</button></td>
        `;

        tbody.appendChild(row);

        const select = row.querySelector(".select-producto");
        llenarSelectProductos(select);

        row.querySelector(".cantidad").addEventListener("input", actualizarTotales);
        row.querySelector(".precio").addEventListener("input", actualizarTotales);

        row.querySelector(".eliminar").addEventListener("click", () => {
            row.remove();
            actualizarTotales();
        });
    });

    // actualizar total
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

    // agregar producto nuevo
    let modalProducto;

    $("#agregarProductoManual").click(function () {
        modalProducto = new bootstrap.Modal("#modalProducto");
        $("#idProveedor").select2({
            theme: 'bootstrap-5',
            placeholder: 'Buscar Proveedor...',
            allowClear: true,
            dropdownParent: $("#modalProducto")
        });
        modalProducto.show();
    });

    // registrar nuevo producto desde el modal
    $("#btnAgregarDesdeModal").click(async function () {

        const res = await fetch("/crear_producto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: $("#nombre").val(),
                tipoProducto: $("select[name='tipoProducto']").val(),
                codBarra: $("#codBarra").val(),
                idProveedor: $("#idProveedor").val(),
                precioUnitario: parseFloat($("#precioUnitario").val()),
                stock: parseFloat($("#stock").val()),
                descripcion: $("#descripcion").val()
            })
        });

        const data = await res.json();

        if (!data.ok) return alert(data.msg);

        listaProductos.push(data.producto);

        document.querySelectorAll(".select-producto").forEach(sel => {
            llenarSelectProductos(sel);
        });

        modalProducto.hide();
    });

});
