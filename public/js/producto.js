let tabla;
$(document).ready(function() {
    $('#idProveedor').select2({
        theme: 'bootstrap-5',   // usa el estilo de Bootstrap 4 (funciona bien con Bootstrap 5 también)
        placeholder: 'Buscar Proveedor...',
        allowClear: true
    });

    tabla = $('#tablaProductos').DataTable({
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
