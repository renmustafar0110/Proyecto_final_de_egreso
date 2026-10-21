function cargarCochesDisponibles() {
    var selectCoche = document.getElementById('input-numero');

    if (selectCoche == null) {
        return Promise.resolve();
    }

    return obtenerAmbulancias().then(function (ambulancias) {
        var opcionesCoches = '';

        for (var i = 0; i < ambulancias.length; i++) {
            var ambulancia = ambulancias[i];

            if (ambulancia.estado == 'Disponible') {
                opcionesCoches = opcionesCoches + '<option value="' + escapar(ambulancia.numero_coche) + '">Coche ' + escapar(ambulancia.numero_coche) + '</option>';
            }
        }

        if (opcionesCoches == '') {
            selectCoche.innerHTML = '<option value="">No hay coches disponibles</option>';
        } else {
            selectCoche.innerHTML = '<option value="">Seleccione un coche...</option>' + opcionesCoches;
        }
    });
}

function parametroDeEdicion() {
    var parametro = new URLSearchParams(window.location.search).get('editar');

    if (parametro == null || parametro == '') {
        return 0;
    }

    return parseInt(parametro, 10);
}

var idTrasladoAEditar = parametroDeEdicion();

var formularioTraslado = document.getElementById('form-ordenar-traslado');

if (formularioTraslado) {
    formularioTraslado.addEventListener('submit', function (evento) {

        evento.preventDefault();

        var datos = new FormData(formularioTraslado);

        if (idTrasladoAEditar > 0) {
            datos.append('accion', 'editar');
            datos.append('id_traslado', idTrasladoAEditar);
        }

        fetch('../php/trazabilidad.php', {
            method: 'POST',
            body: datos
        })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado.ok == true) {
                if (idTrasladoAEditar > 0) {
                    alert('Traslado #' + resultado.id_traslado + ' actualizado correctamente.');
                    window.location.href = 'gestion_Traslados.html?id=' + resultado.id_traslado;
                    return;
                }

                alert('Traslado #' + resultado.id_traslado + ' ordenado correctamente.');
                formularioTraslado.reset();
                cargarCochesDisponibles();
            } else {
                var mensajeError = resultado.error;
                if (mensajeError == null) {
                    mensajeError = (idTrasladoAEditar > 0)
                        ? 'No se pudieron guardar los cambios.'
                        : 'No se pudo ordenar el traslado.';
                }
                alert('Error: ' + mensajeError);
            }
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
    });
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

        html = html + '<option value="' + escapar(persona[campoId]) + '">' +
            escapar(persona.nombre) + ' ' + escapar(persona.apellido) +
            ' (' + escapar(persona.cedula) + ')</option>';
    }

    select.innerHTML = html;
}

function cargarPersonal() {
    var conductores = fetch('../php/trazabilidad.php?accion=conductores')
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

    var funcionarios = fetch('../php/trazabilidad.php?accion=funcionarios')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (lista) {
            armarOpciones(lista, 'input-copiloto', 'id_funcionario',
                'Sin copiloto', 'Sin copiloto');
        })
        .catch(function () {
            armarOpciones([], 'input-copiloto', 'id_funcionario',
                'Sin copiloto', 'Sin copiloto');
        });

    return Promise.all([conductores, funcionarios]);
}

// ---------------------------------------------------------------------
// Modo edición (?editar=ID)
// ---------------------------------------------------------------------
function paraDatetimeLocal(valor) {
    if (valor == null || valor == '') {
        return '';
    }

    var limpio = String(valor).replace(' ', 'T');

    if (limpio.length > 16) {
        limpio = limpio.substring(0, 16);
    }

    return limpio;
}

function cargarTrasladoParaEditar(id) {
    fetch('../php/trazabilidad.php?accion=detalle&id=' + id)
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado == null || resultado.ok != true) {
                var mensaje = 'No se pudo cargar el traslado.';
                if (resultado != null && resultado.error != null) {
                    mensaje = resultado.error;
                }
                alert(mensaje);
                window.location.href = 'panel_Traslados.html';
                return;
            }

            if (resultado.traslado.estado != 'Pendiente') {
                alert('Este traslado ya está en curso: solo se pueden editar los traslados en estado Pendiente.');
                window.location.href = 'gestion_Traslados.html?id=' + id;
                return;
            }

            aplicarDatosAlFormulario(resultado.traslado);
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
}

function aplicarDatosAlFormulario(traslado) {
    document.getElementById('titulo-trazabilidad').textContent = 'Editar Traslado #' + traslado.id_traslado;
    document.getElementById('btn-ordenar-traslado').textContent = 'Guardar Cambios';
    document.getElementById('btn-cancelar-edicion').style.display = '';

    document.getElementById('input-conductor').value =
        traslado.id_conductor != null ? String(traslado.id_conductor) : '';
    document.getElementById('input-copiloto').value =
        traslado.copiloto_id_funcionario != null ? String(traslado.copiloto_id_funcionario) : '';

    document.getElementById('input-acompanante-nombre').value =
        traslado.acompanante_nombre != null ? traslado.acompanante_nombre : '';
    document.getElementById('input-acompanante-apellido').value =
        traslado.acompanante_apellido != null ? traslado.acompanante_apellido : '';
    document.getElementById('input-acompanante-cedula').value =
        traslado.acompanante_cedula != null ? traslado.acompanante_cedula : '';
    document.getElementById('input-acompanante-telefono').value =
        traslado.acompanante_telefono != null ? traslado.acompanante_telefono : '';

    document.getElementById('input-elemento-tipo').value =
        traslado.elemento_tipo != null ? traslado.elemento_tipo : 'paciente_biologico';
    document.getElementById('input-elemento-descripcion').value =
        traslado.elemento_descripcion != null ? traslado.elemento_descripcion : '';

    document.getElementById('input-origen').value =
        traslado.origen != null ? traslado.origen : '';
    document.getElementById('input-destino').value =
        traslado.destino != null ? traslado.destino : '';

    document.getElementById('input-hora-salida').value = paraDatetimeLocal(traslado.hora_salida);
    document.getElementById('input-hora-llegada').value = paraDatetimeLocal(traslado.hora_llegada);

    // El coche ya asignado no figura entre los disponibles: se agrega a la lista
    if (traslado.numero_coche != null) {
        var selectCoche = document.getElementById('input-numero');
        var valorCoche = String(traslado.numero_coche);
        var cochePresente = false;

        for (var i = 0; i < selectCoche.options.length; i++) {
            if (selectCoche.options[i].value == valorCoche) {
                cochePresente = true;
                break;
            }
        }

        if (cochePresente == false) {
            var opcion = document.createElement('option');
            opcion.value = valorCoche;
            opcion.textContent = 'Coche ' + valorCoche + ' (asignado)';
            selectCoche.appendChild(opcion);
        }

        selectCoche.value = valorCoche;
    }
}

if (idTrasladoAEditar > 0) {
    Promise.all([cargarCochesDisponibles(), cargarPersonal()])
        .then(function () {
            cargarTrasladoParaEditar(idTrasladoAEditar);
        });

    var botonCancelar = document.getElementById('btn-cancelar-edicion');

    if (botonCancelar) {
        botonCancelar.onclick = function () {
            window.location.href = 'gestion_Traslados.html?id=' + idTrasladoAEditar;
        };
    }
} else {
    cargarCochesDisponibles();
    cargarPersonal();
}
