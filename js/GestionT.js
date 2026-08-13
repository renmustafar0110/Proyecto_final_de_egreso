var selectElemento = document.getElementById('elemento');
var campoDescripcion = document.getElementById('campo_descripcion');
var formulario = document.getElementById('form-traslado');

selectElemento.onchange = function () {
    if (selectElemento.value) {
        campoDescripcion.style.display = 'block';
    } else {
        campoDescripcion.style.display = 'none';
    }
};

formulario.onsubmit = function () {
    var conductor = document.getElementById('conductor').value;
    var elemento = selectElemento.value;
    var descripcion = document.getElementById('descripcion_elemento').value;
    var acompanante = document.getElementById('acompanante').value;
    var origen = document.getElementById('origen').value;
    var destino = document.getElementById('destino').value;
    var horaSalida = document.getElementById('hora_salida').value;
    var horaEstimada = document.getElementById('hora_estimada').value;
    var horaEfectiva = document.getElementById('hora_efectiva').value;

    if (conductor === '' || elemento === '' || descripcion === '' || acompanante === '' || origen === '' || destino === '' || horaSalida === '' || horaEstimada === '' || horaEfectiva === '') {
        alert('Debe completar todos los campos antes de realizar el traslado.');
        return false;
    }
};
