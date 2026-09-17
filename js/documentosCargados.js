
function obtenerDocumentos() {
    return fetch('../php/listarDocumentos.php')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            return [];
        });
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

function crearFila(documento) {
    var ruta = '../php/' + documento.archivo;

    var fila = '<tr>';
    fila = fila + '<td>' + documento.nombre + '</td>';
    fila = fila + '<td>' + formatearFecha(documento.fecha_publicacion) + '</td>';
    fila = fila + '<td>Activo</td>';
    fila = fila + '<td><a href="' + ruta + '" target="_blank">Ver</a></td>';
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
        var tipo = documento.tipo_documento;

        if (tipo == null || tipo == '') {
            tipo = 'informacion_general';
        }

        if (tipo == claveCategoria) {
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

        llenarCategoria('tbody-info-general', 'vacía-info-general', 'informacion_general', documentos);
        llenarCategoria('tbody-indicaciones', 'vacía-indicaciones', 'indicaciones', documentos);
        llenarCategoria('tbody-estudios', 'vacía-estudios', 'estudios', documentos);
        llenarCategoria('tbody-enfermeria', 'vacía-enfermeria', 'enfermeria', documentos);
        llenarCategoria('tbody-encuestas', 'vacía-encuestas', 'encuestas', documentos);
    });
}

window.onload = function () {
    renderizarTabla();
};