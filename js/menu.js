(function () {

    var botonesMenu = document.querySelectorAll('.menu-btn');
    var panelesMenu = document.querySelectorAll('.menu-panel');
    var botonesCerrar = document.querySelectorAll('.menu-cerrar');


    // CU-01 / PRD 7.3: oculta los menús de módulos que el rol del
    // funcionario no tiene asignados (super_admin y "ambos" ven todo).
    function restringirMenuPorRol() {

        var rol = sessionStorage.getItem('rol') || localStorage.getItem('rol');

        if (!rol || rol == 'super_admin' || rol == 'ambos') {
            return;
        }

        var veDocumentos = (rol == 'admin_documentos');
        var veAmbulancias = (rol == 'admin_ambulancias');

        ocultarGrupo('menu-documentos', !veDocumentos);
        ocultarGrupo('menu-trazabilidad', !veAmbulancias);
        ocultarGrupo('menu-estadisticas', !veDocumentos);

        // Pantalla de elección de módulo (eleccion_Funcionario.html)
        var accesosModulos = document.querySelectorAll('ul.menu a');

        for (var i = 0; i < accesosModulos.length; i++) {

            var href = accesosModulos[i].getAttribute('href') || '';
            var esModuloAmbulancias = (href.indexOf('trazabilidad.html') !== -1
                || href.indexOf('panel_Traslados.html') !== -1
                || href.indexOf('vistaPreviaT.html') !== -1);

            if (esModuloAmbulancias && !veAmbulancias) {
                ocultarElemento(accesosModulos[i].parentNode);
            } else if (!esModuloAmbulancias && !veDocumentos) {
                ocultarElemento(accesosModulos[i].parentNode);
            }

        }

    }


    function ocultarElemento(elemento) {

        if (elemento) {
            elemento.style.display = 'none';
        }

    }


    function ocultarGrupo(idPanel, ocultar) {

        if (!ocultar) {
            return;
        }

        var panel = document.getElementById(idPanel);

        if (panel) {
            panel.style.display = 'none';
        }

        var boton = document.querySelector('.menu-btn[data-menu="' + idPanel + '"]');

        if (boton) {
            boton.style.display = 'none';
        }

    }


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


    restringirMenuPorRol();

    agregarBotonSalir();

})();
