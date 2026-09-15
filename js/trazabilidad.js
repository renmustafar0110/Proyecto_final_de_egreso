// Lógica de la página de Vehículos para Reserva

// Canal para mantener actualizadas las pestañas abiertas
var canalTiempoReal = null;
if ('BroadcastChannel' in window) {
    canalTiempoReal = new BroadcastChannel('vehiculos-reserva');
}

// Consulta la lista de vehículos al servidor
function obtenerVehiculos() {
    return fetch('../php/getAmbulancias.php', { method: 'GET' })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            // Si hay un error se devuelve una lista vacía
            return [];
        });
}

// Avisa a las otras pestañas que cambió algo
function notificarCambio() {
    if (canalTiempoReal) {
        canalTiempoReal.postMessage({ tipo: 'actualizar' });
    }
}

// Si otra pestaña avisa un cambio se vuelve a dibujar la tabla
if (canalTiempoReal) {
    canalTiempoReal.onmessage = function () {
        renderizarTabla();
    };
}

// Devuelve el nombre de la clase de color según el estado del vehículo
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
            return '';
    }
}

// Dibuja la tabla de vehículos con sus acciones
function renderizarTabla() {
    var cuerpoTabla = document.getElementById('tabla-vehiculos');

    if (!cuerpoTabla) {
        return;
    }

    obtenerVehiculos().then(function (vehiculos) {
        // Si no hay vehículos se muestra un mensaje
        if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="3">No hay vehículos cargados.</td></tr>';
            return;
        }

        var filas = '';

        // Se recorre cada vehículo para armar su fila
        for (var i = 0; i < vehiculos.length; i++) {
            var vehiculo = vehiculos[i];
            var accion = '';

            // Se define el botón según el estado del vehículo
            if (vehiculo.estado === 'Disponible') {
                accion = '<button type="button" class="btn-estado btn-reservar" ' +
                         'data-numero="' + vehiculo.numero_coche + '" data-estado="Reservado">Reservar</button>';
            } else if (vehiculo.estado === 'Reservado') {
                accion = '<button type="button" class="btn-estado btn-liberar" ' +
                         'data-numero="' + vehiculo.numero_coche + '" data-estado="Disponible">Liberar</button>' +
                         '<a href="GestionT.html" class="btn-mandar">Gestionar</a>';
            } else {
                accion = '<a href="GestionT.html" class="btn-mandar">Gestionar</a>';
            }

            var claseEstado = obtenerClaseDeEstado(vehiculo.estado);

            // Se arma el detalle del viaje (ruta y horarios)
            var ruta = (vehiculo.origen || '—') + ' → ' + (vehiculo.destino || '—');
            var horaSalida = vehiculo.hora_salida ? 'Salida: ' + vehiculo.hora_salida : 'Salida: --';
            var horaLlegada = vehiculo.hora_llegada ? 'Llegada: ' + vehiculo.hora_llegada : 'Llegada: --';
            var detalleViaje = '<span class="detalle-reserva">' +
                ruta + '<br>' +
                horaSalida + ' · ' + horaLlegada +
                '</span>';

            // Se arma la fila completa del vehículo
            filas += '<tr>' +
                '<td>' + vehiculo.numero_coche + detalleViaje + '</td>' +
                '<td><span class="estado ' + claseEstado + '">' + vehiculo.estado + '</span></td>' +
                '<td>' + accion + '</td>' +
                '</tr>';
        }

        // Se colocan las filas dentro de la tabla
        cuerpoTabla.innerHTML = filas;
    });
}

// Envía al servidor el cambio de estado de un vehículo
function cambiarEstado(numero, estado) {
    var datos = new URLSearchParams();
    datos.append('numero_coche', numero);
    datos.append('estado', estado);

    fetch('../php/updateEstadoAmbulancia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: datos.toString()
    })
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (resultado) {
        // Si se actualizó bien se refresca la tabla y se avisa a las otras pestañas
        if (resultado.ok) {
            notificarCambio();
            renderizarTabla();
        } else {
            alert('Error: ' + (resultado.error || 'No se pudo actualizar el estado.'));
        }
    })
    .catch(function () {
        alert('No se pudo conectar con el servidor.');
    });
}

// Al hacer clic en un botón de la tabla se cambia el estado
document.addEventListener('click', function (evento) {
    var elemento = evento.target;

    if (!elemento.classList) {
        return;
    }

    if (elemento.classList.contains('btn-reservar') || elemento.classList.contains('btn-liberar')) {
        var numero = elemento.getAttribute('data-numero');
        var estado = elemento.getAttribute('data-estado');
        cambiarEstado(numero, estado);
    }
});

// Formulario para cargar un nuevo vehículo
var formularioCarga = document.getElementById('form-cargar-vehiculo');

if (formularioCarga) {
    formularioCarga.addEventListener('submit', function (evento) {
        evento.preventDefault();

        var datos = new FormData(formularioCarga);

        fetch('../php/agregarVehiculo.php', {
            method: 'POST',
            body: datos
        })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            // Si se guardó bien se avisa y se refresca la tabla
            if (resultado.ok) {
                alert('Vehículo cargado correctamente.');
                formularioCarga.reset();
                notificarCambio();
                renderizarTabla();
            } else {
                alert('Error: ' + (resultado.error || 'No se pudo cargar el vehículo.'));
            }
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
    });
}

// Se dibuja la tabla cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', function () {
    renderizarTabla();
});

// También se dibuja la tabla de inmediato
renderizarTabla();