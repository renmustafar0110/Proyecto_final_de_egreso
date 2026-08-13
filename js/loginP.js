document.getElementById('form-login').addEventListener('submit', function (event) {
    var campos = this.querySelectorAll('input');
    for (var i = 0; i < campos.length; i++) {
        if (campos[i].type !== 'submit' && campos[i].value.trim() === '') {
            event.preventDefault();
            alert('Debe completar todos los campos de inicio de sesión para continuar.');
            return;
        }
    }
});
