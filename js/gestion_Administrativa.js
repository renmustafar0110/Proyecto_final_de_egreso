// gestion_Administrativa.js - Alta de funcionarios y pacientes desde el panel administrativo.
// Referencias a los dos formularios y a sus contenedores de mensajes.
(function () {

    var formularioFuncionario = document.getElementById('form-funcionario');
    var formularioPaciente = document.getElementById('form-paciente');
    var mensajeFuncionario = document.getElementById('mensaje-funcionario');
    var mensajePaciente = document.getElementById('mensaje-paciente');



    // Muestra un mensaje de exito o error dentro del formulario.
    function mostrarMensaje(elemento, texto, esError) {
        if (!elemento) {
            return;
        }



        elemento.textContent = texto;
        elemento.className = 'form-mensaje ' + (esError ? 'mensaje-error' : 'mensaje-exito');
    }



    // Limpia el mensaje anterior del formulario.
    function limpiarMensaje(elemento) {
        if (!elemento) {
            return;
        }



        elemento.textContent = '';
        elemento.className = 'form-mensaje';
    }



    // Conecta un formulario con registrarUsuario.php y controla el boton mientras guarda.
    function enviar(formulario, accion, elementoMensaje) {
        if (!formulario) {
            return;
        }



        // Se evita el envio tradicional y se manda el formulario por fetch.
        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();



            // Se agrega la accion (funcionario o paciente) a los datos enviados.
            var boton = formulario.querySelector('input[type="submit"]');
            var datos = new FormData(formulario);



            datos.append('accion', accion);



            limpiarMensaje(elementoMensaje);



            // Mientras se guarda, se bloquea el boton para evitar envios duplicados.
            if (boton) {
                boton.disabled = true;
                boton.value = 'Guardando...';
            }



            // Se envian los datos al backend.
            fetch('../php/registrarUsuario.php', {
                method: 'POST',
                body: datos
            })
                .then(function (respuesta) {
                    return respuesta.json();
                })
                .then(function (resultado) {
                    // Si el registro fue correcto, se muestra el mensaje y se limpia el formulario.
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
                // Al terminar, se restaura el boton.
                .then(function () {
                    if (boton) {
                        boton.disabled = false;
                        boton.value = accion == 'funcionario' ? 'Registrar Funcionario' : 'Registrar Paciente';
                    }
                });
        });
    }



    // Se activan los dos formularios de la pagina.
    enviar(formularioFuncionario, 'funcionario', mensajeFuncionario);
    enviar(formularioPaciente, 'paciente', mensajePaciente);

})();
