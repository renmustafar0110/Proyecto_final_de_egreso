document.getElementById('form-registro').addEventListener('submit', function (event) {
    var campos = this.querySelectorAll('input');
    for (var i = 0; i < campos.length; i++) {
        if (campos[i].type !== 'submit' && campos[i].value.trim() === '') {
            event.preventDefault();
            alert('Debe completar todos los campos de registro para continuar.');
            return;
        }
    }
});
