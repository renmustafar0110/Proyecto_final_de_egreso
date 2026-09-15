// Lógica de la página de Gestión de Traslados

// Se obtienen el selector de elemento y el campo de descripción
var selectElemento = document.getElementById('elemento');
var campoDescripcion = document.getElementById('campo_descripcion');

// Al cambiar la selección se muestra u oculta la descripción
selectElemento.onchange = function () {
    if (selectElemento.value) {
        // Si se eligió una opción se muestra el campo de descripción
        campoDescripcion.style.display = 'block';
    } else {
        // Si no se eligió nada se oculta el campo
        campoDescripcion.style.display = 'none';
    }
};