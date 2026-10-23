var cuerpoTabla = document.getElementById('tabla-panel');
var selectEstado = document.getElementById('filtro-estado');
var campoFecha = document.getElementById('filtro-fecha');
var avisoPanel = document.getElementById('aviso-panel');
var botonLimpiar = document.getElementById('btn-limpiar');
var botonActualizar = document.getElementById('btn-actualizar');

var SEGUNDOS_REFRESCO = 15000;
var TEXTO_SIN_RESULTADOS = 'No hay traslados con ese criterio.';

function armarFila(traslado) {
    var conductor = 'Sin asignar';

    if (traslado.conductor_nombre != null) {
        conductor = traslado.conductor_nombre + ' ' + traslado.conductor_apellido;
    }

    var acompanante = 'Sin acompañante';

    if (traslado.acompanante_nombre != null) {
        acompanante = traslado.acompanante_nombre + ' ' + traslado.acompanante_apellido;
    }

    var copiloto = 'Sin copiloto';

    if (traslado.copiloto_nombre != null) {
        copiloto = traslado.copiloto_nombre + ' ' + traslado.copiloto_apellido;
    }

    var coche = '—';
    if (traslado.numero_coche != null) {
        coche = traslado.numero_coche;
    }

    var origen = '—';
    if (traslado.origen != null) {
        origen = traslado.origen;
    }

    var destino = '—';
    if (traslado.destino != null) {
        destino = traslado.destino;
    }

    var elementoTexto = traslado.elemento_dato1 || traslado.elemento_dato2;
    if (traslado.elemento_dato1 && traslado.elemento_dato2) {
        elementoTexto = traslado.elemento_dato1 + ' / ' + traslado.elemento_dato2;
    } else if (traslado.elemento_dato1) {
        elementoTexto = traslado.elemento_dato1;
    } else if (traslado.elemento_dato2) {
        elementoTexto = traslado.elemento_dato2;
    } else {
        elementoTexto = traslado.elemento_descripcion || '—';
    }
    if (traslado.elemento_dato3) {
        elementoTexto = elementoTexto + ' — ' + traslado.elemento_dato3;
    }
    var elemento = etiquetaElemento(traslado.elemento_tipo) + ': ' + elementoTexto;

    var clase = 'fila-finalizada';

    if (traslado.estado != 'Finalizado') {
        clase = 'fila-activa';
    }

    var fila = '<tr class="' + clase + '">';
    fila = fila + '<td>' + escapar(coche) + '</td>';
    fila = fila + '<td>' + escapar(conductor) + '</td>';
    fila = fila + '<td>' + escapar(acompanante) + '</td>';
    fila = fila + '<td>' + escapar(copiloto) + '</td>';
    fila = fila + '<td>' + escapar(elemento) + '</td>';
    fila = fila + '<td>' + escapar(origen) + '</td>';
    fila = fila + '<td>' + escapar(destino) + '</td>';
    fila = fila + '<td>' + formatearFechaHora(traslado.hora_salida) + '</td>';
    fila = fila + '<td>' + formatearFechaHora(traslado.hora_llegada) + '</td>';
    fila = fila + '<td><span class="estado ' + claseEstado(traslado.estado) + '">' + escapar(traslado.estado) + '</span></td>';
    fila = fila + '<td><a href="gestion_Traslados.html?id=' + encodeURIComponent(traslado.id_traslado) + '" class="btn-gestionar">Gestionar</a></td>';
    fila = fila + '</tr>';

    return fila;
}

function cargarPanel() {
    var parametros = 'accion=panel';

    if (selectEstado.value != '') {
        parametros = parametros + '&estado=' + encodeURIComponent(selectEstado.value);
    }

    if (campoFecha.value != '') {
        parametros = parametros + '&fecha=' + encodeURIComponent(campoFecha.value);
    }

    fetch('../php/trazabilidad.php?' + parametros)
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (traslados) {
            if (!Array.isArray(traslados) || traslados.length == 0) {
                cuerpoTabla.innerHTML = '';
                avisoPanel.textContent = TEXTO_SIN_RESULTADOS;
                avisoPanel.style.display = 'block';
                return;
            }

            avisoPanel.style.display = 'none';

            var filas = '';

            for (var i = 0; i < traslados.length; i++) {
                filas = filas + armarFila(traslados[i]);
            }

            cuerpoTabla.innerHTML = filas;
        })
        .catch(function () {
            cuerpoTabla.innerHTML = '';
            avisoPanel.textContent = 'No se pudo conectar con el servidor.';
            avisoPanel.style.display = 'block';
        });
}

selectEstado.addEventListener('change', cargarPanel);
campoFecha.addEventListener('change', cargarPanel);

botonLimpiar.onclick = function () {
    selectEstado.value = '';
    campoFecha.value = '';
    cargarPanel();
};

botonActualizar.onclick = cargarPanel;

cargarPanel();
setInterval(cargarPanel, SEGUNDOS_REFRESCO);
