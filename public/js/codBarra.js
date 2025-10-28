function configurarLectora() {
    const inputCodBarra = document.getElementById('codBarra');
    inputCodBarra.focus();
    //Detectar cuando se escanea un código
    inputCodBarra.addEventListener('input', function(e) {
        const valor = this.value;
        if (valor.length >= 3) { //Codigo de barras debe tenrer al menos 3 caracteres
            console.log('Código escaneado:', valor);
            //Mover automáticamente al siguiente campo después de escanear
            setTimeout(() => { document.getElementById('nombre').focus();}, 100);
        }
    });
    inputCodBarra.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('nombre').focus();
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    configurarLectora();
    //Debug
    console.log('Lectora de código de barras configurada. Coloque el cursor en el campo de código y escanee.');
});
//Forzar el foco en el campo de código de barras
function focusCodigoBarras() {
    document.getElementById('codBarra').focus();
}