var selectEncuesta = document.getElementById('select-encuesta');
var botonExportar = document.getElementById('btn-exportar');
var avisoResultados = document.getElementById('aviso-resultados');
var resumen = document.getElementById('resumen');
var totalRespuestas = document.getElementById('total-respuestas');
var contenedor = document.getElementById('contenedor-resultados');

var ultimoResultado = null;

var COLORES = ['#1e3a5f', '#2e7d32', '#f57f17', '#a12b2b', '#5a7a9a', '#7b1fa2', '#00838f', '#c2185b'];

function obtenerIdUrl() {
    var parametros = new URLSearchParams(window.location.search);
    var id = parametros.get('id');

    if (id == null) {
        return 0;
    }

    return parseInt(id, 10);
}

function etiquetaTipo(tipo) {
    if (tipo == 'multiple') {
        return 'Opción múltiple';
    }

    if (tipo == 'escala') {
        return 'Escala 1 a 5';
    }

    return 'Texto libre';
}

function cargarLista() {
    fetch('../php/encuestas.php?accion=listar')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (encuestas) {
            if (!Array.isArray(encuestas) || encuestas.length == 0) {
                selectEncuesta.innerHTML = '<option value="">No hay encuestas</option>';
                avisoResultados.textContent = 'No hay encuestas registradas.';
                avisoResultados.style.display = 'block';
                return;
            }

            var html = '<option value="">Seleccione una encuesta...</option>';

            for (var i = 0; i < encuestas.length; i++) {
                html = html + '<option value="' + encuestas[i].id_encuesta + '">' +
                    escapar(encuestas[i].titulo) + ' (' + encuestas[i].total_respuestas + ' resp.)</option>';
            }

            selectEncuesta.innerHTML = html;

            var id = obtenerIdUrl();
            if (id > 0) {
                selectEncuesta.value = id;
                cargarResultados(id);
            }
        })
        .catch(function () {
            selectEncuesta.innerHTML = '<option value="">Error al cargar</option>';
        });
}

function cargarResultados(id) {
    if (id <= 0) {
        avisoResultados.textContent = 'Seleccione una encuesta para ver sus resultados.';
        avisoResultados.style.display = 'block';
        resumen.style.display = 'none';
        contenedor.innerHTML = '';
        ultimoResultado = null;
        return;
    }

    fetch('../php/encuestas.php?accion=resultados&id=' + encodeURIComponent(id))
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado == null || resultado.ok != true) {
                avisoResultados.textContent = resultado != null && resultado.mensaje ? resultado.mensaje : 'No se pudieron cargar los resultados.';
                avisoResultados.style.display = 'block';
                resumen.style.display = 'none';
                contenedor.innerHTML = '';
                return;
            }

            ultimoResultado = resultado;
            avisoResultados.style.display = 'none';
            resumen.style.display = 'block';
            totalRespuestas.textContent = resultado.total_respuestas;

            renderPreguntas(resultado.preguntas);
        })
        .catch(function () {
            avisoResultados.textContent = 'No se pudo conectar con el servidor.';
            avisoResultados.style.display = 'block';
        });
}

function renderPreguntas(preguntas) {
    contenedor.innerHTML = '';

    if (!Array.isArray(preguntas) || preguntas.length == 0) {
        contenedor.innerHTML = '<p class="aviso">Esta encuesta no tiene preguntas.</p>';
        return;
    }

    for (var i = 0; i < preguntas.length; i++) {
        contenedor.appendChild(crearTarjetaPregunta(preguntas[i], i));
    }
}

function crearTarjetaPregunta(pregunta, indice) {
    var tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-pregunta';

    var typeLabel = '<span class="tipo-badge">' + etiquetaTipo(pregunta.tipo) + '</span>';
    var encabezado = document.createElement('div');
    encabezado.className = 'pregunta-encabezado';
    encabezado.innerHTML = '<h3>' + (indice + 1) + '. ' + escapar(pregunta.texto) + '</h3>' + typeLabel;
    tarjeta.appendChild(encabezado);

    if (pregunta.tipo == 'texto') {
        tarjeta.appendChild(crearListaTexto(pregunta.respuestas_texto));
        return tarjeta;
    }

    var resultados = pregunta.resultados || [];
    var total = 0;

    for (var i = 0; i < resultados.length; i++) {
        total = total + resultados[i].total;
    }

    var cuerpo = document.createElement('div');
    cuerpo.className = 'resultado-cuerpo';

    var barras = document.createElement('div');
    barras.className = 'barras';

    for (var j = 0; j < resultados.length; j++) {
        var dato = resultados[j];
        var porcentaje = 0;

        if (total > 0) {
            porcentaje = Math.round((dato.total / total) * 100);
        }

        var fila = document.createElement('div');
        fila.className = 'barra-fila';
        fila.innerHTML = [
            '<span class="barra-etiqueta">' + escapar(dato.etiqueta) + '</span>',
            '<span class="barra-pista"><span class="barra-relleno" style="width: ' + porcentaje + '%;"></span></span>',
            '<span class="barra-valor">' + dato.total + ' (' + porcentaje + '%)</span>'
        ].join('');
        barras.appendChild(fila);
    }

    cuerpo.appendChild(barras);

    var torta = document.createElement('canvas');
    torta.width = 180;
    torta.height = 180;
    torta.className = 'grafico-torta';
    cuerpo.appendChild(torta);

    tarjeta.appendChild(cuerpo);

    setTimeout(function () {
        dibujarTorta(torta, resultados, total);
    }, 0);

    return tarjeta;
}

function crearListaTexto(valores) {
    var contenedorTexto = document.createElement('div');
    contenedorTexto.className = 'respuestas-texto';

    if (!Array.isArray(valores) || valores.length == 0) {
        contenedorTexto.innerHTML = '<p class="aviso">Sin respuestas de texto.</p>';
        return contenedorTexto;
    }

    var lista = '<ul>';

    for (var i = 0; i < valores.length; i++) {
        lista = lista + '<li>' + escapar(valores[i]) + '</li>';
    }

    lista = lista + '</ul>';
    contenedorTexto.innerHTML = lista;

    return contenedorTexto;
}

function dibujarTorta(lienzo, datos, total) {
    var contexto = lienzo.getContext('2d');
    var ancho = lienzo.width;
    var alto = lienzo.height;
    var centroX = ancho / 2;
    var centroY = alto / 2;
    var radio = Math.min(centroX, centroY) - 6;

    contexto.clearRect(0, 0, ancho, alto);

    if (total <= 0) {
        contexto.fillStyle = '#d0dbe8';
        contexto.beginPath();
        contexto.arc(centroX, centroY, radio, 0, Math.PI * 2);
        contexto.fill();
        return;
    }

    var anguloInicial = -Math.PI / 2;

    for (var i = 0; i < datos.length; i++) {
        var porcion = (datos[i].total / total) * Math.PI * 2;
        var anguloFinal = anguloInicial + porcion;

        contexto.beginPath();
        contexto.moveTo(centroX, centroY);
        contexto.arc(centroX, centroY, radio, anguloInicial, anguloFinal);
        contexto.closePath();
        contexto.fillStyle = COLORES[i % COLORES.length];
        contexto.fill();

        anguloInicial = anguloFinal;
    }

    contexto.beginPath();
    contexto.arc(centroX, centroY, radio * 0.55, 0, Math.PI * 2);
    contexto.fillStyle = '#ffffff';
    contexto.fill();
}

function exportarCSV() {
    if (ultimoResultado == null) {
        alert('Seleccione una encuesta con resultados.');
        return;
    }

    var lineas = [];
    lineas.push(['Encuesta', 'Pregunta', 'Tipo', 'Opción', 'Cantidad', 'Porcentaje'].join(';'));

    var preguntas = ultimoResultado.preguntas;

    for (var i = 0; i < preguntas.length; i++) {
        var pregunta = preguntas[i];

        if (pregunta.tipo == 'texto') {
            var valores = pregunta.respuestas_texto || [];
            for (var t = 0; t < valores.length; t++) {
                lineas.push([
                    campoCSV(ultimoResultado.encuesta.titulo),
                    campoCSV(pregunta.texto),
                    campoCSV('Texto libre'),
                    campoCSV(valores[t]),
                    campoCSV(''),
                    campoCSV('')
                ].join(';'));
            }
            continue;
        }

        var resultados = pregunta.resultados || [];
        var total = 0;

        for (var k = 0; k < resultados.length; k++) {
            total = total + resultados[k].total;
        }

        for (var j = 0; j < resultados.length; j++) {
            var porcentaje = total > 0 ? Math.round((resultados[j].total / total) * 100) : 0;

            lineas.push([
                campoCSV(ultimoResultado.encuesta.titulo),
                campoCSV(pregunta.texto),
                campoCSV(etiquetaTipo(pregunta.tipo)),
                campoCSV(resultados[j].etiqueta),
                campoCSV(resultados[j].total),
                campoCSV(porcentaje + '%')
            ].join(';'));
        }
    }

    var contenido = '\uFEFF' + lineas.join('\r\n');
    var blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    var enlace = document.createElement('a');

    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'resultados_encuesta_' + ultimoResultado.encuesta.id_encuesta + '.csv';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(enlace.href);
}

function campoCSV(valor) {
    if (valor == null) {
        valor = '';
    }

    return '"' + String(valor).replace(/"/g, '""') + '"';
}

selectEncuesta.addEventListener('change', function () {
    cargarResultados(parseInt(selectEncuesta.value, 10) || 0);
});

botonExportar.onclick = exportarCSV;

cargarLista();
