$(document).ready(function() {
    $('#proveedor').select2({
        theme: 'bootstrap-5',   // usa el estilo de Bootstrap 4 (funciona bien con Bootstrap 5 también)
        placeholder: 'Buscar Proveedor...',
        allowClear: true
    });
    function inicializarSelect2() {
        $('select[name="producto[]"]').select2({
            theme: "bootstrap-5",
            width: '100%',
            placeholder: "Seleccionar producto",
            allowClear: true
        });
    }
});
