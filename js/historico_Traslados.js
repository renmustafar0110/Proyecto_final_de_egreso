var cuerpoTabla = document.getElementById('tabla-historico');
var campoId = document.getElementById('filtro-id');
var campoConductor = document.getElementById('filtro-conductor');
var campoPaciente = document.getElementById('filtro-paciente');
var campoDesde = document.getElementById('filtro-desde');
var campoHasta = document.getElementById('filtro-hasta');
var selectEstado = document.getElementById('filtro-estado');
var avisoHistorico = document.getElementById('aviso-historico');
var botonBuscar = document.getElementById('btn-buscar');
var botonLimpiar = document.getElementById('btn-limpiar');
var botonExportar = document.getElementById('btn-exportar');

var listaHistorico = [];
var TEXTO_SIN_RESULTADOS = 'No se encontraron traslados con ese criterio.';

function nombreConductor(traslado) {
    if (traslado.conductor_nombre == null) {
        return 'Sin asignar';
    }

    return traslado.conductor_nombre + ' ' + traslado.conductor_apellido;
}

function armarFila(traslado) {
    var coche = '—';
    if (traslado.numero_coche != null) {
        coche = traslado.numero_coche;
    }

    var elemento = etiquetaElemento(traslado.elemento_tipo) + ': ' + (traslado.elemento_descripcion || '—');

    var fila = '<tr>';
    fila = fila + '<td>#' + escapar(traslado.id_traslado) + '</td>';
    fila = fila + '<td>' + escapar(coche) + '</td>';
    fila = fila + '<td>' + escapar(nombreConductor(traslado)) + '</td>';
    fila = fila + '<td>' + escapar(elemento) + '</td>';
    fila = fila + '<td>' + escapar(traslado.origen || '—') + '</td>';
    fila = fila + '<td>' + escapar(traslado.destino || '—') + '</td>';
    fila = fila + '<td>' + formatearFechaHora(traslado.hora_salida) + '</td>';
    fila = fila + '<td>' + formatearFechaHora(traslado.hora_llegada) + '</td>';
    fila = fila + '<td><span class="estado ' + claseEstado(traslado.estado) + '">' + escapar(traslado.estado) + '</span></td>';
    fila = fila + '<td><a href="gestion_Traslados.html?id=' + encodeURIComponent(traslado.id_traslado) + '" class="btn-gestionar">Ver</a></td>';
    fila = fila + '</tr>';

    return fila;
}

function cargarHistorico() {
    var parametros = 'accion=historico';

    if (campoId.value != '') {
        parametros = parametros + '&id=' + encodeURIComponent(campoId.value);
    }

    if (campoConductor.value.trim() != '') {
        parametros = parametros + '&conductor=' + encodeURIComponent(campoConductor.value.trim());
    }

    if (campoPaciente.value.trim() != '') {
        parametros = parametros + '&paciente=' + encodeURIComponent(campoPaciente.value.trim());
    }

    if (campoDesde.value != '') {
        parametros = parametros + '&fecha_desde=' + encodeURIComponent(campoDesde.value);
    }

    if (campoHasta.value != '') {
        parametros = parametros + '&fecha_hasta=' + encodeURIComponent(campoHasta.value);
    }

    if (selectEstado.value != '') {
        parametros = parametros + '&estado=' + encodeURIComponent(selectEstado.value);
    }

    fetch('../php/trazabilidad.php?' + parametros)
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (traslados) {
            if (!Array.isArray(traslados)) {
                traslados = [];
            }

            listaHistorico = traslados;

            if (traslados.length == 0) {
                cuerpoTabla.innerHTML = '';
                avisoHistorico.textContent = TEXTO_SIN_RESULTADOS;
                avisoHistorico.style.display = 'block';
                return;
            }

            avisoHistorico.style.display = 'none';

            var filas = '';

            for (var i = 0; i < traslados.length; i++) {
                filas = filas + armarFila(traslados[i]);
            }

            cuerpoTabla.innerHTML = filas;
        })
        .catch(function () {
            cuerpoTabla.innerHTML = '';
            avisoHistorico.textContent = 'No se pudo conectar con el servidor.';
            avisoHistorico.style.display = 'block';
        });
}

function limpiarFiltros() {
    campoId.value = '';
    campoConductor.value = '';
    campoPaciente.value = '';
    campoDesde.value = '';
    campoHasta.value = '';
    selectEstado.value = 'Finalizado';
    cargarHistorico();
}

function campoCSV(valor) {
    if (valor == null) {
        valor = '';
    }

    var texto = String(valor);
    texto = texto.replace(/"/g, '""');

    return '"' + texto + '"';
}

function exportarCSV() {
    if (listaHistorico.length == 0) {
        alert('No hay resultados para exportar.');
        return;
    }

    var lineas = [];
    lineas.push(['ID', 'N Coche', 'Conductor', 'Paciente/Elemento', 'Origen', 'Destino', 'Salida', 'Llegada', 'Estado'].join(';'));

    for (var i = 0; i < listaHistorico.length; i++) {
        var traslado = listaHistorico[i];
        var elemento = etiquetaElemento(traslado.elemento_tipo) + ': ' + (traslado.elemento_descripcion || '');

        var columnas = [];
        columnas.push(campoCSV('#' + traslado.id_traslado));
        columnas.push(campoCSV(traslado.numero_coche));
        columnas.push(campoCSV(nombreConductor(traslado)));
        columnas.push(campoCSV(elemento));
        columnas.push(campoCSV(traslado.origen));
        columnas.push(campoCSV(traslado.destino));
        columnas.push(campoCSV(traslado.hora_salida));
        columnas.push(campoCSV(traslado.hora_llegada));
        columnas.push(campoCSV(traslado.estado));

        lineas.push(columnas.join(';'));
    }

    var contenido = '\uFEFF' + lineas.join('\r\n');
    var blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    var enlace = document.createElement('a');

    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'historico_traslados.csv';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(enlace.href);
}

botonBuscar.onclick = cargarHistorico;
botonLimpiar.onclick = limpiarFiltros;
botonExportar.onclick = exportarCSV;

selectEstado.addEventListener('change', cargarHistorico);
campoDesde.addEventListener('change', cargarHistorico);
campoHasta.addEventListener('change', cargarHistorico);

campoId.addEventListener('keydown', function (evento) {
    if (evento.key == 'Enter') {
        cargarHistorico();
    }
});

campoConductor.addEventListener('keydown', function (evento) {
    if (evento.key == 'Enter') {
        cargarHistorico();
    }
});

campoPaciente.addEventListener('keydown', function (evento) {
    if (evento.key == 'Enter') {
        cargarHistorico();
    }
});

cargarHistorico();
