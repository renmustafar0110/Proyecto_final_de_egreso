// Maneja la página de ordenar traslado

// Pide al servidor la lista de ambulancias
function obtenerAmbulancias() {
    return fetch('../php/trazabilidad.php', { method: 'GET' })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            // Devuelve lista vacía si hay error
            return [];
        });
}

// Devuelve la clase de color según el estado (definida en trazabilidad.css)
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

// Arma el detalle del viaje (ruta y horarios)
function armarDetalleViaje(ambulancia) {
    var ruta = (ambulancia.origen || '—') + ' → ' + (ambulancia.destino || '—');

    var textoSalida = ambulancia.hora_salida ? 'Salida: ' + ambulancia.hora_salida : 'Salida: --';
    var textoLlegada = ambulancia.hora_llegada ? 'Llegada: ' + ambulancia.hora_llegada : 'Llegada: --';

    return '<span class="detalle-reserva">' +
        ruta + '<br>' +
        textoSalida + ' · ' + textoLlegada +
        '</span>';
}

// Dibuja la tabla de ambulancias y arma el autocompletado
function renderizarTabla() {
    var cuerpoTabla = document.getElementById('tabla-vehiculos');
    var listaCoches = document.getElementById('lista-coches');

    // Si la tabla no existe, no se hace nada
    if (!cuerpoTabla) {
        return;
    }

    obtenerAmbulancias().then(function (ambulancias) {
        // Muestra un aviso si no hay ambulancias
        if (!Array.isArray(ambulancias) || ambulancias.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="3">No hay ambulancias cargadas.</td></tr>';
            return;
        }

        // Guarda el HTML de las filas
        var filas = '';

        // Guarda las sugerencias del autocompletado
        var sugerencias = '';

        // Recorre cada ambulancia para armar su fila
        for (var i = 0; i < ambulancias.length; i++) {
            var ambulancia = ambulancias[i];

            var claseEstado = obtenerClaseDeEstado(ambulancia.estado);

            // Disponible: sugerencia de traslado; si no, ofrecer gestionarla
            var accion = '';
            if (ambulancia.estado === 'Disponible') {
                sugerencias += '<option value="Coche ' + ambulancia.numero_coche + '"></option>';
            } else {
                accion = '<a href="GestionT.html" class="btn-mandar">Gestionar</a>';
            }

            // Muestra el detalle del viaje si tiene traslado asignado
            var detalleViaje = '';
            if (ambulancia.id_traslado) {
                detalleViaje = armarDetalleViaje(ambulancia);
            }

            // Arma la fila de la tabla
            filas += '<tr>' +
                '<td>' + ambulancia.numero_coche + detalleViaje + '</td>' +
                '<td><span class="estado ' + claseEstado + '">' + ambulancia.estado + '</span></td>' +
                '<td>' + accion + '</td>' +
                '</tr>';
        }

        // Inserta las filas en la tabla
        cuerpoTabla.innerHTML = filas;

        // Llena el autocompletado con las ambulancias disponibles
        if (listaCoches) {
            listaCoches.innerHTML = sugerencias;
        }
    });
}

// Enviar el traslado

var formularioTraslado = document.getElementById('form-ordenar-traslado');

// Configura el envío solo si el formulario existe
if (formularioTraslado) {
    formularioTraslado.addEventListener('submit', function (evento) {

        // Evita que la página se recargue al enviar
        evento.preventDefault();

        // Toma los datos del formulario
        var datos = new FormData(formularioTraslado);

        // Envía los datos al servidor
        fetch('../php/trazabilidad.php', {
            method: 'POST',
            body: datos
        })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            // Si el servidor respondió ok, avisa y refresca la tabla
            if (resultado.ok) {
                alert('Traslado ordenado correctamente.');
                formularioTraslado.reset();
                renderizarTabla();
            } else {
                alert('Error: ' + (resultado.error || 'No se pudo ordenar el traslado.'));
            }
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
    });
}

// Autocompletar las horas

// Pone la fecha y hora actuales en un campo
function autocompletarHora(idCampo) {
    var campo = document.getElementById(idCampo);

    // Si el campo no existe, no se hace nada
    if (!campo) {
        return;
    }

    var ahora = new Date();

    // Formato que necesita el campo datetime-local: 2026-09-15T10:30
    var anio = ahora.getFullYear();
    var mes = ('0' + (ahora.getMonth() + 1)).slice(-2);
    var dia = ('0' + ahora.getDate()).slice(-2);
    var hora = ('0' + ahora.getHours()).slice(-2);
    var minuto = ('0' + ahora.getMinutes()).slice(-2);

    campo.value = anio + '-' + mes + '-' + dia + 'T' + hora + ':' + minuto;
}

// Completa los campos "Hora de salida" y "Hora de llegada"
function autocompletarHoras() {
    autocompletarHora('input-hora-salida');
    autocompletarHora('input-hora-llegada');
}

// Al abrir la página

// Dibuja la tabla y completa las horas al cargar
renderizarTabla();
autocompletarHoras();