var botonesMenu = document.querySelectorAll('.menu-btn');
var panelesMenu = document.querySelectorAll('.menu-panel');
var botonesCerrar = document.querySelectorAll('.menu-cerrar');

function cerrarPaneles() {
    for (var i = 0; i < panelesMenu.length; i++) {
        panelesMenu[i].classList.remove('abierto');
    }
    for (var j = 0; j < botonesMenu.length; j++) {
        botonesMenu[j].classList.remove('activo');
    }
}

for (var k = 0; k < botonesMenu.length; k++) {
    botonesMenu[k].onclick = function () {
        var boton = this;
        var destino = document.getElementById(boton.getAttribute('data-menu'));
        var estabaAbierto = destino.classList.contains('abierto');

        cerrarPaneles();

        if (!estabaAbierto) {
            destino.classList.add('abierto');
            boton.classList.add('activo');
        }
    };
}

for (var l = 0; l < botonesCerrar.length; l++) {
    botonesCerrar[l].onclick = cerrarPaneles;
}

function cerrarSesion() {
    fetch('../php/cerrar_sesion.php', { method: 'POST' })
        .catch(function () {})
        .then(function () {
            sessionStorage.clear();
            window.location.replace('login_Funcionario.html');
        });
}

function agregarBotonSalir() {
    if (!sessionStorage.getItem('sesion')) {
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

agregarBotonSalir();
