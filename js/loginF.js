// Lógica de la página de Inicio de Sesión del Funcionario

// Se obtienen los campos del formulario
var campoCedula = document.getElementById('cedula');
var campoPassword = document.getElementById('password');
var formulario = document.querySelector('form');
var togglePassword = document.getElementById('togglePassword');

// Al marcar la casilla se muestra u oculta la contraseña
togglePassword.addEventListener('change', function () {
    if (togglePassword.checked) {
        campoPassword.type = 'text';
    } else {
        campoPassword.type = 'password';
    }
});

// Al enviar el formulario se validan los datos ingresados
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var cedula = campoCedula.value.trim();
    var password = campoPassword.value.trim();

    // Si la cédula y la contraseña son correctas se inicia la sesión
    if (cedula === '12345678' && password === 'proyecto123') {
        sessionStorage.setItem('sesion', cedula);
        window.location.href = 'decisionF.html';
    } else {
        // Si los datos son incorrectos se muestra un aviso
        alert('Cédula o contraseña incorrecta.');
        campoCedula.focus();
    }
});