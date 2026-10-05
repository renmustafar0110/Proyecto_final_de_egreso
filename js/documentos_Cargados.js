var listaDocumentos = [];

var modal = document.getElementById('edit-modal');
var formEditar = document.getElementById('edit-form');
var campoId = document.getElementById('edit-id');
var campoTitulo = document.getElementById('edit-titulo');
var campoCategoria = document.getElementById('edit-categoria');
var campoFecha = document.getElementById('edit-fecha');

function obtenerDocumentos() {
    return fetch('../php/listarDocumentos.php')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            return [];
        });
}

function escapar(valor) {
    if (valor == null) {
        return '';
    }

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatearFecha(valor) {
    if (valor == null || valor == '') {
        return '—';
    }

    var partes = valor.split('-');

    if (partes.length != 3) {
        return valor;
    }

    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function normalizarCategoria(valor) {
    if (valor == null || valor == '') {
        return 'informacion_general';
    }

    return valor;
}

function crearFila(documento) {
    var ruta = '../php/' + documento.archivo;
    var activo = documento.estado == 1;
    var claseBotonEstado = activo ? 'btn-accion btn-apagar' : 'btn-accion btn-encender';
    var textoBotonEstado = activo ? 'Desactivar' : 'Activar';
    var textoEstado = activo ? 'Activo' : 'Inactivo';
    var claseEstado = activo ? 'estado-activo' : 'estado-inactivo';

    var fila = '<tr>';
    fila = fila + '<td>' + escapar(documento.titulo_del_documento) + '</td>';
    fila = fila + '<td>' + formatearFecha(documento.fecha_publicacion) + '</td>';
    fila = fila + '<td><span class="' + claseEstado + '">' + textoEstado + '</span></td>';
    fila = fila + '<td class="acciones">';
    fila = fila + '<a href="' + escapar(ruta) + '" target="_blank" class="btn-accion">Ver</a>';
    fila = fila + '<button type="button" class="btn-accion" data-accion="editar" data-id="' + documento.id_documento + '">Editar</button>';
    fila = fila + '<button type="button" class="' + claseBotonEstado + '" data-accion="estado" data-id="' + documento.id_documento + '" data-estado="' + (activo ? 0 : 1) + '">' + textoBotonEstado + '</button>';
    fila = fila + '<button type="button" class="btn-accion btn-borrar" data-accion="eliminar" data-id="' + documento.id_documento + '">Eliminar</button>';
    fila = fila + '</td>';
    fila = fila + '</tr>';

    return fila;
}

function llenarCategoria(idCuerpo, idAviso, claveCategoria, documentos) {
    var cuerpoTabla = document.getElementById(idCuerpo);
    var aviso = document.getElementById(idAviso);

    if (cuerpoTabla == null) {
        return;
    }

    var filas = '';

    for (var i = 0; i < documentos.length; i++) {
        var documento = documentos[i];

        if (normalizarCategoria(documento.categoria_del_documento) === claveCategoria) {
            filas = filas + crearFila(documento);
        }
    }

    cuerpoTabla.innerHTML = filas;

    if (aviso != null) {
        if (filas == '') {
            aviso.style.display = 'block';
        } else {
            aviso.style.display = 'none';
        }
    }
}

function renderizarTabla() {
    obtenerDocumentos().then(function (documentos) {
        if (documentos == null) {
            documentos = [];
        }

        listaDocumentos = documentos;

        llenarCategoria('tbody-info-general', 'vacía-info-general', 'informacion_general', documentos);
        llenarCategoria('tbody-indicaciones', 'vacía-indicaciones', 'indicaciones', documentos);
        llenarCategoria('tbody-estudios', 'vacía-estudios', 'estudios', documentos);
        llenarCategoria('tbody-enfermeria', 'vacía-enfermeria', 'enfermeria', documentos);
        llenarCategoria('tbody-encuestas', 'vacía-encuestas', 'encuestas', documentos);
    });
}

function buscarDocumento(id) {
    for (var i = 0; i < listaDocumentos.length; i++) {
        if (listaDocumentos[i].id_documento == id) {
            return listaDocumentos[i];
        }
    }

    return null;
}

function enviarGestion(datos, alTerminar) {
    fetch('../php/gestionarDocumento.php', {
        method: 'POST',
        body: datos
    })
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (resultado) {
        if (resultado == null) {
            return;
        }

        alert(resultado.mensaje);

        if (resultado.ok && alTerminar != null) {
            alTerminar();
        }
    })
    .catch(function () {
        alert('No se pudo conectar con el servidor');
    });
}

function abrirEdicion(id) {
    var documento = buscarDocumento(id);

    if (documento == null) {
        return;
    }

    campoId.value = documento.id_documento;
    campoTitulo.value = documento.titulo_del_documento;
    campoCategoria.value = normalizarCategoria(documento.categoria_del_documento);
    campoFecha.value = (documento.fecha_publicacion == null) ? '' : documento.fecha_publicacion;

    modal.classList.add('abierto');
}

function cerrarEdicion() {
    modal.classList.remove('abierto');
}

document.addEventListener('click', function (evento) {
    if (evento.target == null || typeof evento.target.closest !== 'function') {
        return;
    }

    var boton = evento.target.closest('[data-accion]');

    if (boton == null) {
        return;
    }

    var accion = boton.getAttribute('data-accion');
    var id = boton.getAttribute('data-id');

    if (accion === 'editar') {
        abrirEdicion(id);
        return;
    }

    if (accion === 'estado') {
        var activar = boton.getAttribute('data-estado') === '1';
        var mensaje = activar
            ? '¿Activar este documento? Volverá a estar disponible para los pacientes.'
            : '¿Desactivar este documento? Dejará de mostrarse en la consulta pública.';

        if (!confirm(mensaje)) {
            return;
        }

        var datosEstado = new FormData();
        datosEstado.append('accion', 'estado');
        datosEstado.append('id_documento', id);
        datosEstado.append('estado', boton.getAttribute('data-estado'));

        enviarGestion(datosEstado, renderizarTabla);
        return;
    }

    if (accion === 'eliminar') {
        var documento = buscarDocumento(id);

        if (documento == null) {
            return;
        }

        if (!confirm('¿Eliminar "' + documento.titulo_del_documento + '"? Esta acción no se puede deshacer y se borrará el archivo del servidor.')) {
            return;
        }

        var datosEliminar = new FormData();
        datosEliminar.append('accion', 'eliminar');
        datosEliminar.append('id_documento', id);

        enviarGestion(datosEliminar, renderizarTabla);
    }
});

document.getElementById('edit-cancelar').onclick = cerrarEdicion;

modal.addEventListener('click', function (evento) {
    if (evento.target === modal) {
        cerrarEdicion();
    }
});

formEditar.onsubmit = function (evento) {
    evento.preventDefault();

    if (campoTitulo.value.trim() === '') {
        alert('El título no puede quedar vacío.');
        return;
    }

    if (campoFecha.value === '') {
        alert('Seleccione una fecha de publicación.');
        return;
    }

    var datos = new FormData();
    datos.append('accion', 'editar');
    datos.append('id_documento', campoId.value);
    datos.append('titulo_del_documento', campoTitulo.value.trim());
    datos.append('categoria_del_documento', campoCategoria.value);
    datos.append('fecha_publicacion', campoFecha.value);

    enviarGestion(datos, function () {
        cerrarEdicion();
        renderizarTabla();
    });
};

window.onload = function () {
    renderizarTabla();
};
