var COORDENADAS_HOSPITAL = {
    latitud: -34.9069,
    longitud: -56.1913
};

var COORDENADAS_DEPARTAMENTOS = {
    'Artigas': [-30.4000, -56.4667],
    'Canelones': [-34.5228, -56.2778],
    'Cerro Largo': [-32.3711, -54.1667],
    'Colonia': [-34.4667, -57.8333],
    'Durazno': [-33.3833, -56.5167],
    'Flores': [-33.5167, -56.8833],
    'Florida': [-34.1000, -56.2167],
    'Lavalleja': [-34.3667, -55.2333],
    'Maldonado': [-34.9000, -54.9500],
    'Montevideo': [-34.9011, -56.1645],
    'Paysandú': [-32.3214, -58.0756],
    'Río Negro': [-33.1000, -58.3000],
    'Rivera': [-30.9025, -55.5508],
    'Rocha': [-34.4833, -54.3333],
    'Salto': [-31.3833, -57.9667],
    'San José': [-34.3375, -56.7136],
    'Soriano': [-33.5000, -57.7500],
    'Tacuarembó': [-31.7333, -55.9833],
    'Treinta y Tres': [-33.2333, -54.3833]
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

function obtenerCoordenadasDestino(destino) {
    if (destino == null) {
        return null;
    }

    var clave = String(destino).trim();

    if (COORDENADAS_DEPARTAMENTOS[clave]) {
        return COORDENADAS_DEPARTAMENTOS[clave];
    }

    return null;
}

function factorDeEstado(estado) {
    if (estado == 'En curso') {
        return 0.35;
    }

    if (estado == 'En ruta') {
        return 0.6;
    }

    if (estado == 'Llegada a destino') {
        return 1;
    }

    if (estado == 'Retorno') {
        return 0.4;
    }

    return 0;
}

function calcularPosicionEnRuta(origen, destino, estado) {
    var factor = factorDeEstado(estado);

    var latitud = origen[0] + (destino[0] - origen[0]) * factor;
    var longitud = origen[1] + (destino[1] - origen[1]) * factor;

    return [latitud, longitud];
}

function escaparTexto(valor) {
    if (valor == null || valor == '') {
        return '—';
    }

    return escapar(valor);
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

function crearIconoDestino() {
    return L.divIcon({
        className: 'marcador-contenedor',
        html: '<div class="marcador-destino">&#128205;</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
    });
}

function armarContenidoDestino(ambulancia) {
    var destino = escaparTexto(ambulancia.destino);
    var coche = escaparTexto(ambulancia.numero_coche);

    return '<div class="popup-ambulancia">' +
        '<div class="popup-titulo">Destino: ' + destino + '</div>' +
        '<div class="popup-detalle">Coche ' + coche + '</div>' +
        '</div>';
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
    var origen = [COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud];

    L.marker(origen, {
        icon: iconoHospital,
        zIndexOffset: 500
    })
        .addTo(capaAmbulancias)
        .bindPopup('<div class="popup-ambulancia"><div class="popup-titulo">Hospital de Cl&iacute;nicas</div>' +
            '<div class="popup-detalle">Punto de partida y retorno</div></div>');

    var libres = 0;

    for (var i = 0; i < ambulancias.length; i++) {
        var ambulancia = ambulancias[i];
        var posicion = null;
        var coordenadasDestino = null;

        if (ambulancia.id_traslado) {
            coordenadasDestino = obtenerCoordenadasDestino(ambulancia.destino);
        }

        if (coordenadasDestino != null) {
            L.polyline([origen, coordenadasDestino], {
                color: '#1e3a5f',
                weight: 3,
                opacity: 0.6,
                dashArray: '6 8'
            }).addTo(capaAmbulancias);

            L.marker(coordenadasDestino, { icon: crearIconoDestino() })
                .addTo(capaAmbulancias)
                .bindPopup(armarContenidoDestino(ambulancia));

            posicion = calcularPosicionEnRuta(origen, coordenadasDestino, ambulancia.estado);
        } else {
            posicion = calcularPosicion(libres);
            libres = libres + 1;
        }

        var icono = crearIconoAmbulancia(ambulancia.estado);

        L.marker(posicion, { icon: icono })
            .addTo(capaAmbulancias)
            .bindPopup(armarContenidoPopup(ambulancia));
    }

    ajustarVista();
}

function ajustarVista() {
    var limites = capaAmbulancias.getBounds();

    if (limites.isValid()) {
        mapa.fitBounds(limites.pad(0.2), { maxZoom: 13 });
        return;
    }

    mapa.setView([COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud], 15);
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
