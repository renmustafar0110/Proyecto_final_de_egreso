// login_Funcionario.js - Login de funcionarios (documentos y/o ambulancias).
// Referencias a los campos del formulario de acceso.
(function () {

    var campoCedula = document.getElementById('cedula');
    var campoPassword = document.getElementById('password');
    var formulario = document.querySelector('form');

    // Sin formulario no hay nada que controlar en esta pagina.
    if (!formulario) {
        return;
    }

    // Se limpia la URL para no dejar datos sensibles al recargar.
    if (window.history && window.history.replaceState) {

        window.history.replaceState(null, '', window.location.pathname);

    }

    // Boton de mostrar/ocultar contrasena y pagina de destino tras el login.
    var togglePassword = document.getElementById('togglePassword');
    var destino = formulario.getAttribute('data-destino');

    // El checkbox cambia el tipo del campo para mostrar u ocultar la contrasena.
    if (togglePassword && campoPassword) {

        togglePassword.addEventListener('change', function () {

            campoPassword.type = togglePassword.checked ? 'text' : 'password';

        });

    }

    // Guarda los datos del usuario en sessionStorage y localStorage.
    function guardarSesion(usuario) {

        var nombreCompleto = usuario.nombre + ' ' + usuario.apellido;

        sessionStorage.setItem('sesion', usuario.cedula);
        sessionStorage.setItem('rol', usuario.rol);
        sessionStorage.setItem('nombre', nombreCompleto);

        localStorage.setItem('sesion', usuario.cedula);
        localStorage.setItem('rol', usuario.rol);
        localStorage.setItem('nombre', nombreCompleto);

    }

    // Muestra el error y deja el formulario listo para reintentar.
    function informarError(mensaje) {

        alert(mensaje);

        campoPassword.value = '';
        campoCedula.focus();
        campoCedula.select();

    }

    // Envio del formulario: validacion local y peticion de login al backend.
    formulario.addEventListener('submit', function (evento) {

        evento.preventDefault();

        // Se normaliza la cedula quitando espacios.
        var cedula = campoCedula.value.replace(/\s+/g, '');
        var password = campoPassword.value;

        // Validacion de campos obligatorios.
        if (cedula === '' || password === '') {

            informarError('Ingrese cédula y contraseña.');

            return;

        }

        // Datos que se envian al servicio de login.
        var datos = new FormData();

        datos.append('cedula', cedula);
        datos.append('password', password);

        // Se autentica contra el PHP y se interpreta la respuesta.
        fetch('../php/login_Funcionario.php', {
            method: 'POST',
            body: datos
        })
            .then(function (respuesta) {

                return respuesta.json();

            })
            .then(function (resultado) {

                // Login correcto: se guarda la sesion y se redirige al destino.
                if (resultado && resultado.ok === true) {

                    guardarSesion(resultado.usuario);
                    window.location.href = destino;

                    return;

                }

                // Si falla, se muestra el mensaje del servidor.
                var mensaje = 'No se pudo iniciar sesión.';

                if (resultado && resultado.mensaje) {

                    mensaje = resultado.mensaje;

                }

                informarError(mensaje);

            })
            .catch(function () {

                informarError('No se pudo conectar con el servidor.');

            });

    });

})();
