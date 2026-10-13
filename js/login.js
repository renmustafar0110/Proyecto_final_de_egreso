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
    var password = campoPassword.value;

    if (cedula == '' || password == '') {
        alert('Ingrese cédula y contraseña.');
        campoCedula.focus();
        return;
    }

    var datos = new FormData();
    datos.append('cedula', cedula);
    datos.append('password', password);

    fetch('../php/autenticar.php', {
        method: 'POST',
        body: datos
    })
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (resultado) {
        if (resultado != null && resultado.ok == true) {
            sessionStorage.setItem('sesion', resultado.usuario.cedula);
            sessionStorage.setItem('rol', resultado.usuario.rol);
            sessionStorage.setItem('nombre', resultado.usuario.nombre + ' ' + resultado.usuario.apellido);
            window.location.href = destino;
            return;
        }

        var mensaje = 'No se pudo iniciar sesión.';
        if (resultado != null && resultado.mensaje != null) {
            mensaje = resultado.mensaje;
        }

        alert(mensaje);
        campoCedula.focus();
    })
    .catch(function () {
        alert('No se pudo conectar con el servidor.');
    });
});
