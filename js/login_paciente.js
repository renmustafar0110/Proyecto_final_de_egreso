document.addEventListener('DOMContentLoaded', function () {
    var formulario = document.getElementById('form-login');
    var campoCedula = document.getElementById('cedula');

    if (!formulario) {
        return;
    }

    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        var cedula = campoCedula.value.trim();

        if (cedula === '') {
            alert('Ingrese su cédula.');
            campoCedula.focus();
            return;
        }

        if (!/^\d+$/.test(cedula)) {
            alert('La cédula solo debe contener números.');
            campoCedula.focus();
            return;
        }

        var datos = new FormData();
        datos.append('cedula', cedula);

        fetch('../php/login_paciente.php', {
            method: 'POST',
            body: datos
        })
            .then(function (respuesta) {
                return respuesta.json();
            })
            .then(function (resultado) {
                if (resultado && resultado.ok === true) {
                    window.location.href = 'buscador_Documentos.html';
                    return;
                }

                var mensaje = 'No se pudo iniciar sesión.';
                if (resultado && resultado.mensaje) {
                    mensaje = resultado.mensaje;
                }

                alert(mensaje);
                campoCedula.focus();
            })
            .catch(function () {
                alert('No se pudo conectar con el servidor.');
            });
    });
});
