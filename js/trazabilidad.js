var datosInicialesAmbulancias = [
    { matricula: 'ABC 1234', numero_coche: '01', estado: 'Disponible' },
    { matricula: 'DEF 5678', numero_coche: '02', estado: 'En curso' },
    { matricula: 'GHI 9012', numero_coche: '03', estado: 'En ruta' }
];

var listaDeEstados = ['Disponible', 'En curso', 'En ruta'];

var canalTiempoReal = null;
if ('BroadcastChannel' in window) {
    canalTiempoReal = new BroadcastChannel('ambulancias-estado');
}

function obtenerAmbulancias() {
    var datosGuardados = localStorage.getItem('ambulancias');

    if (!datosGuardados) {
        return datosInicialesAmbulancias.slice();
    }

    try {
        return JSON.parse(datosGuardados);
    } catch (error) {
        return datosInicialesAmbulancias.slice();
    }
}

function guardarAmbulancias(listaDeAmbulancias) {
    var texto = JSON.stringify(listaDeAmbulancias);
    localStorage.setItem('ambulancias', texto);
}

function notificarCambio(matricula, estado, numeroCoche) {
    if (canalTiempoReal) {
        var mensaje = {
            matricula: matricula,
            estado: estado,
            numero_coche: numeroCoche
        };
        canalTiempoReal.postMessage(mensaje);
    }
}

if (canalTiempoReal) {
    canalTiempoReal.onmessage = function (evento) {
        var datoRecibido = evento.data;

        if (datoRecibido && datoRecibido.matricula) {
            var listaDeAmbulancias = obtenerAmbulancias();

            for (var i = 0; i < listaDeAmbulancias.length; i++) {
                if (listaDeAmbulancias[i].matricula === datoRecibido.matricula) {
                    listaDeAmbulancias[i].estado = datoRecibido.estado;
                    break;
                }
            }

            guardarAmbulancias(listaDeAmbulancias);
            renderizarTabla();
        }
    };
}

function obtenerClaseDeEstado(estado) {
    switch (estado) {
        case 'Disponible':
            return 'disponible';
        case 'En curso':
            return 'en_curso';
        case 'En ruta':
            return 'en_ruta';
        case 'Finalizado':
            return 'finalizado';
        default:
            return '';
    }
}

function cambiarEstado(ambulancia, nuevoEstado) {
    if (nuevoEstado === 'Finalizado') {
        nuevoEstado = 'Disponible';
    }

    var listaDeAmbulancias = obtenerAmbulancias();

    for (var i = 0; i < listaDeAmbulancias.length; i++) {
        if (listaDeAmbulancias[i].matricula === ambulancia.matricula) {
            listaDeAmbulancias[i].estado = nuevoEstado;
            break;
        }
    }

    guardarAmbulancias(listaDeAmbulancias);
    notificarCambio(ambulancia.matricula, nuevoEstado, ambulancia.numero_coche);
    renderizarTabla();
}

function renderizarTabla() {
    var cuerpoDeLaTabla = document.getElementById('tabla-ambulancias');

    if (!cuerpoDeLaTabla) {
        return;
    }

    var listaDeAmbulancias = obtenerAmbulancias();
    var filasDeLaTabla = '';

    for (var i = 0; i < listaDeAmbulancias.length; i++) {
        var ambulancia = listaDeAmbulancias[i];

        var botones = '';
        for (var j = 0; j < listaDeEstados.length; j++) {
            var estadoActual = listaDeEstados[j];
            var claseActiva = '';

            if (estadoActual === ambulancia.estado) {
                claseActiva = ' activo';
            }

            botones += '<button type="button" class="btn-estado' + claseActiva + '" ' +
                       'data-matricula="' + ambulancia.matricula + '" ' +
                       'data-estado="' + estadoActual + '">' + estadoActual + '</button>';
        }

        botones += '<button type="button" class="btn-estado btn-finalizado" ' +
                   'data-matricula="' + ambulancia.matricula + '" ' +
                   'data-estado="Finalizado">Finalizar</button>';

        var claseDelEstado = obtenerClaseDeEstado(ambulancia.estado);
        filasDeLaTabla += '<tr>' +
            '<td>' + ambulancia.matricula + '</td>' +
            '<td>' + ambulancia.numero_coche + '</td>' +
            '<td><span class="estado ' + claseDelEstado + '">' + ambulancia.estado + '</span></td>' +
            '<td>' + botones + '</td>' +
            '<td><a href="GestionT.html" class="btn-mandar">Mandar</a></td>' +
            '</tr>';
    }

    cuerpoDeLaTabla.innerHTML = filasDeLaTabla;
}

document.addEventListener('click', function (evento) {
    var elementoClickeado = evento.target;

    if (elementoClickeado.classList && elementoClickeado.classList.contains('btn-estado')) {
        var matricula = elementoClickeado.getAttribute('data-matricula');
        var estadoElegido = elementoClickeado.getAttribute('data-estado');

        var listaDeAmbulancias = obtenerAmbulancias();

        for (var i = 0; i < listaDeAmbulancias.length; i++) {
            if (listaDeAmbulancias[i].matricula === matricula) {
                cambiarEstado(listaDeAmbulancias[i], estadoElegido);
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