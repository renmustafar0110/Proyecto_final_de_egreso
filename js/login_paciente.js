// login_paciente.js - Controla el formulario de acceso de pacientes por cedula.
// Espera a que el DOM este listo para controlar el formulario de login.
document.addEventListener('DOMContentLoaded', function () {
    var formulario = document.getElementById('form-login');
    var campoCedula = document.getElementById('cedula');



    // Si la pagina no tiene el formulario, no hay nada que hacer.
    if (!formulario) {
        return;
    }



    // Se intercepta el envio para validar la cedula y autenticar por fetch.
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();



        // Se normaliza la cedula eliminando espacios.
        var cedula = campoCedula.value.trim();



        // Validaciones del campo: no vacio y solo numeros.
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



        // Datos que se envian al backend.
        var datos = new FormData();
        datos.append('cedula', cedula);



        // Se envia la cedula al servidor y se procesa la respuesta JSON.
        fetch('../php/login_paciente.php', {
            method: 'POST',
            body: datos
        })
            .then(function (respuesta) {
                return respuesta.json();
            })
            .then(function (resultado) {
                // Login correcto: se abre el buscador de documentos del paciente.
                if (resultado && resultado.ok === true) {
                    window.location.href = 'buscador_Documentos.html';
                    return;
                }



                // Si falla, se muestra el mensaje devuelto por el servidor.
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
