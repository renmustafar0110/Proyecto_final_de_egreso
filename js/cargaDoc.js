var formulario = document.getElementById('form-doc');

formulario.addEventListener('submit', function (evento) {
    var campos = formulario.querySelectorAll('input, select, textarea');

    for (var i = 0; i < campos.length; i++) {
        if (campos[i].type === 'submit') {
            continue;
        }

        if (campos[i].type === 'file') {
            if (campos[i].files.length === 0) {
                evento.preventDefault();
                alert('Debe completar todos los campos antes de publicar el documento.');
                return;
            }
        } else {
            if (campos[i].value.trim() === '') {
                evento.preventDefault();
                alert('Debe completar todos los campos antes de publicar el documento.');
                return;
            }
        }
    }
});
