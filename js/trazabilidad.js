// trazabilidad.js - Formulario para ordenar y editar traslados de ambulancias.
// Llena el select de coches con las ambulancias disponibles.
function cargarCochesDisponibles() {
    var selectCoche = document.getElementById('input-numero');



    // Si la pagina no tiene el select de coches, no se hace nada.
    if (selectCoche == null) {
        return Promise.resolve();
    }



    // Se piden las ambulancias y se listan solo las disponibles.
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



// Lee el id del traslado a editar desde el parametro editar.
function parametroDeEdicion() {
    var parametro = new URLSearchParams(window.location.search).get('editar');



    if (parametro == null || parametro == '') {
        return 0;
    }



    return parseInt(parametro, 10);
}



// Si se esta editando, se guarda el id del traslado.
var idTrasladoAEditar = parametroDeEdicion();



// Referencia al formulario de ordenar traslado.
var formularioTraslado = document.getElementById('form-ordenar-traslado');



// Envio del formulario: valida equipamiento y crea o edita el traslado.
if (formularioTraslado) {
    formularioTraslado.addEventListener('submit', function (evento) {

        evento.preventDefault();



        var tipoSelect = document.getElementById('input-elemento-tipo');
        var comboNivel = document.getElementById('input-tipo-equipamiento');



        // Si el elemento es equipamiento medico, el nivel SVB/SVA es obligatorio.
        if (tipoSelect && tipoSelect.value == 'equipamiento_medico') {

            if (!comboNivel || comboNivel.value == '') {

                alert('Seleccione el nivel del equipamiento (SVB o SVA).');



                if (comboNivel) {
                    comboNivel.focus();
                }



                return;
            }
        }



        // Se arman los datos del formulario.
        var datos = new FormData(formularioTraslado);



        // En modo edicion se agrega la accion y el id del traslado.
        if (idTrasladoAEditar > 0) {
            datos.append('accion', 'editar');
            datos.append('id_traslado', idTrasladoAEditar);
        }



        // Se envia la peticion al backend.
        fetch('../php/trazabilidad.php', {
            method: 'POST',
            body: datos
        })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            // Si todo salio bien, se avisa y se redirige o se limpia el formulario.
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



                // Se oculta y limpia el bloque de acompanante nuevo.
                // Se oculta y limpia el bloque de acompañante nuevo
                var grupoNuevo = document.getElementById('grupo-acompanante-nuevo');



                if (grupoNuevo) {
                    grupoNuevo.style.display = 'none';
                    var camposNuevo = grupoNuevo.querySelectorAll('input');



                    for (var c = 0; c < camposNuevo.length; c++) {
                        camposNuevo[c].required = false;
                        camposNuevo[c].value = '';
                    }
                }
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



// Llena un select con personas (conductores, acompanantes o copilotos).
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



// Catalogo de equipamiento medico obligatorio por nivel (SVB y SVA).
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



// Muestra los equipos que corresponden al nivel seleccionado.
function renderizarEquiposNivel() {

    var combo = document.getElementById('input-tipo-equipamiento');
    var contenedor = document.getElementById('campo-lista-equipos');
    var lista = document.getElementById('lista-equipos');
    var ocultos = document.getElementById('equipos-ocultos');



    if (!combo || !contenedor || !lista || !ocultos) {
        return;
    }



    // Se generan tanto la lista visible como los campos ocultos que se envian.
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



// Muestra u oculta el selector de nivel segun el tipo de elemento.
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



// Conecta los cambios de tipo y nivel de equipamiento.
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



// Adapta las etiquetas y campos del elemento segun el tipo elegido.
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



    // Ajusta las etiquetas y la obligatoriedad de los tres campos del elemento.
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



        // Etiquetas y campos para paciente biologico.
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
        // Etiquetas y campos para muestra biologica.
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
        // Etiquetas y campos para insumos.
        } else if (tipo == 'insumo') {
            // US-11: traslado de insumos (texto libre)
            label1.textContent = 'Insumo / descripción:';
            input1.placeholder = 'Ej: Caja de guantes de nitrilo';
            input1.required = true;



            label2.textContent = 'Cantidad / detalle:';
            input2.placeholder = 'Ej: 10 unidades';
            input2.required = false;



            label3.textContent = 'Observaciones:';
            input3.placeholder = 'Opcional';
            input3.required = false;
        // Etiquetas y campos para otros elementos.
        } else if (tipo == 'otro') {
            // US-11: cualquier otro elemento con texto libre
            label1.textContent = 'Descripción del elemento:';
            input1.placeholder = 'Ej: Elemento a trasladar';
            input1.required = true;



            label2.textContent = 'Detalle adicional:';
            input2.placeholder = 'Opcional';
            input2.required = false;



            label3.textContent = 'Observaciones:';
            input3.placeholder = 'Opcional';
            input3.required = false;
        }
    }



    tipoSelect.addEventListener('change', actualizar);
    actualizar();
}



// Pide una lista al backend y la carga en un select.
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



// Carga en paralelo conductores, acompanantes y copilotos.
function cargarPersonal() {
    return Promise.all([
        cargarOpciones('conductores', 'input-conductor', 'id_conductor',
            'Seleccione un conductor...', 'No hay conductores cargados',
            'No se pudieron cargar los conductores'),
        cargarOpciones('acompanantes', 'input-acompanante', 'id',
            'Sin acompañante', 'Sin acompañantes cargados',
            'No se pudieron cargar los acompañantes')
            .then(function () {
                agregarOpcionAcompananteNuevo();
            }),
        cargarOpciones('copilotos', 'input-copiloto', 'id',
            'Sin copiloto', 'Sin copilotos cargados',
            'No se pudieron cargar los copilotos')
    ]);
}



// ---------------------------------------------------------------------
// US-07: registro de un acompañante nuevo desde el formulario
// ---------------------------------------------------------------------
// Agrega la opcion para registrar un acompanante nuevo desde el formulario.
function agregarOpcionAcompananteNuevo() {
    var select = document.getElementById('input-acompanante');



    if (select == null) {
        return;
    }



    var yaExiste = false;



    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value == 'nuevo') {
            yaExiste = true;
            break;
        }
    }



    if (!yaExiste) {
        var opcion = document.createElement('option');
        opcion.value = 'nuevo';
        opcion.textContent = 'Registrar nuevo acompañante...';
        select.appendChild(opcion);
    }
}



// Muestra los campos del acompanante nuevo solo cuando se elige esa opcion.
function configurarAcompananteNuevo() {
    var select = document.getElementById('input-acompanante');
    var grupo = document.getElementById('grupo-acompanante-nuevo');



    if (!select || !grupo) {
        return;
    }



    // Habilita/deshabilita y limpia los campos del acompanante nuevo.
    function actualizar() {
        var esNuevo = select.value == 'nuevo';



        grupo.style.display = esNuevo ? '' : 'none';



        var campos = grupo.querySelectorAll('input');



        for (var i = 0; i < campos.length; i++) {
            // El teléfono es opcional, el resto obligatorio (US-07)
            campos[i].required = esNuevo && campos[i].id != 'input-acompanante-telefono';



            if (!esNuevo) {
                campos[i].value = '';
            }
        }
    }



    select.addEventListener('change', actualizar);
}



// ---------------------------------------------------------------------
// Modo edición (?editar=ID)
// ---------------------------------------------------------------------
// Convierte una fecha MySQL al formato que usa input[type=datetime-local].
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



// Carga un traslado existente y valida que todavia se pueda editar.
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



            // Solo se pueden editar traslados en estado Pendiente.
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



// Copia los datos del traslado en todos los campos del formulario.
function aplicarDatosAlFormulario(traslado) {
    document.getElementById('titulo-trazabilidad').textContent = 'Editar Traslado #' + traslado.id_traslado;
    document.getElementById('btn-ordenar-traslado').textContent = 'Guardar Cambios';
    document.getElementById('btn-cancelar-edicion').style.display = '';



    // Tripulacion, acompanante y copiloto.
    document.getElementById('input-conductor').value =
        traslado.id_conductor != null ? String(traslado.id_conductor) : '';
    document.getElementById('input-copiloto').value =
        traslado.copiloto_id != null ? String(traslado.copiloto_id) : '';



    var selectAcompanante = document.getElementById('input-acompanante');



    if (traslado.acompanante_id != null) {
        selectAcompanante.value = String(traslado.acompanante_id);
    } else if (traslado.acompanante_nombre != null) {
        // US-07: el acompañante del traslado no figura en el catálogo libre,
        // se precargan sus datos como acompañante nuevo
        selectAcompanante.value = 'nuevo';



        document.getElementById('input-acompanante-nombre').value = traslado.acompanante_nombre || '';
        document.getElementById('input-acompanante-apellido').value = traslado.acompanante_apellido || '';
        document.getElementById('input-acompanante-cedula').value = traslado.acompanante_cedula || '';
        document.getElementById('input-acompanante-telefono').value = traslado.acompanante_telefono || '';



        var grupoNuevo = document.getElementById('grupo-acompanante-nuevo');



        if (grupoNuevo) {
            grupoNuevo.style.display = '';
            var camposNuevo = grupoNuevo.querySelectorAll('input');



            for (var c = 0; c < camposNuevo.length; c++) {
                camposNuevo[c].required = camposNuevo[c].id != 'input-acompanante-telefono';
            }
        }
    } else {
        selectAcompanante.value = '';
    }



    // Tipo de elemento y equipamiento.
    document.getElementById('input-elemento-tipo').value =
        traslado.elemento_tipo != null ? traslado.elemento_tipo : 'paciente_biologico';
    configurarCamposElemento();
    actualizarCamposEquipamiento();



    var comboNivel = document.getElementById('input-tipo-equipamiento');



    if (comboNivel && traslado.tipo_equipamiento != null) {
        comboNivel.value = traslado.tipo_equipamiento;
    }



    renderizarEquiposNivel();



    // Datos del elemento, origen, destino y horarios.
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



    // El coche ya asignado se agrega a la lista si no esta entre los disponibles.
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



// Se preparan los campos dinamicos y luego se cargan los catalogos.
configurarCamposElemento();
configurarEquipamiento();
configurarAcompananteNuevo();



// Si se esta editando, se espera a tener los catalogos para precargar el traslado.
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
