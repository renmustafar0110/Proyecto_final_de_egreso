// Lógica de la página de Carga de Documentos

// Se obtienen los campos del formulario
var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var boton = document.getElementById('carga_Documento');

// Al hacer clic en el botón se envía el formulario al servidor
boton.onclick = function (e) {
    // Se evita que el formulario se envíe de la forma normal
    e.preventDefault();

    // Se arman los datos del documento a enviar
    var doc = new FormData();
    doc.append('nombre', nombre.value);
    doc.append('archivo', archivo.files[0]);
    doc.append('tipo_documento', categoria.value);

    // Se envía el formulario al archivo PHP que guarda el documento
    fetch('../php/cargaDocumentos.php', {
        method: 'POST',
        body: doc
    })
    .then(function (respuesta) {
        return respuesta.text();
    })
    .then(function (mensaje) {
        // Se muestra el mensaje que devuelve el servidor
        alert(mensaje.trim());
    });
};