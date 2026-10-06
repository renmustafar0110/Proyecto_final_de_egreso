var archivo = document.getElementById('archivo');
var nombre = document.getElementById('titulo');
var categoria = document.getElementById('categoria');
var nomDoc = document.getElementById('nom_doc');
var nomPac = document.getElementById('nom_pac');
var cedula = document.getElementById('cedula');
var fecha = document.getElementById('fecha');
var boton = document.getElementById('carga_Documento');

var tamanoMaximo = 10 * 1024 * 1024; // 10 MB

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
    .then(function (mensaje) {
        alert(mensaje.trim());
    });
}

boton.onclick = function (e) {
    e.preventDefault();

    if (validarFormulario() == false) {
        return;
    }

    enviarDocumento();
};
