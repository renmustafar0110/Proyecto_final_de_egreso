function cargarCochesDisponibles() {
    var selectCoche = document.getElementById('input-numero');

    if (selectCoche == null) {
        return;
    }

    obtenerAmbulancias().then(function (ambulancias) {
        var opcionesCoches = '';

        for (var i = 0; i < ambulancias.length; i++) {
            var ambulancia = ambulancias[i];

            if (ambulancia.estado == 'Disponible') {
                opcionesCoches = opcionesCoches + '<option value="' + escaparOpcion(ambulancia.numero_coche) + '">Coche ' + escaparOpcion(ambulancia.numero_coche) + '</option>';
            }
        }

        if (opcionesCoches == '') {
            selectCoche.innerHTML = '<option value="">No hay coches disponibles</option>';
        } else {
            selectCoche.innerHTML = '<option value="">Seleccione un coche...</option>' + opcionesCoches;
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
                alert('Traslado #' + resultado.id_traslado + ' ordenado correctamente.');
                formularioTraslado.reset();
                cargarCochesDisponibles();
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

function escaparOpcion(valor) {
    if (valor == null) {
        return '';
    }

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function armarOpciones(lista, idSelect, campoId, textoInicial, textoVacio) {
    var select = document.getElementById(idSelect);

    if (select == null) {
        return;
    }

    if (!Array.isArray(lista) || lista.length == 0) {
        select.innerHTML = '<option value="">' + textoVacio + '</option>';
        return;
    }

    var html = '<option value="">' + textoInicial + '</option>';

    for (var i = 0; i < lista.length; i++) {
        var persona = lista[i];

        html = html + '<option value="' + persona[campoId] + '">' +
            escaparOpcion(persona.nombre) + ' ' + escaparOpcion(persona.apellido) +
            ' (' + escaparOpcion(persona.cedula) + ')</option>';
    }

    select.innerHTML = html;
}

function cargarPersonal() {
    fetch('../php/trazabilidad.php?accion=conductores')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (lista) {
            armarOpciones(lista, 'input-conductor', 'id_conductor',
                'Seleccione un conductor...', 'No hay conductores cargados');
        })
        .catch(function () {
            armarOpciones([], 'input-conductor', 'id_conductor',
                'Seleccione un conductor...', 'No se pudieron cargar los conductores');
        });

    fetch('../php/trazabilidad.php?accion=acompanantes')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (lista) {
            armarOpciones(lista, 'input-acompanante', 'id_acompanante',
                'Sin acompañante', 'Sin acompañante');
        })
        .catch(function () {
            armarOpciones([], 'input-acompanante', 'id_acompanante',
                'Sin acompañante', 'Sin acompañante');
        });
}

cargarCochesDisponibles();
cargarPersonal();
