var campoCedula = document.getElementById('cedula');
var campoPassword = document.getElementById('password');
var formulario = document.querySelector('form');
var togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('change', function () {
    if (togglePassword.checked) {
        campoPassword.type = 'text';
    } else {
        campoPassword.type = 'password';
    }
});

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var cedula = campoCedula.value.trim();
    var password = campoPassword.value.trim();

    if (cedula === '12345678' && password === 'proyecto123') {
        sessionStorage.setItem('sesion', cedula);
        window.location.href = 'decisionF.html';
    } else {
        alert('Cédula o contraseña incorrecta.');
        campoCedula.focus();
    }
});