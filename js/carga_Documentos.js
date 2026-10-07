var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var nomDoc = document.getElementById('nom_doc');
var nomPac = document.getElementById('nom_pac');
var cedula = document.getElementById('cedula');
var fecha = document.getElementById('fecha');
var boton = document.getElementById('carga_Documento');

var tamanoMaximo = 10 * 1024 * 1024; // 10 MB

var FUENTES_QR = [
    '../js/qrcode.min.js',
    'https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js'
];

var promesaQR = null;

function cargarScript(ruta) {
    return new Promise(function (resolver, rechazar) {
        var etiqueta = document.createElement('script');
        etiqueta.src = ruta;
        etiqueta.onload = function () {
            if (typeof QRCode != 'undefined') {
                resolver();
            } else {
                rechazar(new Error('La librería QR no expone QRCode: ' + ruta));
            }
        };
        etiqueta.onerror = function () {
            rechazar(new Error('No se pudo cargar: ' + ruta));
        };
        document.head.appendChild(etiqueta);
    });
}

function asegurarLibreriaQR() {
    if (promesaQR === null) {
        promesaQR = (function intentar(indice) {
            if (indice >= FUENTES_QR.length) {
                return Promise.reject(new Error('No se pudo cargar la librería QR'));
            }
            return cargarScript(FUENTES_QR[indice]).catch(function () {
                return intentar(indice + 1);
            });
        })(0);
    }
    return promesaQR;
}

function construirUrlDocumento(rutaBD) {
    var base = new URL('../php/', window.location.href);
    return new URL(rutaBD, base).href;
}

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

function cerrarModalQR() {
    var modal = document.getElementById('modal-qr');
    if (modal) {
        modal.style.display = 'none';
    }
}

function generarQR(url) {
    var contenedor = document.getElementById('modal-qr-codigo');
    contenedor.innerHTML = '';

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
        descarga.download = 'qr_' + url.split('/').pop().replace(/[^a-zA-Z0-9._-]/g, '_') + '.png';
        descarga.style.display = '';
    } else {
        descarga.style.display = 'none';
    }
}

function mostrarQRExitoso(mensaje, url) {
    crearModalQR();

    document.getElementById('modal-qr-titulo').textContent = mensaje;
    document.getElementById('modal-qr-url').textContent = url;
    document.getElementById('modal-qr-codigo').innerHTML = '';
    document.getElementById('modal-qr-descargar').style.display = 'none';
    document.getElementById('modal-qr').style.display = 'flex';

    asegurarLibreriaQR().then(function () {
        generarQR(url);
    }).catch(function () {
        document.getElementById('modal-qr-codigo').innerHTML =
            '<p class="modal-qr-error">No se pudo generar el QR. Copie la URL del documento.</p>';
    });
}

function parsearRespuesta(texto) {
    try {
        return JSON.parse(texto);
    } catch (error) {
        return null;
    }
}

function validarFormulario() {

    if (archivo.files.length == 0) {
        alert('Seleccione un archivo primero.');
        return false;
    }

    if (archivo.files[0].size > tamanoMaximo) {
        alert('El archivo supera el límite permitido de 10 MB.');
        return false;
    }

    if (fecha.value == '') {
        alert('Seleccione la fecha de publicación.');
        fecha.focus();
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

function enviarDocumento() {

    var datos = new FormData();
    datos.append('titulo_del_documento', nombre.value);
    datos.append('archivo', archivo.files[0]);
    datos.append('categoria_del_documento', categoria.value);
    datos.append('nom_doc', nomDoc.value.trim());
    datos.append('nom_pac', nomPac.value.trim());
    datos.append('cedula', cedula.value.trim());
    datos.append('fecha', fecha.value);

    fetch('../php/cargaDocumentos.php', {
        method: 'POST',
        body: datos
    })
    .then(function (respuesta) {
        return respuesta.text();
    })
    .then(function (texto) {
        var respuesta = parsearRespuesta(texto);

        if (respuesta && respuesta.ok && respuesta.archivo) {
            boton.form.reset();
            mostrarQRExitoso(respuesta.mensaje || 'Registro Exitoso', construirUrlDocumento(respuesta.archivo));
            return;
        }

        alert(respuesta && respuesta.mensaje ? respuesta.mensaje : texto.trim());
    })
    .catch(function () {
        alert('No se pudo conectar con el servidor.');
    });
}

boton.onclick = function (e) {
    e.preventDefault();

    if (validarFormulario() == false) {
        return;
    }

    enviarDocumento();
};

asegurarLibreriaQR().catch(function () {});
