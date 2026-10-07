var campoCedula = document.getElementById('cedula');
var campoPassword = document.getElementById('password');
var formulario = document.querySelector('form');
var togglePassword = document.getElementById('togglePassword');
var destino = formulario.getAttribute('data-destino');

togglePassword.addEventListener('change', function () {
    campoPassword.type = togglePassword.checked ? 'text' : 'password';
});

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var cedula = campoCedula.value.trim();
    var password = campoPassword.value.trim();

    if (cedula == '12345678' && password == 'proyecto123') {
        sessionStorage.setItem('sesion', cedula);
        window.location.href = destino;
    } else {
        alert('Cédula o contraseña incorrecta.');
        campoCedula.focus();
    }
});