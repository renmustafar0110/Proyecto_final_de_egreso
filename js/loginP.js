var formulario = document.getElementById('form-login');
var alerta = document.getElementById('alerta-acceso');

formulario.addEventListener('submit', function (evento) {
    var campos = formulario.querySelectorAll('input');

    for (var i = 0; i < campos.length; i++) {
        if (campos[i].type === 'submit') {
            continue;
        }

        if (campos[i].value.trim() === '') {
            evento.preventDefault();
            alerta.style.display = 'block';
            return;
        }
    }

    alerta.style.display = 'none';
});
