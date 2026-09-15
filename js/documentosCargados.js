// Lógica de la página de Documentos Cargados

// Consulta la lista de documentos al servidor
function obtenerDocumentos() {
    return fetch('../php/listarDocumentos.php')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            // Si hay un error se devuelve una lista vacía
            return [];
        });
}

// Convierte la fecha de formato aaaa-mm-dd a dd/mm/aaaa
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

// Arma la fila de la tabla con los datos de un documento
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

// Llena una categoría con los documentos que le corresponden
function llenarCategoria(idCuerpo, idAviso, claveCategoria, documentos) {
    var cuerpoTabla = document.getElementById(idCuerpo);
    var aviso = document.getElementById(idAviso);

    if (cuerpoTabla == null) {
        return;
    }

    var filas = '';

    // Se recorren todos los documentos buscando los de esa categoría
    for (var i = 0; i < documentos.length; i++) {
        var documento = documentos[i];
        var tipo = documento.tipo_documento;

        // Si no tiene categoría se toma como "informacion_general"
        if (tipo == null || tipo == '') {
            tipo = 'informacion_general';
        }

        if (tipo == claveCategoria) {
            filas = filas + crearFila(documento);
        }
    }

    // Se colocan las filas dentro de la tabla
    cuerpoTabla.innerHTML = filas;

    // Se muestra el aviso solo si no hay documentos en la categoría
    if (aviso != null) {
        if (filas == '') {
            aviso.style.display = 'block';
        } else {
            aviso.style.display = 'none';
        }
    }
}

// Muestra todos los documentos en sus categorías
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

// Al cargar la página se muestran los documentos
window.onload = function () {
    renderizarTabla();
};