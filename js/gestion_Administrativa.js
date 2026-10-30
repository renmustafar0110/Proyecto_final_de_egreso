(function () {

    var formularioFuncionario = document.getElementById('form-funcionario');
    var formularioPaciente = document.getElementById('form-paciente');
    var mensajeFuncionario = document.getElementById('mensaje-funcionario');
    var mensajePaciente = document.getElementById('mensaje-paciente');

    function mostrarMensaje(elemento, texto, esError) {
        if (!elemento) {
            return;
        }

        elemento.textContent = texto;
        elemento.className = 'form-mensaje ' + (esError ? 'mensaje-error' : 'mensaje-exito');
    }

    function limpiarMensaje(elemento) {
        if (!elemento) {
            return;
        }

        elemento.textContent = '';
        elemento.className = 'form-mensaje';
    }

    function enviar(formulario, accion, elementoMensaje) {
        if (!formulario) {
            return;
        }

        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();

            var boton = formulario.querySelector('input[type="submit"]');
            var datos = new FormData(formulario);

            datos.append('accion', accion);

            limpiarMensaje(elementoMensaje);

            if (boton) {
                boton.disabled = true;
                boton.value = 'Guardando...';
            }

            fetch('../php/registrarUsuario.php', {
                method: 'POST',
                body: datos
            })
                .then(function (respuesta) {
                    return respuesta.json();
                })
                .then(function (resultado) {
                    if (resultado && resultado.ok === true) {
                        mostrarMensaje(elementoMensaje, resultado.mensaje, false);
                        formulario.reset();
                        return;
                    }

                    var mensaje = 'No se pudo completar el registro.';

                    if (resultado && resultado.mensaje) {
                        mensaje = resultado.mensaje;
                    }

                    mostrarMensaje(elementoMensaje, mensaje, true);
                })
                .catch(function () {
                    mostrarMensaje(elementoMensaje, 'No se pudo conectar con el servidor.', true);
                })
                .then(function () {
                    if (boton) {
                        boton.disabled = false;
                        boton.value = accion == 'funcionario' ? 'Registrar Funcionario' : 'Registrar Paciente';
                    }
                });
        });
    }

    enviar(formularioFuncionario, 'funcionario', mensajeFuncionario);
    enviar(formularioPaciente, 'paciente', mensajePaciente);

})();
