// ============================================================================
// trazabilidad.js
//
// El objetivo de este archivo es manejar la página de "Ordenar Traslado".
// Hace varias cosas:
//   A) Consultar las ambulancias al servidor y mostrarlas en una tabla.
//   B) Armar las sugerencias de autocompletado para el "Nº de coche".
//   C) Cuando se completa el formulario, enviar el traslado al servidor.
//   D) Autocompletar la hora de salida y la hora de llegada.
// ============================================================================

// ----------------------------------------------------------------------------
// PARTE A: CONSULTAR LAS AMBULANCIAS
// ----------------------------------------------------------------------------

// Esta función le pide al servidor la lista de ambulancias.
// Devuelve una promesa que, cuando se cumple, trae la lista como arreglo.
function obtenerAmbulancias() {
    return fetch('../php/trazabilidad.php', { method: 'GET' })
        .then(function (respuesta) {
            // La respuesta viene en JSON, la convertimos a un arreglo
            return respuesta.json();
        })
        .catch(function () {
            // Si hay un error, devolvemos una lista vacía
            return [];
        });
}

// ----------------------------------------------------------------------------
// PARTE B: PINTAR LA TABLA DE AMBULANCIAS
// ----------------------------------------------------------------------------

// Devuelve el nombre de la clase de color según el estado.
// Estas clases están definidas en trazabilidad.css.
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

// Arma el detalle del viaje (ruta e horarios) para mostrar debajo del número
function armarDetalleViaje(ambulancia) {
    var ruta = (ambulancia.origen || '—') + ' → ' + (ambulancia.destino || '—');

    var textoSalida = ambulancia.hora_salida ? 'Salida: ' + ambulancia.hora_salida : 'Salida: --';
    var textoLlegada = ambulancia.hora_llegada ? 'Llegada: ' + ambulancia.hora_llegada : 'Llegada: --';

    return '<span class="detalle-reserva">' +
        ruta + '<br>' +
        textoSalida + ' · ' + textoLlegada +
        '</span>';
}

// Dibuja en la tabla cada ambulancia y además arma las sugerencias del autocompletado
function renderizarTabla() {
    var cuerpoTabla = document.getElementById('tabla-vehiculos');
    var listaCoches = document.getElementById('lista-coches');

    // Si la tabla no existe, no hay nada que hacer
    if (!cuerpoTabla) {
        return;
    }

    obtenerAmbulancias().then(function (ambulancias) {
        // Si no hay ambulancias, mostramos un aviso en la tabla
        if (!Array.isArray(ambulancias) || ambulancias.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="3">No hay ambulancias cargadas.</td></tr>';
            return;
        }

        // Acá vamos guardando el HTML de todas las filas
        var filas = '';

        // Acá vamos guardando las sugerencias del autocompletado
        var sugerencias = '';

        // Recorremos cada ambulancia para armar su fila
        for (var i = 0; i < ambulancias.length; i++) {
            var ambulancia = ambulancias[i];

            var claseEstado = obtenerClaseDeEstado(ambulancia.estado);

            // Si la ambulancia está disponible, la agregamos a las sugerencias
            // para poder ordenarle un traslado. Si no, ofrecemos gestionarla.
            var accion = '';
            if (ambulancia.estado === 'Disponible') {
                sugerencias += '<option value="Coche ' + ambulancia.numero_coche + '"></option>';
            } else {
                accion = '<a href="GestionT.html" class="btn-mandar">Gestionar</a>';
            }

            // Si tiene un traslado asignado, mostramos el detalle del viaje
            var detalleViaje = '';
            if (ambulancia.id_traslado) {
                detalleViaje = armarDetalleViaje(ambulancia);
            }

            // Armamos la fila completa de la tabla
            filas += '<tr>' +
                '<td>' + ambulancia.numero_coche + detalleViaje + '</td>' +
                '<td><span class="estado ' + claseEstado + '">' + ambulancia.estado + '</span></td>' +
                '<td>' + accion + '</td>' +
                '</tr>';
        }

        // Colocamos las filas dentro de la tabla
        cuerpoTabla.innerHTML = filas;

        // Y llenamos el autocompletado con las ambulancias disponibles
        if (listaCoches) {
            listaCoches.innerHTML = sugerencias;
        }
    });
}

// ----------------------------------------------------------------------------
// PARTE C: ENVIAR EL TRASLADO
// ----------------------------------------------------------------------------

var formularioTraslado = document.getElementById('form-ordenar-traslado');

// Solo configuramos el envío si el formulario existe en la página
if (formularioTraslado) {
    formularioTraslado.addEventListener('submit', function (evento) {

        // Evitamos que la página se recargue al enviar el formulario
        evento.preventDefault();

        // Tomamos todos los datos del formulario
        var datos = new FormData(formularioTraslado);

        // Se los enviamos al servidor como POST
        fetch('../php/trazabilidad.php', {
            method: 'POST',
            body: datos
        })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            // Si el servidor respondió ok, avisamos y refrescamos la tabla
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

// ----------------------------------------------------------------------------
// PARTE D: AUTOCOMPLETAR LAS HORAS
// ----------------------------------------------------------------------------

// Coloca la fecha y hora actuales en un campo de tipo datetime-local.
// Recibe el id del campo que se quiere completar.
function autocompletarHora(idCampo) {
    var campo = document.getElementById(idCampo);

    // Si el campo no existe en la página, no hacemos nada
    if (!campo) {
        return;
    }

    var ahora = new Date();

    // El campo datetime-local necesita este formato: 2026-09-15T10:30
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

// ----------------------------------------------------------------------------
// AL ABRIR LA PÁGINA
// ----------------------------------------------------------------------------

// El script se carga al final del HTML, así que el documento ya está listo:
// dibujamos la tabla y completamos las horas.
renderizarTabla();
autocompletarHoras();