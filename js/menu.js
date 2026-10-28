(function () {

    var botonesMenu = document.querySelectorAll('.menu-btn');
    var panelesMenu = document.querySelectorAll('.menu-panel');
    var botonesCerrar = document.querySelectorAll('.menu-cerrar');


    function cerrarPaneles() {

        var i;

        for (i = 0; i < panelesMenu.length; i++) {

            panelesMenu[i].classList.remove('abierto');

        }

        for (i = 0; i < botonesMenu.length; i++) {

            botonesMenu[i].classList.remove('activo');

        }

    }


    function alternarPanel(boton) {

        var panel = document.getElementById(boton.getAttribute('data-menu'));

        if (!panel) {
            return;
        }

        var estabaAbierto = panel.classList.contains('abierto');

        cerrarPaneles();

        if (!estabaAbierto) {

            panel.classList.add('abierto');
            boton.classList.add('activo');

        }

    }


    function cerrarSesion() {

        fetch('../php/cerrar_sesion.php', { method: 'POST' })
            .catch(function () {})
            .then(function () {

                sessionStorage.clear();
                localStorage.clear();

                window.location.replace('login_Funcionario.html');

            });

    }


    function agregarBotonSalir() {

        var sesionActiva = sessionStorage.getItem('sesion') || localStorage.getItem('sesion');

        if (!sesionActiva) {
            return;
        }

        for (var i = 0; i < panelesMenu.length; i++) {

            var enlace = document.createElement('a');

            enlace.href = '#';
            enlace.className = 'menu-opcion';
            enlace.textContent = 'Cerrar sesión';

            enlace.onclick = function (evento) {

                evento.preventDefault();
                cerrarSesion();

            };

            panelesMenu[i].appendChild(enlace);

        }

    }


    for (var i = 0; i < botonesMenu.length; i++) {

        botonesMenu[i].onclick = function () {

            alternarPanel(this);

        };

    }


    for (var j = 0; j < botonesCerrar.length; j++) {

        botonesCerrar[j].onclick = cerrarPaneles;

    }


    agregarBotonSalir();

})();
