var formulario = document.getElementById('form-registro');

formulario.addEventListener('submit', function (evento) {
    var campos = formulario.querySelectorAll('input');

    for (var i = 0; i < campos.length; i++) {
        if (campos[i].type === 'submit') {
            continue;
        }

        if (campos[i].value.trim() === '') {
            evento.preventDefault();
            alert('Debe completar todos los campos de registro para continuar.');
            return;
        }
    }
});
