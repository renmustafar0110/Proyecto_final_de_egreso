// Lógica de la página de Carga de Documentos

// Obtiene los campos del formulario
var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var boton = document.getElementById('carga_Documento');

// Al hacer clic en el botón envía el formulario
boton.onclick = function (e) {
    // Evita el envío normal del formulario
    e.preventDefault();

    // Arma los datos del documento
    var doc = new FormData();
    doc.append('nombre', nombre.value);
    doc.append('archivo', archivo.files[0]);
    doc.append('tipo_documento', categoria.value);

    // Envía el formulario al archivo PHP
    fetch('../php/cargaDocumentos.php', {
        method: 'POST',
        body: doc
    })
    .then(function (respuesta) {
        return respuesta.text();
    })
    .then(function (mensaje) {
        // Muestra el mensaje del servidor
        alert(mensaje.trim());
    });
};