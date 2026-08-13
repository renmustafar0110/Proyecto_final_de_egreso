var formulario = document.getElementById('form-login');

formulario.addEventListener('submit', function (evento) {
    var campos = formulario.querySelectorAll('input');

    for (var i = 0; i < campos.length; i++) {
        if (campos[i].type === 'submit') {
            continue;
        }

        if (campos[i].value.trim() === '') {
            evento.preventDefault();
            alert('Debe completar todos los campos de inicio de sesión para continuar.');
            return;
        }
    }
});
