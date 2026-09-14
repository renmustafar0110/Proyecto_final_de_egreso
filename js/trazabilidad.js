var AMBULANCIAS_INICIALES = [
    { matricula: 'ABC 1234', numero_coche: '01', estado: 'Disponible' },
    { matricula: 'DEF 5678', numero_coche: '02', estado: 'En curso' },
    { matricula: 'GHI 9012', numero_coche: '03', estado: 'En ruta' }
];

var ESTADOS = ['Disponible', 'En curso', 'En ruta'];

var canalTiempoReal = ('BroadcastChannel' in window)
    ? new BroadcastChannel('ambulancias-estado')
    : null;

function obtenerAmbulancias() {
    var guardadas = localStorage.getItem('ambulancias');
    if (guardadas) {
        try {
            return JSON.parse(guardadas);
        } catch (e) {
            return AMBULANCIAS_INICIALES.slice();
        }
    }
    return AMBULANCIAS_INICIALES.slice();
}

function guardarAmbulancias(ambulancias) {
    localStorage.setItem('ambulancias', JSON.stringify(ambulancias));
}

function notificarCambio(matricula, estado, numeroCoche) {
    if (canalTiempoReal) {
        canalTiempoReal.postMessage({ matricula: matricula, estado: estado, numero_coche: numeroCoche });
    }
}

if (canalTiempoReal) {
    canalTiempoReal.onmessage = function (evento) {
        var dato = evento.data;
        if (dato && dato.matricula) {
            var ambulancias = obtenerAmbulancias();
            for (var i = 0; i < ambulancias.length; i++) {
                if (ambulancias[i].matricula === dato.matricula) {
                    ambulancias[i].estado = dato.estado;
                    break;
                }
            }
            guardarAmbulancias(ambulancias);
            renderizarTabla();
        }
    };
}

function claseEstado(estado) {
    switch (estado) {
        case 'Disponible': return 'disponible';
        case 'En curso': return 'en_curso';
        case 'En ruta': return 'en_ruta';
        case 'Finalizado': return 'finalizado';
        default: return '';
    }
}

function cambiarEstado(ambulancia, nuevoEstado) {
    if (nuevoEstado === 'Finalizado') {
        nuevoEstado = 'Disponible';
    }

    var ambulancias = obtenerAmbulancias();
    for (var i = 0; i < ambulancias.length; i++) {
        if (ambulancias[i].matricula === ambulancia.matricula) {
            ambulancias[i].estado = nuevoEstado;
            break;
        }
    }
    guardarAmbulancias(ambulancias);
    notificarCambio(ambulancia.matricula, nuevoEstado, ambulancia.numero_coche);
    renderizarTabla();
}

function renderizarTabla() {
    var cuerpo = document.getElementById('tabla-ambulancias');
    if (!cuerpo) return;

    var ambulancias = obtenerAmbulancias();
    var filas = '';

    for (var i = 0; i < ambulancias.length; i++) {
        var ambulancia = ambulancias[i];
        var botones = '';
        for (var j = 0; j < ESTADOS.length; j++) {
            var estado = ESTADOS[j];
            var activo = (estado === ambulancia.estado) ? ' activo' : '';
            botones += '<button type="button" class="btn-estado' + activo + '" data-matricula="' +
                ambulancia.matricula + '" data-estado="' + estado + '">' + estado + '</button>';
        }
        botones += '<button type="button" class="btn-estado btn-finalizado" data-matricula="' +
            ambulancia.matricula + '" data-estado="Finalizado">Finalizar</button>';

        filas += '<tr>' +
            '<td>' + ambulancia.matricula + '</td>' +
            '<td>' + ambulancia.numero_coche + '</td>' +
            '<td><span class="estado ' + claseEstado(ambulancia.estado) + '">' + ambulancia.estado + '</span></td>' +
            '<td>' + botones + '</td>' +
            '<td><a href="GestionT.html" class="btn-mandar">Mandar</a></td>' +
            '</tr>';
    }

    cuerpo.innerHTML = filas;
}

document.addEventListener('click', function (evento) {
    var boton = evento.target;
    if (boton.classList && boton.classList.contains('btn-estado')) {
        var matricula = boton.getAttribute('data-matricula');
        var estado = boton.getAttribute('data-estado');
        var ambulancias = obtenerAmbulancias();
        for (var i = 0; i < ambulancias.length; i++) {
            if (ambulancias[i].matricula === matricula) {
                cambiarEstado(ambulancias[i], estado);
                break;
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    renderizarTabla();
});

window.addEventListener('storage', function (evento) {
    if (evento.key === 'ambulancias') {
        renderizarTabla();
    }
});

renderizarTabla();