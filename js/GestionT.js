// Lógica de la página de Gestión de Traslados

// Obtiene el selector y el campo de descripción
var selectElemento = document.getElementById('elemento');
var campoDescripcion = document.getElementById('campo_descripcion');

// Muestra u oculta la descripción según la selección
selectElemento.onchange = function () {
    if (selectElemento.value) {
        campoDescripcion.style.display = 'block';
    } else {
        campoDescripcion.style.display = 'none';
    }
};