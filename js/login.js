(function () {

    var campoCedula = document.getElementById('cedula');
    var campoPassword = document.getElementById('password');
    var formulario = document.querySelector('form');

    if (!formulario) {
        return;
    }


    if (window.history && window.history.replaceState) {

        window.history.replaceState(null, '', window.location.pathname);

    }


    var togglePassword = document.getElementById('togglePassword');
    var destino = formulario.getAttribute('data-destino');
    var tipo = formulario.getAttribute('data-tipo') || 'funcionario';


    if (togglePassword && campoPassword) {

        togglePassword.addEventListener('change', function () {

            campoPassword.type = togglePassword.checked ? 'text' : 'password';

        });

    }


    function guardarSesion(usuario) {

        var nombreCompleto = usuario.nombre + ' ' + usuario.apellido;

        sessionStorage.setItem('sesion', usuario.cedula);
        sessionStorage.setItem('rol', usuario.rol);
        sessionStorage.setItem('nombre', nombreCompleto);

        localStorage.setItem('sesion', usuario.cedula);
        localStorage.setItem('rol', usuario.rol);
        localStorage.setItem('nombre', nombreCompleto);

    }


    function informarError(mensaje) {

        alert(mensaje);

        campoPassword.value = '';
        campoCedula.focus();
        campoCedula.select();

    }


    formulario.addEventListener('submit', function (evento) {

        evento.preventDefault();

        var cedula = campoCedula.value.replace(/\s+/g, '');
        var password = campoPassword.value;

        if (cedula === '' || password === '') {

            informarError('Ingrese cédula y contraseña.');

            return;

        }


        var datos = new FormData();

        datos.append('cedula', cedula);
        datos.append('password', password);
        datos.append('tipo', tipo);


        fetch('../php/autenticar.php', {
            method: 'POST',
            body: datos
        })
            .then(function (respuesta) {

                return respuesta.json();

            })
            .then(function (resultado) {

                if (resultado && resultado.ok === true) {

                    guardarSesion(resultado.usuario);
                    window.location.href = destino;

                    return;

                }


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
