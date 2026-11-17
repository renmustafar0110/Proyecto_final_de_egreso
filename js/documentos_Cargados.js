// documentos_Cargados.js - Listado y gestion de documentos del panel administrativo.
// Lista en memoria de los documentos cargados.
var listaDocumentos = [];

// Referencias al modal de edicion de documentos.
var modal = document.getElementById('edit-modal');
var formEditar = document.getElementById('edit-form');
var campoId = document.getElementById('edit-id');
var campoTitulo = document.getElementById('edit-titulo');
var campoCategoria = document.getElementById('edit-categoria');
var campoFecha = document.getElementById('edit-fecha');

// Referencias a los filtros del listado.
var campoBuscar = document.getElementById('buscar-titulo');
var selectCategoria = document.getElementById('filtrar-categoria');
var avisoSinResultados = document.getElementById('sin-resultados');

// Pide al backend todos los documentos cargados.
function obtenerDocumentos() {
    return fetch('../php/listarDocumentos.php')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            return [];
        });
}

// Convierte una fecha YYYY-MM-DD a DD/MM/YYYY.
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

// Asigna una categoria por defecto cuando el documento no tiene una.
function normalizarCategoria(valor) {
    if (valor == null || valor == '') {
        return 'informacion_general';
    }

    return valor;
}

// Genera el HTML de una fila con sus acciones (ver, editar, estado, eliminar).
function crearFila(documento) {
    var ruta = '../php/' + documento.archivo;
    var activo = documento.estado == 1;

    var claseBotonEstado = 'btn-accion btn-encender';
    var textoBotonEstado = 'Activar';
    var textoEstado = 'Inactivo';
    var claseEstado = 'estado-inactivo';
    var estadoSiguiente = 1;

    // Se define el texto y el estado siguiente segun si el documento esta activo.
    if (activo) {
        claseBotonEstado = 'btn-accion btn-apagar';
        textoBotonEstado = 'Desactivar';
        textoEstado = 'Activo';
        claseEstado = 'estado-activo';
        estadoSiguiente = 0;
    }

    var fila = '<tr>';
    fila = fila + '<td>' + escapar(documento.titulo_del_documento) + '</td>';
    fila = fila + '<td>' + formatearFecha(documento.fecha_publicacion) + '</td>';
    fila = fila + '<td><span class="' + claseEstado + '">' + textoEstado + '</span></td>';
    fila = fila + '<td class="acciones">';
    fila = fila + '<a href="' + escapar(ruta) + '" target="_blank" class="btn-accion">Ver</a>';
    fila = fila + '<button type="button" class="btn-accion" data-accion="editar" data-id="' + documento.id_documento + '">Editar</button>';
    fila = fila + '<button type="button" class="' + claseBotonEstado + '" data-accion="estado" data-id="' + documento.id_documento + '" data-estado="' + estadoSiguiente + '">' + textoBotonEstado + '</button>';
    fila = fila + '<button type="button" class="btn-accion btn-borrar" data-accion="eliminar" data-id="' + documento.id_documento + '">Eliminar</button>';
    fila = fila + '</td>';
    fila = fila + '</tr>';

    return fila;
}

// Filtra los documentos por texto y categoria y redibuja cada carpeta.
function aplicarFiltros() {
    var texto = '';

    if (campoBuscar != null) {
        texto = campoBuscar.value.trim().toLowerCase();
    }

    var categoriaSeleccionada = '';

    if (selectCategoria != null) {
        categoriaSeleccionada = selectCategoria.value;
    }

    // Se recorren las carpetas y se filtran sus filas segun la busqueda.
    var carpetas = document.querySelectorAll('.carpeta');
    var totalVisibles = 0;

    for (var i = 0; i < carpetas.length; i++) {
        var carpeta = carpetas[i];
        var clave = carpeta.getAttribute('data-categoria');

        if (categoriaSeleccionada != '' && categoriaSeleccionada != clave) {
            carpeta.style.display = 'none';
            continue;
        }

        var cuerpoTabla = carpeta.querySelector('tbody');
        var aviso = carpeta.querySelector('.vacia');
        var filas = '';
        var coincidencias = 0;

        for (var j = 0; j < listaDocumentos.length; j++) {
            var documento = listaDocumentos[j];

            if (normalizarCategoria(documento.categoria_del_documento) != clave) {
                continue;
            }

            var titulo = '';

            if (documento.titulo_del_documento != null) {
                titulo = String(documento.titulo_del_documento).toLowerCase();
            }

            if (texto != '' && titulo.indexOf(texto) == -1) {
                continue;
            }

            filas = filas + crearFila(documento);
            coincidencias++;
        }

        cuerpoTabla.innerHTML = filas;

        if (aviso != null) {
            if (coincidencias == 0) {
                aviso.style.display = 'block';
            } else {
                aviso.style.display = 'none';
            }
        }

        carpeta.style.display = '';

        if (coincidencias > 0) {
            totalVisibles = totalVisibles + coincidencias;
        }
    }

    // Si hay filtro y no se encontro nada, se muestra el aviso general.
    if (avisoSinResultados != null) {
        var hayFiltro = texto != '' || categoriaSeleccionada != '';

        if (hayFiltro && totalVisibles == 0) {
            avisoSinResultados.style.display = 'block';
        } else {
            avisoSinResultados.style.display = 'none';
        }
    }

    conectarBotones();
}

// Asigna el manejador a todos los botones de accion de la tabla.
function conectarBotones() {
    var botones = document.querySelectorAll('[data-accion]');

    for (var i = 0; i < botones.length; i++) {
        botones[i].onclick = manejarBoton;
    }
}

// Deriva la accion del boton (editar, estado o eliminar).
function manejarBoton() {
    var accion = this.getAttribute('data-accion');
    var id = this.getAttribute('data-id');

    if (accion == 'editar') {
        abrirEdicion(id);
    }

    if (accion == 'estado') {
        cambiarEstado(this);
    }

    if (accion == 'eliminar') {
        eliminarDocumento(id);
    }
}

// Carga los documentos y aplica los filtros actuales.
function renderizarTabla() {
    obtenerDocumentos().then(function (documentos) {
        if (documentos == null) {
            documentos = [];
        }

        listaDocumentos = documentos;

        aplicarFiltros();
    });
}

// La busqueda y el filtro de categoria se aplican al escribir o cambiar.
if (campoBuscar != null) {
    campoBuscar.addEventListener('input', aplicarFiltros);
}

if (selectCategoria != null) {
    selectCategoria.addEventListener('change', aplicarFiltros);
}

// Busca un documento por id dentro de la lista ya cargada.
function buscarDocumento(id) {
    for (var i = 0; i < listaDocumentos.length; i++) {
        if (listaDocumentos[i].id_documento == id) {
            return listaDocumentos[i];
        }
    }

    return null;
}

// Envia una accion de gestion al backend y avisa el resultado.
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

// Abre el modal de edicion con los datos del documento.
function abrirEdicion(id) {
    var documento = buscarDocumento(id);

    if (documento == null) {
        return;
    }

    campoId.value = documento.id_documento;
    campoTitulo.value = documento.titulo_del_documento;
    campoCategoria.value = normalizarCategoria(documento.categoria_del_documento);

    campoFecha.value = '';
    if (documento.fecha_publicacion != null) {
        campoFecha.value = documento.fecha_publicacion;
    }

    modal.classList.add('abierto');
}

// Cierra el modal de edicion.
function cerrarEdicion() {
    modal.classList.remove('abierto');
}

// Activa o desactiva un documento con confirmacion.
function cambiarEstado(boton) {
    var id = boton.getAttribute('data-id');
    var estado = boton.getAttribute('data-estado');
    var mensaje = '';

    if (estado == '1') {
        mensaje = '¿Activar este documento? Volverá a estar disponible para los pacientes.';
    } else {
        mensaje = '¿Desactivar este documento? Dejará de mostrarse en la consulta pública.';
    }

    if (confirm(mensaje) == false) {
        return;
    }

    var datos = new FormData();
    datos.append('accion', 'estado');
    datos.append('id_documento', id);
    datos.append('estado', estado);

    enviarGestion(datos, renderizarTabla);
}

// Elimina un documento y su archivo del servidor, con confirmacion.
function eliminarDocumento(id) {
    var documento = buscarDocumento(id);

    if (documento == null) {
        return;
    }

    var mensaje = '¿Eliminar "' + documento.titulo_del_documento + '"? Esta acción no se puede deshacer y se borrará el archivo del servidor.';

    if (confirm(mensaje) == false) {
        return;
    }

    var datos = new FormData();
    datos.append('accion', 'eliminar');
    datos.append('id_documento', id);

    enviarGestion(datos, renderizarTabla);
}

// Eventos del modal de edicion: cancelar, clic fuera y guardar cambios.
document.getElementById('edit-cancelar').onclick = cerrarEdicion;

// Un clic fuera de la caja del modal lo cierra.
modal.addEventListener('click', function (evento) {
    if (evento.target == modal) {
        cerrarEdicion();
    }
});

// Guarda los cambios del formulario de edicion.
formEditar.onsubmit = function (evento) {
    evento.preventDefault();

    if (campoTitulo.value.trim() == '') {
        alert('El título no puede quedar vacío.');
        return;
    }

    if (campoFecha.value == '') {
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

// Al cargar la pagina se muestra el listado de documentos.
window.onload = function () {
    renderizarTabla();
};
