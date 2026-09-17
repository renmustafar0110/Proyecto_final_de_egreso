// Lógica de la página de Inicio de Sesión del Funcionario

// Obtiene los campos del formulario
var campoCedula = document.getElementById('cedula');
var campoPassword = document.getElementById('password');
var formulario = document.querySelector('form');
var togglePassword = document.getElementById('togglePassword');

// Al marcar la casilla muestra u oculta la contraseña
togglePassword.addEventListener('change', function () {
    if (togglePassword.checked) {
        campoPassword.type = 'text';
    } else {
        campoPassword.type = 'password';
    }
});

// Al enviar el formulario valida los datos
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var cedula = campoCedula.value.trim();
    var password = campoPassword.value.trim();

    // Si los datos son correctos inicia la sesión
    if (cedula === '12345678' && password === 'proyecto123') {
        sessionStorage.setItem('sesion', cedula);
        window.location.href = 'decisionF.html';
    } else {
        // Si son incorrectos muestra un aviso
        alert('Cédula o contraseña incorrecta.');
        campoCedula.focus();
    }
});