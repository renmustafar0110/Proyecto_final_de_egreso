// carga_Documentos.js - Formulario de carga de documentos con vista previa y QR.
// Referencias a los campos del formulario de carga.
var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var nomDoc = document.getElementById('nom_doc');
var nomPac = document.getElementById('nom_pac');
var cedula = document.getElementById('cedula');
var fechaPublicacion = document.getElementById('fecha_publicacion');
var boton = document.getElementById('carga_Documento');

// Referencias a la vista previa del archivo y a su URL temporal.
var contenedorPreview = document.getElementById('preview-contenedor');
var cajaPreview = document.getElementById('preview-documento');
var infoPreview = document.getElementById('preview-info');
var urlPreview = null;

// Tamano maximo permitido para el archivo (10 MB).
var tamanoMaximo = 10 * 1024 * 1024; // 10 MB

// URL publica del documento que se codifica dentro del QR.
function construirUrlQR(idQr) {
    var base = new URL('../php/verDocumento.php', window.location.href);
    base.searchParams.set('qr', idQr);
    return base.href;
}

// Crea el modal de QR una sola vez y lo agrega al documento.
function crearModalQR() {
    if (document.getElementById('modal-qr')) {
        return;
    }

    var modal = document.createElement('div');
    modal.className = 'modal-qr';
    modal.id = 'modal-qr';
    modal.innerHTML = [
        '<div class="modal-qr-caja">',
        '   <h3 class="modal-qr-titulo" id="modal-qr-titulo">Registro Exitoso</h3>',
        '   <p class="modal-qr-texto">Escanee el código QR para acceder al documento.</p>',
        '   <div class="modal-qr-codigo" id="modal-qr-codigo"></div>',
        '   <p class="modal-qr-url" id="modal-qr-url"></p>',
        '   <div class="modal-qr-acciones">',
        '       <a class="modal-qr-btn modal-qr-descargar" id="modal-qr-descargar" download="qr_documento.png">Descargar PNG</a>',
        '       <button type="button" class="modal-qr-btn modal-qr-cerrar" id="modal-qr-cerrar">Cerrar</button>',
        '   </div>',
        '</div>'
    ].join('');

    document.body.appendChild(modal);

    document.getElementById('modal-qr-cerrar').onclick = cerrarModalQR;

    modal.onclick = function (evento) {
        if (evento.target === modal) {
            cerrarModalQR();
        }
    };
}

// Oculta el modal de QR.
function cerrarModalQR() {
    var modal = document.getElementById('modal-qr');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Dibuja el QR en el modal y prepara la descarga en PNG.
function generarQR(url) {
    var contenedor = document.getElementById('modal-qr-codigo');
    contenedor.innerHTML = '';

    if (typeof QRCode == 'undefined') {
        contenedor.innerHTML =
            '<p class="modal-qr-error">No se pudo generar el QR. Copie la URL del documento.</p>';
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
        var nombreQr = 'qr_documento.png';
        var parametros = new URL(url).searchParams;
        var archivoQr = parametros.get('archivo');
        var idQr = parametros.get('qr');

        if (archivoQr) {
            nombreQr = 'qr_' + archivoQr.replace(/\.[^.]+$/, '') + '.png';
        } else if (idQr) {
            nombreQr = 'qr_documento_' + idQr + '.png';
        }

        descarga.href = lienzo.toDataURL('image/png');
        descarga.download = nombreQr;
        descarga.style.display = '';
    } else {
        descarga.style.display = 'none';
    }
}

// Muestra el modal de exito con el QR del documento recien cargado.
function mostrarQRExitoso(mensaje, url) {
    crearModalQR();

    document.getElementById('modal-qr-titulo').textContent = mensaje;
    document.getElementById('modal-qr-url').textContent = url;
    document.getElementById('modal-qr-codigo').innerHTML = '';
    document.getElementById('modal-qr-descargar').style.display = 'none';
    document.getElementById('modal-qr').style.display = 'flex';

    generarQR(url);
}

// Intenta interpretar la respuesta del backend como JSON.
function parsearRespuesta(texto) {
    try {
        return JSON.parse(texto);
    } catch (error) {
        return null;
    }
}

// Libera la URL temporal y limpia la vista previa.
function limpiarPreview() {
    if (urlPreview) {
        URL.revokeObjectURL(urlPreview);
        urlPreview = null;
    }

    if (cajaPreview) {
        cajaPreview.innerHTML = '';
    }
}

// Convierte bytes a un texto legible en MB.
function pesoLegible(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// Muestra una vista previa del archivo seleccionado segun su tipo.
function mostrarPreview() {
    if (contenedorPreview == null || cajaPreview == null) {
        return;
    }

    limpiarPreview();

    if (archivo.files.length == 0) {
        contenedorPreview.style.display = 'none';
        return;
    }

    var seleccionado = archivo.files[0];
    var nombreArchivo = seleccionado.name.toLowerCase();

    contenedorPreview.style.display = 'block';
    infoPreview.textContent = seleccionado.name + ' · ' + pesoLegible(seleccionado.size);

    if (seleccionado.size > tamanoMaximo) {
        cajaPreview.innerHTML = '<p class="preview-placeholder">El archivo supera el límite permitido de 10 MB.</p>';
        return;
    }

    urlPreview = URL.createObjectURL(seleccionado);

    if (seleccionado.type == 'application/pdf' || nombreArchivo.endsWith('.pdf')) {
        cajaPreview.innerHTML = '<iframe src="' + urlPreview + '" title="Vista previa del documento"></iframe>';
        return;
    }

    if (seleccionado.type.indexOf('image/') == 0) {
        cajaPreview.innerHTML = '<img src="' + urlPreview + '" alt="Vista previa del documento">';
        return;
    }

    if (seleccionado.type == 'text/plain' || nombreArchivo.endsWith('.txt')) {
        var lector = new FileReader();

        lector.onload = function (evento) {
            cajaPreview.innerHTML = '<pre class="preview-texto">' +
                evento.target.result.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
        };

        lector.readAsText(seleccionado);
        return;
    }

    cajaPreview.innerHTML = '<div class="preview-placeholder">' +
        '<div class="icono">&#128196;</div>' +
        'Este formato no tiene previsualización en el navegador.<br>' +
        'El archivo se subirá igual al confirmar.</div>';
}

// Valida archivo, fecha y datos del paciente antes de enviar.
function validarFormulario() {

    if (archivo.files.length == 0) {
        alert('Seleccione un archivo primero.');
        return false;
    }

    if (archivo.files[0].size > tamanoMaximo) {
        alert('El archivo supera el límite permitido de 10 MB.');
        return false;
    }

    if (!/\.pdf$/i.test(archivo.files[0].name)) {
        alert('Solo se permiten archivos en formato PDF.');
        return false;
    }

    if (fechaPublicacion.value == '') {
        alert('Seleccione la fecha de publicación.');
        fechaPublicacion.focus();
        return false;
    }

    if (nomDoc.value.trim() == '') {
        alert('Ingrese el nombre del doctor que sube el documento.');
        nomDoc.focus();
        return false;
    }

    if (nomPac.value.trim() == '') {
        alert('Ingrese el nombre del paciente al que corresponde el documento.');
        nomPac.focus();
        return false;
    }

    if (cedula.value.trim() == '') {
        alert('Ingrese la cédula del paciente.');
        cedula.focus();
        return false;
    }

    if (!/^\d+$/.test(cedula.value.trim())) {
        alert('La cédula del paciente solo puede contener números.');
        cedula.focus();
        return false;
    }

    return true;
}

// Envia el documento al backend y muestra el QR si se registra bien.
function enviarDocumento() {

    var datos = new FormData();
    datos.append('titulo_del_documento', nombre.value);
    datos.append('archivo', archivo.files[0]);
    datos.append('categoria_del_documento', categoria.value);
    datos.append('nom_doc', nomDoc.value.trim());
    datos.append('nom_pac', nomPac.value.trim());
    datos.append('cedula', cedula.value.trim());
    datos.append('fecha_publicacion', fechaPublicacion.value);

    // Se arma el formulario con el archivo y los datos del documento.
    fetch('../php/cargaDocumentos.php', {
        method: 'POST',
        body: datos
    })
    .then(function (respuesta) {
        return respuesta.text();
    })
    .then(function (texto) {
        var respuesta = parsearRespuesta(texto);

        // Si el registro fue correcto, se muestra el QR del documento.
        if (respuesta && respuesta.ok && respuesta.id_qr) {
            boton.form.reset();
            limpiarPreview();
            contenedorPreview.style.display = 'none';
            mostrarQRExitoso(respuesta.mensaje || 'Registro Exitoso', construirUrlQR(respuesta.id_qr));
            return;
        }

        alert(respuesta && respuesta.mensaje ? respuesta.mensaje : texto.trim());
    })
    .catch(function () {
        alert('No se pudo conectar con el servidor.');
    });
}

// Eventos del formulario: vista previa al elegir archivo y envio al confirmar.
archivo.addEventListener('change', mostrarPreview);

// Antes de enviar se valida todo el formulario.
boton.onclick = function (e) {
    e.preventDefault();

    if (validarFormulario() == false) {
        return;
    }

    enviarDocumento();
};
