// auth.js - Proteccion de paginas: exige una sesion activa antes de continuar.
(function () {

    // Se recupera la sesion guardada por el login (sessionStorage o localStorage).
    var sesionActiva = sessionStorage.getItem('sesion') || localStorage.getItem('sesion');



    // Si no hay sesion activa, se avisa y se redirige al login de funcionarios.
    if (!sesionActiva) {

        alert('Debe iniciar sesión para acceder a esta sección.');
        window.location.replace('login_Funcionario.html');

    }

})();
