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