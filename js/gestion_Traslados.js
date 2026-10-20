var idTraslado = 0;

var avisoDetalle = document.getElementById('aviso-detalle');
var contenido = document.getElementById('contenido-traslado');
var formulario = document.getElementById('form-estado');
var selectEstado = document.getElementById('nuevo-estado');
var campoNuevoEstado = document.getElementById('campo-nuevo-estado');
var botonActualizar = document.getElementById('btn-actualizar-estado');
var avisoFinalizado = document.getElementById('aviso-finalizado');

function obtenerIdDeLaUrl() {
    var parametros = new URLSearchParams(window.location.search);
    var id = parametros.get('id');

    if (id == null) {
        return 0;
    }

    return parseInt(id, 10);
}

function mostrarAviso(mensaje) {
    avisoDetalle.textContent = mensaje;
    avisoDetalle.style.display = 'block';
    contenido.style.display = 'none';
}

function cargarDetalle() {
    fetch('../php/trazabilidad.php?accion=detalle&id=' + idTraslado)
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado == null || resultado.ok != true) {
                var mensaje = 'No se pudo cargar el traslado.';
                if (resultado != null && resultado.error != null) {
                    mensaje = resultado.error;
                }
                mostrarAviso(mensaje);
                return;
            }

            avisoDetalle.style.display = 'none';
            contenido.style.display = 'block';

            dibujarDetalle(resultado.traslado);
            dibujarHistorial(resultado.historial);
            dibujarFormulario(resultado.estados_permitidos);
        })
        .catch(function () {
            mostrarAviso('No se pudo conectar con el servidor.');
        });
}

function dibujarDetalle(traslado) {
    var conductor = 'Sin asignar';

    if (traslado.conductor_nombre != null) {
        conductor = traslado.conductor_nombre + ' ' + traslado.conductor_apellido;
    }

    var coche = '—';
    if (traslado.numero_coche != null) {
        coche = traslado.numero_coche;
    }

    var elemento = etiquetaElemento(traslado.elemento_tipo) + ': ' + (traslado.elemento_descripcion || '—');

    document.getElementById('detalle-id').textContent = '#' + traslado.id_traslado;
    document.getElementById('detalle-coche').textContent = coche;
    document.getElementById('detalle-conductor').textContent = conductor;
    document.getElementById('detalle-elemento').textContent = elemento;
    document.getElementById('detalle-origen').textContent = traslado.origen || '—';
    document.getElementById('detalle-destino').textContent = traslado.destino || '—';
    document.getElementById('detalle-salida').textContent = formatearFechaHora(traslado.hora_salida);
    document.getElementById('detalle-estado').textContent = traslado.estado;

    document.getElementById('titulo-traslado').textContent = 'Traslado #' + traslado.id_traslado;
}

function dibujarHistorial(historial) {
    var lista = document.getElementById('historial-estados');
    lista.innerHTML = '';

    if (!Array.isArray(historial) || historial.length == 0) {
        lista.innerHTML = '<li class="historial-vacio">Sin cambios registrados.</li>';
        return;
    }

    var html = '';

    for (var i = 0; i < historial.length; i++) {
        var cambio = historial[i];

        html = html + '<li>' +
            '<span class="historial-estado">' + escapar(cambio.estado) + '</span>' +
            '<span class="historial-fecha">' + formatearFechaHora(cambio.fecha_cambio) + '</span>' +
            '</li>';
    }

    lista.innerHTML = html;
}

function dibujarFormulario(estadosPermitidos) {
    selectEstado.innerHTML = '<option value="">Seleccione un estado...</option>';

    if (!Array.isArray(estadosPermitidos) || estadosPermitidos.length == 0) {
        campoNuevoEstado.style.display = 'none';
        botonActualizar.style.display = 'none';
        avisoFinalizado.style.display = 'block';
        return;
    }

    campoNuevoEstado.style.display = 'block';
    botonActualizar.style.display = 'block';
    avisoFinalizado.style.display = 'none';

    for (var i = 0; i < estadosPermitidos.length; i++) {
        var opcion = document.createElement('option');
        opcion.value = estadosPermitidos[i];
        opcion.textContent = estadosPermitidos[i];
        selectEstado.appendChild(opcion);
    }
}

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (selectEstado.value == '') {
        alert('Seleccione el nuevo estado.');
        return;
    }

    var datos = new FormData();
    datos.append('accion', 'actualizar_estado');
    datos.append('id_traslado', idTraslado);
    datos.append('estado', selectEstado.value);

    fetch('../php/trazabilidad.php', {
        method: 'POST',
        body: datos
    })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado != null && resultado.ok == true) {
                alert('Estado actualizado a "' + resultado.estado + '".');
                cargarDetalle();
            } else {
                var mensaje = 'No se pudo actualizar el estado.';
                if (resultado != null && resultado.error != null) {
                    mensaje = resultado.error;
                }
                alert('Error: ' + mensaje);
            }
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
});

idTraslado = obtenerIdDeLaUrl();

if (idTraslado <= 0) {
    mostrarAviso('No se indicó un traslado válido.');
} else {
    cargarDetalle();
}
