// datatables-init.js
// Verifica que jQuery esté cargado
if (typeof $ === 'undefined') {
    console.error('jQuery no está cargado. DataTables no puede inicializarse.');
} else {
    // Inicializa todas las tablas con clase "datatable" o id "miTabla"
    $(document).ready(function () {

 // Opción 1: Inicializar por ID, una UNICA TABLA
        if ($('#miTabla').length) {
            $('#miTabla').DataTable({
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json'
                },
                pageLength: 5, //cantidad de registros por pagina
                lengthMenu: [5, 10, 25, 50],
                responsive: true,
                ordering: true,
                searching: true,
                info: true,
                paging: true
            });
        }
// Opción 2 (Recomendada): Inicializar por CLASE (más flexible).Sirve para VARIAS TABLAS
        $('.datatable').each(function () {
            if (!$.fn.DataTable.isDataTable(this)) { // Evita inicializar dos veces
                $(this).DataTable({
                    language: {
                        url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json'
                    },
                    pageLength: 10,
                    lengthMenu: [5, 10, 25, 50, 100],
                    responsive: true,
                    ordering: true,
                    searching: true,
                    info: true,
                    paging: true,
                    dom: '<"top"f>rt<"bottom"lp><"clear">'
                });
            }
        });

    });
}