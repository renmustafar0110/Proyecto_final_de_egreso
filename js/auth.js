(function () {

    var sesionActiva = sessionStorage.getItem('sesion') || localStorage.getItem('sesion');

    if (!sesionActiva) {

        alert('Debe iniciar sesión para acceder a esta sección.');
        window.location.replace('login_Funcionario.html');

    }

})();
