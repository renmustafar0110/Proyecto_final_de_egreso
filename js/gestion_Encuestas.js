var listaEncuestas = [];
var contadorPreguntas = 0;

var listaPreguntas = document.getElementById('lista-preguntas');
var botonAgregar = document.getElementById('btn-agregar-pregunta');
var formulario = document.getElementById('form-encuesta');
var tablaEncuestas = document.getElementById('tabla-encuestas');
var avisoEncuestas = document.getElementById('aviso-encuestas');

function urlEncuesta(id) {
    var base = new URL('../php/responderEncuesta.php', window.location.href);
    base.searchParams.set('id', id);
    return base.href;
}

// ---------------------------------------------------------------------
// Constructor de preguntas
// ---------------------------------------------------------------------
function crearPregunta() {
    contadorPreguntas++;

    var bloque = document.createElement('div');
    bloque.className = 'pregunta-bloque';
    bloque.setAttribute('data-indice', contadorPreguntas);

    bloque.innerHTML = [
        '<div class="pregunta-cabecera">',
        '   <span class="pregunta-numero">Pregunta ' + contadorPreguntas + '</span>',
        '   <button type="button" class="btn-quitar" data-accion="quitar">Quitar</button>',
        '</div>',
        '<div class="form-field">',
        '   <label>Enunciado:</label>',
        '   <input type="text" class="pregunta-texto" maxlength="255" placeholder="¿Cómo califica...?" required>',
        '</div>',
        '<div class="form-field">',
        '   <label>Tipo de respuesta:</label>',
        '   <select class="pregunta-tipo">',
        '       <option value="multiple">Opción múltiple</option>',
        '       <option value="escala">Escala numérica (1 a 5)</option>',
        '       <option value="texto">Texto libre</option>',
        '   </select>',
        '</div>',
        '<div class="form-field campo-opciones" style="display: none;">',
        '   <label>Opciones (una por línea, mínimo 2):</label>',
        '   <textarea class="pregunta-opciones" rows="3" placeholder="Excelente&#10;Buena&#10;Regular"></textarea>',
        '</div>'
    ].join('');

    listaPreguntas.appendChild(bloque);

    var tipo = bloque.querySelector('.pregunta-tipo');
    var campoOpciones = bloque.querySelector('.campo-opciones');

    tipo.addEventListener('change', function () {
        campoOpciones.style.display = (tipo.value == 'multiple') ? 'block' : 'none';
    });

    bloque.querySelector('[data-accion="quitar"]').onclick = function () {
        listaPreguntas.removeChild(bloque);
    };

    campoOpciones.style.display = 'block';
}

function recogerPreguntas() {
    var bloques = listaPreguntas.querySelectorAll('.pregunta-bloque');
    var preguntas = [];

    for (var i = 0; i < bloques.length; i++) {
        var bloque = bloques[i];
        var texto = bloque.querySelector('.pregunta-texto').value.trim();
        var tipo = bloque.querySelector('.pregunta-tipo').value;
        var opciones = [];

        if (tipo == 'multiple') {
            var lineas = bloque.querySelector('.pregunta-opciones').value.split('\n');

            for (var j = 0; j < lineas.length; j++) {
                if (lineas[j].trim() != '') {
                    opciones.push(lineas[j].trim());
                }
            }
        }

        preguntas.push({ texto: texto, tipo: tipo, opciones: opciones });
    }

    return preguntas;
}

// ---------------------------------------------------------------------
// Listado
// ---------------------------------------------------------------------
function armarFila(encuesta) {
    var estadoActivo = encuesta.estado == 1;
    var textoEstado = estadoActivo ? 'Activa' : 'Inactiva';
    var claseEstado = estadoActivo ? 'estado-activo' : 'estado-inactivo';
    var siguiente = estadoActivo ? 0 : 1;
    var textoBoton = estadoActivo ? 'Desactivar' : 'Activar';

    var fila = '<tr>';
    fila = fila + '<td>#' + escapar(encuesta.id_encuesta) + '</td>';
    fila = fila + '<td>' + escapar(encuesta.titulo) + '</td>';
    fila = fila + '<td>' + escapar(encuesta.total_preguntas) + '</td>';
    fila = fila + '<td>' + escapar(encuesta.total_respuestas) + '</td>';
    fila = fila + '<td><span class="' + claseEstado + '">' + textoEstado + '</span></td>';
    fila = fila + '<td class="acciones">';
    fila = fila + '<button type="button" class="btn-accion" data-accion="qr" data-id="' + encuesta.id_encuesta + '">Ver QR</button>';
    fila = fila + '<a class="btn-accion" href="resultados_Encuestas.html?id=' + encodeURIComponent(encuesta.id_encuesta) + '">Resultados</a>';
    fila = fila + '<button type="button" class="btn-accion" data-accion="estado" data-id="' + encuesta.id_encuesta + '" data-estado="' + siguiente + '">' + textoBoton + '</button>';
    fila = fila + '<button type="button" class="btn-accion btn-borrar" data-accion="eliminar" data-id="' + encuesta.id_encuesta + '">Eliminar</button>';
    fila = fila + '</td>';
    fila = fila + '</tr>';

    return fila;
}

function conectarBotones() {
    var botones = document.querySelectorAll('#tabla-encuestas [data-accion]');

    for (var i = 0; i < botones.length; i++) {
        botones[i].onclick = manejarBoton;
    }
}

function manejarBoton() {
    var accion = this.getAttribute('data-accion');
    var id = this.getAttribute('data-id');

    if (accion == 'qr') {
        mostrarQR(id);
    }

    if (accion == 'estado') {
        cambiarEstado(id, this.getAttribute('data-estado'));
    }

    if (accion == 'eliminar') {
        eliminarEncuesta(id);
    }
}

function buscarEncuesta(id) {
    for (var i = 0; i < listaEncuestas.length; i++) {
        if (listaEncuestas[i].id_encuesta == id) {
            return listaEncuestas[i];
        }
    }

    return null;
}

function renderizarLista() {
    fetch('../php/encuestas.php?accion=listar')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (encuestas) {
            if (!Array.isArray(encuestas)) {
                encuestas = [];
            }

            listaEncuestas = encuestas;

            if (encuestas.length == 0) {
                tablaEncuestas.innerHTML = '';
                avisoEncuestas.style.display = 'block';
                return;
            }

            avisoEncuestas.style.display = 'none';

            var filas = '';

            for (var i = 0; i < encuestas.length; i++) {
                filas = filas + armarFila(encuestas[i]);
            }

            tablaEncuestas.innerHTML = filas;
            conectarBotones();
        })
        .catch(function () {
            tablaEncuestas.innerHTML = '';
            avisoEncuestas.textContent = 'No se pudieron cargar las encuestas.';
            avisoEncuestas.style.display = 'block';
        });
}

// ---------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------
function enviar(datos, alTerminar) {
    fetch('../php/encuestas.php', {
        method: 'POST',
        body: datos
    })
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (resultado) {
        if (resultado != null && resultado.ok == true) {
            if (resultado.mensaje) {
                alert(resultado.mensaje);
            }
            if (alTerminar != null) {
                alTerminar();
            }
            return;
        }

        alert(resultado != null && resultado.mensaje ? resultado.mensaje : 'No se pudo completar la operación.');
    })
    .catch(function () {
        alert('No se pudo conectar con el servidor.');
    });
}

function cambiarEstado(id, estado) {
    var mensaje = '¿Activar esta encuesta? El QR volverá a funcionar.';
    if (estado == '0') {
        mensaje = '¿Desactivar esta encuesta? Su QR dejará de funcionar.';
    }

    if (confirm(mensaje) == false) {
        return;
    }

    var datos = new FormData();
    datos.append('accion', 'estado');
    datos.append('id_encuesta', id);
    datos.append('estado', estado);

    enviar(datos, renderizarLista);
}

function eliminarEncuesta(id) {
    var encuesta = buscarEncuesta(id);
    var titulo = encuesta != null ? encuesta.titulo : '#' + id;

    if (confirm('¿Eliminar la encuesta "' + titulo + '" y todas sus respuestas?') == false) {
        return;
    }

    var datos = new FormData();
    datos.append('accion', 'eliminar');
    datos.append('id_encuesta', id);

    enviar(datos, renderizarLista);
}

// ---------------------------------------------------------------------
// QR
// ---------------------------------------------------------------------
function mostrarQR(id) {
    var url = urlEncuesta(id);

    document.getElementById('modal-qr-url').textContent = url;
    var contenedor = document.getElementById('modal-qr-codigo');
    contenedor.innerHTML = '';
    document.getElementById('modal-qr-descargar').style.display = 'none';
    document.getElementById('modal-qr').style.display = 'flex';

    if (typeof QRCode == 'undefined') {
        contenedor.innerHTML = '<p class="modal-qr-error">No se pudo generar el QR.</p>';
        return;
    }

    new QRCode(contenedor, {
        text: url,
        width: 224,
        height: 224,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    var lienzo = contenedor.querySelector('canvas');
    var descarga = document.getElementById('modal-qr-descargar');

    if (lienzo) {
        descarga.href = lienzo.toDataURL('image/png');
        descarga.download = 'qr_encuesta_' + id + '.png';
        descarga.style.display = '';
    }
}

document.getElementById('modal-qr-cerrar').onclick = function () {
    document.getElementById('modal-qr').style.display = 'none';
};

document.getElementById('modal-qr').onclick = function (evento) {
    if (evento.target === this) {
        this.style.display = 'none';
    }
};

// ---------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------
botonAgregar.onclick = crearPregunta;

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var titulo = document.getElementById('enc-titulo').value.trim();
    var descripcion = document.getElementById('enc-descripcion').value.trim();
    var preguntas = recogerPreguntas();

    if (titulo == '') {
        alert('Ingrese el título de la encuesta.');
        return;
    }

    if (preguntas.length == 0) {
        alert('Agregue al menos una pregunta.');
        return;
    }

    for (var i = 0; i < preguntas.length; i++) {
        if (preguntas[i].texto == '') {
            alert('La pregunta ' + (i + 1) + ' no tiene enunciado.');
            return;
        }
        if (preguntas[i].tipo == 'multiple' && preguntas[i].opciones.length < 2) {
            alert('La pregunta ' + (i + 1) + ' necesita al menos 2 opciones.');
            return;
        }
    }

    var datos = new FormData();
    datos.append('accion', 'crear');
    datos.append('titulo', titulo);
    datos.append('descripcion', descripcion);
    datos.append('preguntas', JSON.stringify(preguntas));

    enviar(datos, function () {
        formulario.reset();
        listaPreguntas.innerHTML = '';
        contadorPreguntas = 0;
        crearPregunta();
        renderizarLista();
    });
});

crearPregunta();
renderizarLista();
