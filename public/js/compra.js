$(document).ready(function() {
    $('#proveedor').select2({
        theme: 'bootstrap-5',   // usa el estilo de Bootstrap 4 (funciona bien con Bootstrap 5 también)
        placeholder: 'Buscar Proveedor...',
        allowClear: true
    });
    function inicializarSelect2() {
        $('select[name=".select-producto"]').select2({
            theme: "bootstrap-5",
            width: '100%',
            placeholder: "Seleccionar producto",
            allowClear: true
        });
    }

    function actualizarSelectsProductos3(producto) {
        console.log("Actualizando selects con:", producto);
        document.querySelectorAll(".select-producto").forEach(select => {

            // Opción ya existe
            if ([...select.options].some(o => o.value == producto.id_producto)) {
                console.log("La opción ya existía");
                return;
            }

            // Crear nueva opción
            const opt = new Option(
                producto.nombre,
                producto.id_producto,
                false,
                false
            );

            select.add(opt);

            // REFRESCAR Select2
            if ($(select).data('select2')) {
                $(select).select2('destroy');        // 🔥 destruir
                $(select).select2({                  // 🔥 recrear
                    theme: 'bootstrap-5',
                    width: '100%',
                    placeholder: 'Seleccionar producto',
                    allowClear: true
                });
            }
        });
    }

    function actualizarSelectsProductos(producto) {
    console.log("Actualizando selects con:", producto);

    document.querySelectorAll(".select-producto").forEach(select => {

        // si ya estaba, skip
        if ([...select.options].some(o => o.value == producto.id_producto)) {
            console.log("Existe, skip");
            return;
        }

        // agregar opción
        const opt = new Option(producto.nombre, producto.id_producto, false, false);
        select.add(opt);

        // reconstruir select2 (porque deja de ver las opciones nuevas)
        if ($(select).data('select2')) {
            $(select).select2('destroy');
        }

        $(select).select2({
            theme: "bootstrap-5",
            width: '100%',
            placeholder: "Seleccionar producto",
            allowClear: true
        });
    });
}



    function actualizarSelectsProductos2(producto) {
    // Recorrer todos los selects que listan productos
        document.querySelectorAll(".select-producto").forEach(select => {
            // verificar si ya existe
            let existe = Array.from(select.options).some(o => o.value == producto.id_producto);
            if (existe) return;

            // Crear nueva opción
            const option = new Option(
                producto.nombre,
                producto.id_producto,
                false,
                false
            );

            // Agregar la opción al select
            select.add(option);

            // Refrescar select2 si está activo
            if ($(select).data('select2')) {
                $(select).trigger('change.select2');
            }
        });
    }

    let modalProducto;
    document.getElementById("agregarProductoManual").addEventListener("click", () => {
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
        console.log(data);

        if (!data.ok) {
            alert(data.msg);
            return;
        }
        actualizarSelectsProductos(data.producto);
        modalProducto.hide();
    });
});
