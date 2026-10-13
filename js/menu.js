var botonMenu = document.getElementById('menu-btn');
var panelMenu = document.getElementById('menu-panel');
var botonCerrar = document.getElementById('menu-cerrar');

botonMenu.onclick = function () {
    panelMenu.classList.toggle('abierto');
};

botonCerrar.onclick = function () {
    panelMenu.classList.remove('abierto');
};

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

    var enlace = document.createElement('a');
    enlace.href = '#';
    enlace.className = 'menu-opcion';
    enlace.textContent = 'Cerrar sesión';
    enlace.onclick = function (evento) {
        evento.preventDefault();
        cerrarSesion();
    };

    panelMenu.appendChild(enlace);
}

agregarBotonSalir();
