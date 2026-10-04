
var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var boton = document.getElementById('carga_Documento');

var TAMANO_MAXIMO = 10 * 1024 * 1024; // 10 MB

boton.onclick = function (e) {
    e.preventDefault();

    if (archivo.files.length === 0) {
        alert('Seleccione un archivo primero.');
        return;
    }

    if (archivo.files[0].size > TAMANO_MAXIMO) {
        alert('El archivo supera el límite permitido de 10 MB.');
        return;
    }

    var doc = new FormData();
    doc.append('nombre', nombre.value);
    doc.append('archivo', archivo.files[0]);
    doc.append('tipo_documento', categoria.value);

    fetch('../php/cargaDocumentos.php', {
        method: 'POST',
        body: doc
    })
    .then(function (respuesta) {
        return respuesta.text();
    })
    .then(function (mensaje) {
        alert(mensaje.trim());
    });
};