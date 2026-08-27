var selectElemento = document.getElementById('elemento');
var campoDescripcion = document.getElementById('campo_descripcion');

selectElemento.onchange = function () {
    if (selectElemento.value) {
        campoDescripcion.style.display = 'block';
    } else {
        campoDescripcion.style.display = 'none';
    }
};
