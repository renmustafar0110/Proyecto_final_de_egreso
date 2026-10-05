var botonMenu = document.getElementById('menu-btn');
var panelMenu = document.getElementById('menu-panel');
var botonCerrar = document.getElementById('menu-cerrar');

botonMenu.onclick = function () {
    panelMenu.classList.toggle('abierto');
};

botonCerrar.onclick = function () {
    panelMenu.classList.remove('abierto');
};