var COORDENADAS_HOSPITAL = {
    latitud: -34.9069,
    longitud: -56.1913
};

var mapa = null;
var capaAmbulancias = null;

function calcularPosicion(indice) {
    var filas = Math.floor(indice / 3);
    var columna = indice % 3;

    var latitud = COORDENADAS_HOSPITAL.latitud + 0.003 + filas * 0.003;
    var longitud = COORDENADAS_HOSPITAL.longitud - 0.003 + columna * 0.003;

    return [latitud, longitud];
}

function escaparTexto(valor) {
    if (valor == null || valor == '') {
        return '—';
    }

    var texto = String(valor);
    texto = texto.replace(/&/g, '&amp;');
    texto = texto.replace(/</g, '&lt;');
    texto = texto.replace(/>/g, '&gt;');
    texto = texto.replace(/"/g, '&quot;');

    return texto;
}

function crearIconoHospital() {
    return L.divIcon({
        className: 'marcador-contenedor',
        html: '<div class="marcador-hospital">H</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
    });
}

function crearIconoAmbulancia(estado) {
    var clase = obtenerClaseDeEstado(estado);

    return L.divIcon({
        className: 'marcador-contenedor',
        html: '<div class="marcador-ambulancia ' + clase + '">&#128165;</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
    });
}

function armarContenidoPopup(ambulancia) {
    var origen = escaparTexto(ambulancia.origen);
    var destino = escaparTexto(ambulancia.destino);
    var ruta = origen + ' &rarr; ' + destino;

    var detalle = '';

    if (ambulancia.id_traslado) {
        var salida = escaparTexto(ambulancia.hora_salida);
        var llegada = escaparTexto(ambulancia.hora_llegada);

        if (salida == '—') {
            salida = '--';
        }

        if (llegada == '—') {
            llegada = '--';
        }

        detalle = '<div class="popup-detalle">' + ruta + '</div>' +
            '<div class="popup-detalle">Salida: ' + salida + ' &middot; Llegada: ' + llegada + '</div>';
    }

    var titulo = '<div class="popup-titulo">Coche ' + escaparTexto(ambulancia.numero_coche) + '</div>';
    var claseEstado = obtenerClaseDeEstado(ambulancia.estado);

    var estado = '<div class="popup-estado ' + claseEstado + '">' +
        escaparTexto(ambulancia.estado) + '</div>';

    return '<div class="popup-ambulancia">' + titulo + estado + detalle + '</div>';
}

function dibujarAmbulancias(ambulancias) {
    if (capaAmbulancias == null) {
        return;
    }

    capaAmbulancias.clearLayers();

    var iconoHospital = crearIconoHospital();

    L.marker([COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud], {
        icon: iconoHospital,
        zIndexOffset: 500
    })
        .addTo(capaAmbulancias)
        .bindPopup('<div class="popup-ambulancia"><div class="popup-titulo">Hospital de Cl&iacute;nicas</div>' +
            '<div class="popup-detalle">Punto de partida y retorno</div></div>');

    for (var i = 0; i < ambulancias.length; i++) {
        var ambulancia = ambulancias[i];
        var posicion = calcularPosicion(i);
        var icono = crearIconoAmbulancia(ambulancia.estado);

        L.marker(posicion, { icon: icono })
            .addTo(capaAmbulancias)
            .bindPopup(armarContenidoPopup(ambulancia));
    }

    ajustarVista(ambulancias.length);
}

function ajustarVista(cantidad) {
    if (cantidad == 0) {
        mapa.setView([COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud], 15);
        return;
    }

    if (cantidad == 1) {
        mapa.setView(calcularPosicion(0), 16);
        return;
    }

    mapa.fitBounds(capaAmbulancias.getBounds().pad(0.35), { maxZoom: 16 });
}

function iniciarMapa() {
    var contenedor = document.getElementById('mapa');

    if (typeof L == 'undefined') {
        if (contenedor) {
            contenedor.innerHTML = '<p class="mapa-placeholder">No se pudo cargar la librer&iacute;a del mapa. Verific&aacute; la conexi&oacute;n a internet.</p>';
        }

        return;
    }

    mapa = L.map('mapa', {
        center: [COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud],
        zoom: 15,
        scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);

    capaAmbulancias = L.layerGroup().addTo(mapa);

    obtenerAmbulancias().then(function (ambulancias) {
        dibujarAmbulancias(ambulancias);
    });

    window.addEventListener('resize', function () {
        mapa.invalidateSize();
    });
}

document.addEventListener('DOMContentLoaded', iniciarMapa);
