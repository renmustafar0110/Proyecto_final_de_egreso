var listaRutas = [];

var formulario = document.getElementById('form-ruta');
var campoId = document.getElementById('id_ruta');
var campoDomicilio = document.getElementById('domicilio');
var campoKm = document.getElementById('km');
var campoEstadoTrafico = document.getElementById('estado_trafico');
var selectTraslado = document.getElementById('id_traslado');
var botonGuardar = document.getElementById('btn-guardar');
var botonCancelar = document.getElementById('btn-cancelar');
var tituloForm = document.getElementById('titulo-form');
var tablaRutas = document.getElementById('tabla-rutas');
var avisoLista = document.getElementById('aviso-lista');

function escapar(valor) {
    if (valor == null) {
        return '';
    }

    var texto = String(valor);
    texto = texto.replace(/&/g, '&amp;');
    texto = texto.replace(/</g, '&lt;');
    texto = texto.replace(/>/g, '&gt;');
    texto = texto.replace(/"/g, '&quot;');

    return texto;
}

function mostrarAvisoLista(mensaje) {
    avisoLista.textContent = mensaje;
    avisoLista.style.display = 'block';
}

function cargarRutas() {
    fetch('../php/rutas.php')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (rutas) {
            if (!Array.isArray(rutas)) {
                rutas = [];
            }

            listaRutas = rutas;

            if (rutas.length == 0) {
                tablaRutas.innerHTML = '';
                mostrarAvisoLista('No hay rutas registradas.');
                return;
            }

            avisoLista.style.display = 'none';

            var filas = '';

            for (var i = 0; i < rutas.length; i++) {
                filas = filas + armarFila(rutas[i]);
            }

            tablaRutas.innerHTML = filas;
            conectarBotones();
        })
        .catch(function () {
            tablaRutas.innerHTML = '';
            mostrarAvisoLista('No se pudieron cargar las rutas.');
        });
}

function armarFila(ruta) {
    var traslado = 'Disponible';

    if (ruta.id_traslado != null) {
        traslado = '#' + ruta.id_traslado + ' · ' +
            (ruta.origen || '—') + ' → ' + (ruta.destino || '—');
    }

    var km = '—';
    if (ruta.km != null) {
        km = ruta.km;
    }

    var fila = '<tr>';
    fila = fila + '<td>#' + escapar(ruta.id_ruta) + '</td>';
    fila = fila + '<td>' + escapar(ruta.domicilio) + '</td>';
    fila = fila + '<td>' + escapar(km) + '</td>';
    fila = fila + '<td>' + escapar(ruta.estado_trafico) + '</td>';
    fila = fila + '<td>' + escapar(traslado) + '</td>';
    fila = fila + '<td class="acciones">';
    fila = fila + '<button type="button" class="btn-accion" data-accion="editar" data-id="' + ruta.id_ruta + '">Editar</button>';
    fila = fila + '<button type="button" class="btn-accion btn-borrar" data-accion="eliminar" data-id="' + ruta.id_ruta + '">Eliminar</button>';
    fila = fila + '</td>';
    fila = fila + '</tr>';

    return fila;
}

function conectarBotones() {
    var botones = document.querySelectorAll('#tabla-rutas [data-accion]');

    for (var i = 0; i < botones.length; i++) {
        botones[i].onclick = manejarBoton;
    }
}

function manejarBoton() {
    var accion = this.getAttribute('data-accion');
    var id = this.getAttribute('data-id');

    if (accion == 'editar') {
        abrirEdicion(id);
    }

    if (accion == 'eliminar') {
        eliminarRuta(id);
    }
}

function buscarRuta(id) {
    for (var i = 0; i < listaRutas.length; i++) {
        if (listaRutas[i].id_ruta == id) {
            return listaRutas[i];
        }
    }

    return null;
}

function abrirEdicion(id) {
    var ruta = buscarRuta(id);

    if (ruta == null) {
        return;
    }

    campoId.value = ruta.id_ruta;
    campoDomicilio.value = ruta.domicilio || '';
    campoKm.value = ruta.km || '';
    campoEstadoTrafico.value = ruta.estado_trafico || 'Libre';

    if (ruta.id_traslado != null) {
        selectTraslado.value = ruta.id_traslado;
    } else {
        selectTraslado.value = '';
    }

    tituloForm.textContent = 'Editar Ruta #' + ruta.id_ruta;
    botonGuardar.value = 'Guardar cambios';
    botonCancelar.style.display = 'inline-block';

    campoDomicilio.focus();
}

function reiniciarFormulario() {
    formulario.reset();
    campoId.value = '';
    tituloForm.textContent = 'Registrar Ruta';
    botonGuardar.value = 'Registrar Ruta';
    botonCancelar.style.display = 'none';
}

function cargarTraslados() {
    fetch('../php/rutas.php?accion=traslados')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (traslados) {
            if (!Array.isArray(traslados)) {
                return;
            }

            var html = '<option value="">Disponible (sin traslado)</option>';

            for (var i = 0; i < traslados.length; i++) {
                var traslado = traslados[i];
                html = html + '<option value="' + traslado.id_traslado + '">#' +
                    escapar(traslado.id_traslado) + ' · ' +
                    escapar(traslado.origen) + ' → ' + escapar(traslado.destino) +
                    ' (' + escapar(traslado.estado) + ')</option>';
            }

            selectTraslado.innerHTML = html;
        })
        .catch(function () {
            selectTraslado.innerHTML = '<option value="">Disponible (sin traslado)</option>';
        });
}

function eliminarRuta(id) {
    var ruta = buscarRuta(id);

    if (ruta == null) {
        return;
    }

    if (confirm('¿Eliminar la ruta "' + ruta.domicilio + '"?')) {
        var datos = new FormData();
        datos.append('accion', 'eliminar');
        datos.append('id_ruta', id);

        enviar(datos);
    }
}

function enviar(datos) {
    fetch('../php/rutas.php', {
        method: 'POST',
        body: datos
    })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (resultado) {
            if (resultado != null && resultado.ok == true) {
                reiniciarFormulario();
                cargarRutas();
            } else {
                var mensaje = 'No se pudo completar la operación.';
                if (resultado != null && resultado.mensaje != null) {
                    mensaje = resultado.mensaje;
                }
                alert('Error: ' + mensaje);
            }
        })
        .catch(function () {
            alert('No se pudo conectar con el servidor.');
        });
}

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (campoDomicilio.value.trim() == '') {
        alert('Ingrese el domicilio o tramo de la ruta.');
        campoDomicilio.focus();
        return;
    }

    var datos = new FormData();

    if (campoId.value == '') {
        datos.append('accion', 'crear');
    } else {
        datos.append('accion', 'editar');
        datos.append('id_ruta', campoId.value);
    }

    datos.append('domicilio', campoDomicilio.value.trim());
    datos.append('km', campoKm.value.trim());
    datos.append('estado_trafico', campoEstadoTrafico.value);
    datos.append('id_traslado', selectTraslado.value);

    enviar(datos);
});

botonCancelar.onclick = reiniciarFormulario;

cargarRutas();
cargarTraslados();
