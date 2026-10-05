var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var nomDoc = document.getElementById('nom_doc');
var nomPac = document.getElementById('nom_pac');
var cedula = document.getElementById('cedula');
var fecha = document.getElementById('fecha');
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

    var doctor = nomDoc.value.trim();
    var paciente = nomPac.value.trim();
    var ced = cedula.value.trim();
    var fechaDoc = fecha.value;

    if (fechaDoc === '') {
        alert('Seleccione la fecha de publicación.');
        fecha.focus();
        return;
    }

    if (doctor === '') {
        alert('Ingrese el nombre del doctor que sube el documento.');
        nomDoc.focus();
        return;
    }

    if (paciente === '') {
        alert('Ingrese el nombre del paciente al que corresponde el documento.');
        nomPac.focus();
        return;
    }

    if (ced === '') {
        alert('Ingrese la cédula del paciente.');
        cedula.focus();
        return;
    }

    if (!/^\d+$/.test(ced)) {
        alert('La cédula del paciente solo puede contener números.');
        cedula.focus();
        return;
    }

    var doc = new FormData();
    doc.append('titulo_del_documento', nombre.value);
    doc.append('archivo', archivo.files[0]);
    doc.append('categoria_del_documento', categoria.value);
    doc.append('nom_doc', doctor);
    doc.append('nom_pac', paciente);
    doc.append('cedula', ced);
    doc.append('fecha', fechaDoc);

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