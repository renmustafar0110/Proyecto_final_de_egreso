var COORDENADAS_HOSPITAL = {
    latitud: -34.9069,
    longitud: -56.1913
};

var mapa = null;
var capaAmbulancias = null;

function obtenerMapa() {
    if (mapa) {
        return mapa;
    }

    if (typeof L === 'undefined') {
        return null;
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

    return mapa;
}

function obtenerClaseDeEstado(estado) {
    switch (estado) {
        case 'Disponible':
            return 'disponible';
        case 'Reservado':
            return 'reservado';
        case 'En curso':
            return 'en_curso';
        case 'En ruta':
            return 'en_ruta';
        case 'Finalizado':
            return 'finalizado';
        default:
            return 'disponible';
    }
}

function calcularPosicion(indice) {
    var radio = 0.004 + indice * 0.0032;
    var angulo = indice * 2.399963;

    return [
        COORDENADAS_HOSPITAL.latitud + radio * 0.72 * Math.cos(angulo),
        COORDENADAS_HOSPITAL.longitud + radio * Math.sin(angulo)
    ];
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
    return L.divIcon({
        className: 'marcador-contenedor',
        html: '<div class="marcador-ambulancia ' + obtenerClaseDeEstado(estado) + '">&#128165;</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
    });
}

function escaparTexto(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function armarContenidoPopup(ambulancia) {
    var ruta = escaparTexto(ambulancia.origen) + ' &rarr; ' + escaparTexto(ambulancia.destino);

    var detalle = '';

    if (ambulancia.id_traslado) {
        var salida = ambulancia.hora_salida ? escaparTexto(ambulancia.hora_salida) : '--';
        var llegada = ambulancia.hora_llegada ? escaparTexto(ambulancia.hora_llegada) : '--';

        detalle = '<div class="popup-detalle">' + ruta + '</div>' +
            '<div class="popup-detalle">Salida: ' + salida + ' &middot; Llegada: ' + llegada + '</div>';
    }

    return '<div class="popup-ambulancia">' +
        '<div class="popup-titulo">Coche ' + escaparTexto(ambulancia.numero_coche) + '</div>' +
        '<div class="popup-estado ' + obtenerClaseDeEstado(ambulancia.estado) + '">' +
        escaparTexto(ambulancia.estado) + '</div>' +
        detalle +
        '</div>';
}

function dibujarAmbulancias(ambulancias) {
    if (!capaAmbulancias) {
        return;
    }

    capaAmbulancias.clearLayers();

    L.marker([COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud], {
        icon: crearIconoHospital(),
        zIndexOffset: 500
    })
        .addTo(capaAmbulancias)
        .bindPopup('<div class="popup-ambulancia"><div class="popup-titulo">Hospital de Cl&iacute;nicas</div>' +
            '<div class="popup-detalle">Punto de partida y retorno</div></div>');

    for (var i = 0; i < ambulancias.length; i++) {
        var ambulancia = ambulancias[i];

        L.marker(calcularPosicion(i), {
            icon: crearIconoAmbulancia(ambulancia.estado)
        })
            .addTo(capaAmbulancias)
            .bindPopup(armarContenidoPopup(ambulancia));
    }

    ajustarVista(ambulancias.length);
}

function ajustarVista(cantidad) {
    if (cantidad === 0) {
        mapa.setView([COORDENADAS_HOSPITAL.latitud, COORDENADAS_HOSPITAL.longitud], 15);
        return;
    }

    if (cantidad === 1) {
        mapa.setView(calcularPosicion(0), 16);
        return;
    }

    mapa.fitBounds(capaAmbulancias.getBounds().pad(0.35), { maxZoom: 16 });
}

function obtenerAmbulancias() {
    return fetch('../php/trazabilidad.php', { method: 'GET' })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            return [];
        });
}

function mostrarMensajeEnMapa(texto) {
    var contenedor = document.getElementById('mapa');

    if (!contenedor || !mapa) {
        return;
    }

    var aviso = L.control({ position: 'topright' });

    aviso.onAdd = function () {
        var caja = document.createElement('div');
        caja.className = 'mapa-aviso';
        caja.textContent = texto;
        return caja;
    };

    aviso.addTo(mapa);
}

function iniciarMapa() {
    var mapaBase = obtenerMapa();

    if (!mapaBase) {
        var contenedor = document.getElementById('mapa');

        if (contenedor) {
            contenedor.innerHTML = '<p class="mapa-placeholder">No se pudo cargar la librer&iacute;a del mapa. Verific&aacute; la conexi&oacute;n a internet.</p>';
        }

        return;
    }

    capaAmbulancias = L.layerGroup().addTo(mapaBase);

    obtenerAmbulancias().then(function (ambulancias) {
        if (!Array.isArray(ambulancias)) {
            mostrarMensajeEnMapa('No se pudieron obtener las ambulancias');
            return;
        }

        dibujarAmbulancias(ambulancias);
    });

    window.addEventListener('resize', function () {
        mapaBase.invalidateSize();
    });
}

document.addEventListener('DOMContentLoaded', iniciarMapa);