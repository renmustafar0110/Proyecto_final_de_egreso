function armarDetalleViaje(ambulancia) {
    var origen = '—';
    var destino = '—';

    if (ambulancia.origen) {
        origen = ambulancia.origen;
    }

    if (ambulancia.destino) {
        destino = ambulancia.destino;
    }

    var textoSalida = 'Salida: --';
    var textoLlegada = 'Llegada: --';

    if (ambulancia.hora_salida) {
        textoSalida = 'Salida: ' + ambulancia.hora_salida;
    }

    if (ambulancia.hora_llegada) {
        textoLlegada = 'Llegada: ' + ambulancia.hora_llegada;
    }

    return '<span class="detalle-reserva">' +
        origen + ' → ' + destino + '<br>' +
        textoSalida + ' · ' + textoLlegada +
        '</span>';
}

function renderizarTabla() {
    var cuerpoTabla = document.getElementById('tabla-vehiculos');
    var listaCoches = document.getElementById('lista-coches');

    if (cuerpoTabla == null) {
        return;
    }

    obtenerAmbulancias().then(function (ambulancias) {
        if (ambulancias.length == 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="3">No hay ambulancias cargadas.</td></tr>';
            return;
        }

        var filas = '';
        var sugerencias = '';

        for (var i = 0; i < ambulancias.length; i++) {
            var ambulancia = ambulancias[i];
            var claseEstado = obtenerClaseDeEstado(ambulancia.estado);
            var accion = '';

            if (ambulancia.estado == 'Disponible') {
                sugerencias = sugerencias + '<option value="Coche ' + ambulancia.numero_coche + '"></option>';
            } else {
                accion = '<a href="gestion_Traslados.html" class="btn-mandar">Gestionar</a>';
            }

            var detalleViaje = '';
            if (ambulancia.id_traslado) {
                detalleViaje = armarDetalleViaje(ambulancia);
            }

            filas = filas + '<tr>' +
                '<td>' + ambulancia.numero_coche + detalleViaje + '</td>' +
                '<td><span class="estado ' + claseEstado + '">' + ambulancia.estado + '</span></td>' +
                '<td>' + accion + '</td>' +
                '</tr>';
        }

        cuerpoTabla.innerHTML = filas;

        if (listaCoches) {
            listaCoches.innerHTML = sugerencias;
        }
    });
}

var formularioTraslado = document.getElementById('form-ordenar-traslado');

if (formularioTraslado) {
    formularioTraslado.addEventListener('submit', function (evento) {

        evento.preventDefault();

        var datos = new FormData(formularioTraslado);

        fetch('../php/trazabilidad.php', {
            method: 'POST',
            body: datos
        })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado.ok == true) {
                alert('Traslado ordenado correctamente.');
                formularioTraslado.reset();
                renderizarTabla();
            } else {
                var mensajeError = resultado.error;
                if (mensajeError == null) {
                    mensajeError = 'No se pudo ordenar el traslado.';
                }
                alert('Error: ' + mensajeError);
            }
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
    });
}

function autocompletarHora(idCampo) {
    var campo = document.getElementById(idCampo);

    if (campo == null) {
        return;
    }

    var ahora = new Date();

    var anio = ahora.getFullYear();
    var mes = ('0' + (ahora.getMonth() + 1)).slice(-2);
    var dia = ('0' + ahora.getDate()).slice(-2);
    var hora = ('0' + ahora.getHours()).slice(-2);
    var minuto = ('0' + ahora.getMinutes()).slice(-2);

    campo.value = anio + '-' + mes + '-' + dia + 'T' + hora + ':' + minuto;
}

function autocompletarHoras() {
    autocompletarHora('input-hora-salida');
    autocompletarHora('input-hora-llegada');
}

renderizarTabla();
autocompletarHoras();
