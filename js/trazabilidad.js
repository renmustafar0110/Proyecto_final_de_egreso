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

        var tipoSelect = document.getElementById('input-elemento-tipo');
        var comboNivel = document.getElementById('input-tipo-equipamiento');

        if (tipoSelect && tipoSelect.value == 'equipamiento_medico') {

            if (!comboNivel || comboNivel.value == '') {

                alert('Seleccione el nivel del equipamiento (SVB o SVA).');

                if (comboNivel) {
                    comboNivel.focus();
                }

                return;
            }
        }

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
                actualizarCamposEquipamiento();
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
            escapar(persona.nombre) + ' ' + escapar(persona.apellido) + '</option>';
    }

    select.innerHTML = html;
}

var EQUIPOS_POR_NIVEL = {

    SVB: [
        { codigo: 'oxigenoterapia', nombre: 'Oxigenoterapia' },
        { codigo: 'dea', nombre: 'DEA (desfibrilador externo automático)' },
        { codigo: 'inmovilizacion', nombre: 'Material de inmovilización' },
        { codigo: 'botiquin_epp', nombre: 'Botiquín / EPP' }
    ],

    SVA: [
        { codigo: 'oxigenoterapia', nombre: 'Oxigenoterapia' },
        { codigo: 'dea', nombre: 'DEA (desfibrilador externo automático)' },
        { codigo: 'inmovilizacion', nombre: 'Material de inmovilización' },
        { codigo: 'botiquin_epp', nombre: 'Botiquín / EPP' },
        { codigo: 'monitor_desfibrilador', nombre: 'Monitor-desfibrilador / marcapasos' },
        { codigo: 'respirador', nombre: 'Respirador portátil' },
        { codigo: 'laringoscopio', nombre: 'Laringoscopio / tubos endotraqueales' },
        { codigo: 'bombas_infusion', nombre: 'Bombas de infusión / accesos' },
        { codigo: 'farmacos_aclspals', nombre: 'Fármacos ACLS / PALS' }
    ]

};


function renderizarEquiposNivel() {

    var combo = document.getElementById('input-tipo-equipamiento');
    var contenedor = document.getElementById('campo-lista-equipos');
    var lista = document.getElementById('lista-equipos');
    var ocultos = document.getElementById('equipos-ocultos');

    if (!combo || !contenedor || !lista || !ocultos) {
        return;
    }

    var nivel = combo.value;
    var equipos = EQUIPOS_POR_NIVEL[nivel];

    if (!equipos) {
        lista.innerHTML = '';
        ocultos.innerHTML = '';
        contenedor.style.display = 'none';
        return;
    }

    var htmlLista = '';
    var htmlOcultos = '';

    for (var i = 0; i < equipos.length; i++) {

        htmlLista = htmlLista + '<li>' + escapar(equipos[i].nombre) + '</li>';

        htmlOcultos = htmlOcultos + '<input type="hidden" name="equipos[]" value="' +
            escapar(equipos[i].codigo) + '">';

    }

    lista.innerHTML = htmlLista;
    ocultos.innerHTML = htmlOcultos;
    contenedor.style.display = '';

}


function actualizarCamposEquipamiento() {

    var tipoSelect = document.getElementById('input-elemento-tipo');
    var campoNivel = document.getElementById('campo-tipo-equipamiento');
    var combo = document.getElementById('input-tipo-equipamiento');

    if (!tipoSelect || !campoNivel || !combo) {
        return;
    }

    if (tipoSelect.value == 'equipamiento_medico') {
        campoNivel.style.display = '';
    } else {
        campoNivel.style.display = 'none';
        combo.value = '';
    }

    renderizarEquiposNivel();

}


function configurarEquipamiento() {

    var tipoSelect = document.getElementById('input-elemento-tipo');
    var combo = document.getElementById('input-tipo-equipamiento');

    if (!tipoSelect || !combo) {
        return;
    }

    tipoSelect.addEventListener('change', actualizarCamposEquipamiento);
    combo.addEventListener('change', renderizarEquiposNivel);

    actualizarCamposEquipamiento();

}


function configurarCamposElemento() {
    var tipoSelect = document.getElementById('input-elemento-tipo');
    var campo1 = document.getElementById('campo-elemento-dato1');
    var label1 = document.getElementById('label-elemento-dato1');
    var input1 = document.getElementById('input-elemento-dato1');
    var campo2 = document.getElementById('campo-elemento-dato2');
    var label2 = document.getElementById('label-elemento-dato2');
    var input2 = document.getElementById('input-elemento-dato2');
    var campo3 = document.getElementById('campo-elemento-dato3');
    var label3 = document.getElementById('label-elemento-dato3');
    var input3 = document.getElementById('input-elemento-dato3');

    if (!tipoSelect || !campo1 || !label1 || !input1 || !campo2 || !label2 || !input2 ||
        !campo3 || !label3 || !input3) {
        return;
    }

    function actualizar() {
        var tipo = tipoSelect.value;
        var esEquipamiento = (tipo == 'equipamiento_medico');

        campo1.style.display = esEquipamiento ? 'none' : '';
        campo2.style.display = esEquipamiento ? 'none' : '';
        campo3.style.display = esEquipamiento ? 'none' : '';

        if (esEquipamiento) {
            input1.required = false;
            input2.required = false;
            input3.required = false;

            input1.value = '';
            input2.value = '';
            input3.value = '';
        }

        if (tipo == 'paciente_biologico') {
            label1.textContent = 'Nombre y apellido:';
            input1.placeholder = 'Ej: Juan Pérez';
            input1.required = true;

            label2.textContent = 'Cédula:';
            input2.placeholder = 'Ej: 12345678';
            input2.required = true;

            label3.textContent = 'Diagnóstico / observaciones:';
            input3.placeholder = 'Ej: Politraumatismo';
            input3.required = false;
        } else if (tipo == 'muestra_biologica') {
            label1.textContent = 'Tipo de muestra:';
            input1.placeholder = 'Ej: Sangre';
            input1.required = true;

            label2.textContent = 'Código / identificación:';
            input2.placeholder = 'Ej: M-2025-00123';
            input2.required = true;

            label3.textContent = 'Conservación / observaciones:';
            input3.placeholder = 'Ej: Refrigerado a 4 °C';
            input3.required = false;
        }
    }

    tipoSelect.addEventListener('change', actualizar);
    actualizar();
}

function cargarOpciones(accion, idSelect, campoId, textoInicial, textoVacio, textoError) {
    return fetch('../php/trazabilidad.php?accion=' + accion)
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (lista) {
            armarOpciones(lista, idSelect, campoId, textoInicial, textoVacio);
        })
        .catch(function () {
            armarOpciones([], idSelect, campoId, textoInicial, textoError);
        });
}

function cargarPersonal() {
    return Promise.all([
        cargarOpciones('conductores', 'input-conductor', 'id_conductor',
            'Seleccione un conductor...', 'No hay conductores cargados',
            'No se pudieron cargar los conductores'),
        cargarOpciones('acompanantes', 'input-acompanante', 'id',
            'Sin acompañante', 'Sin acompañantes cargados',
            'No se pudieron cargar los acompañantes'),
        cargarOpciones('copilotos', 'input-copiloto', 'id',
            'Sin copiloto', 'Sin copilotos cargados',
            'No se pudieron cargar los copilotos')
    ]);
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
        traslado.copiloto_id != null ? String(traslado.copiloto_id) : '';
    document.getElementById('input-acompanante').value =
        traslado.acompanante_id != null ? String(traslado.acompanante_id) : '';

    document.getElementById('input-elemento-tipo').value =
        traslado.elemento_tipo != null ? traslado.elemento_tipo : 'paciente_biologico';
    configurarCamposElemento();
    actualizarCamposEquipamiento();

    var comboNivel = document.getElementById('input-tipo-equipamiento');

    if (comboNivel && traslado.tipo_equipamiento != null) {
        comboNivel.value = traslado.tipo_equipamiento;
    }

    renderizarEquiposNivel();

    document.getElementById('input-elemento-dato1').value =
        traslado.elemento_dato1 != null ? traslado.elemento_dato1 : '';
    document.getElementById('input-elemento-dato2').value =
        traslado.elemento_dato2 != null ? traslado.elemento_dato2 : '';
    document.getElementById('input-elemento-dato3').value =
        traslado.elemento_dato3 != null ? traslado.elemento_dato3 : '';

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

configurarCamposElemento();
configurarEquipamiento();

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
