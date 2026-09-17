// Menú lateral deslizante de las páginas internas

// Obtiene el botón del menú, el panel y el botón de cerrar
var botonMenu = document.getElementById('menu-btn');
var panelMenu = document.getElementById('menu-panel');
var botonCerrar = document.getElementById('menu-cerrar');

// Al hacer clic en el botón abre o cierra el panel
botonMenu.onclick = function () {
    panelMenu.classList.toggle('abierto');
};

// Al hacer clic en la X cierra el panel
botonCerrar.onclick = function () {
    panelMenu.classList.remove('abierto');
};

// Busca las opciones del menú
var opciones = panelMenu.querySelectorAll('.menu-opcion');

// Al hacer clic en una opción cierra el panel
for (var i = 0; i < opciones.length; i++) {
    opciones[i].onclick = function () {
        panelMenu.classList.remove('abierto');
    };
}