
var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var boton = document.getElementById('carga_Documento');

boton.onclick = function (e) {
    e.preventDefault();

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