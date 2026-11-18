<?php

// cargaDocumentos.php - Sube un PDF y registra paciente, QR y documento.
// Se cargan la conexion y el control de sesion.
require_once 'conexion.php';
require_once 'sesion.php';
require_once __DIR__ . '/funciones_comunes.php';

// Solo administradores de documentos pueden subir archivos.
requiereSesion(array('admin_documentos', 'super_admin'));

// Respuesta JSON generica.
function responder($ok, $mensaje, $extra = array()) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(array('ok' => $ok, 'mensaje' => $mensaje), $extra));
    exit;
}

// Debe venir un archivo y los datos del formulario.
if (!isset($_FILES['archivo'])) {
    responder(false, 'No se seleccionó ningún archivo');
}

$archivo = $_FILES['archivo'];

// Datos del formulario.
$titulo = campoPost('titulo_del_documento');
$nomDoc = campoPost('nom_doc');
$nomPac = campoPost('nom_pac');
$cedula = campoPost('cedula');
$fechaPublicacion = campoPost('fecha_publicacion');

// Validaciones de campos y fecha.
if ($titulo == '') {
    responder(false, 'Seleccione el titulo del documento');
}

if ($fechaPublicacion == '') {
    responder(false, 'Seleccione la fecha de publicación');
}

$partesFecha = explode('-', $fechaPublicacion);

if (count($partesFecha) != 3
    || !ctype_digit($partesFecha[0])
    || !ctype_digit($partesFecha[1])
    || !ctype_digit($partesFecha[2])
    || !checkdate(intval($partesFecha[1]), intval($partesFecha[2]), intval($partesFecha[0]))) {
    responder(false, 'La fecha de publicación no es valida');
}

if ($nomDoc == '') {
    responder(false, 'Ingrese el nombre del doctor que sube el documento');
}

if ($nomPac == '') {
    responder(false, 'Ingrese el nombre del paciente al que corresponde el documento');
}

if ($cedula == '') {
    responder(false, 'Ingrese la cedula del paciente');
}

if (!ctype_digit($cedula)) {
    responder(false, 'La cedula del paciente solo puede contener numeros');
}

// Categoria por defecto.
$categoria = 'informacion_general';
if (isset($_POST['categoria_del_documento']) && $_POST['categoria_del_documento'] != '') {
    $categoria = $_POST['categoria_del_documento'];
}

// Validacion del archivo: errores de subida, tamano, extension y MIME.
$tamanoMaximo = 10 * 1024 * 1024; // 10 MB

if ($archivo['error'] != 0) {
    if ($archivo['error'] == UPLOAD_ERR_INI_SIZE || $archivo['error'] == UPLOAD_ERR_FORM_SIZE) {
        responder(false, 'El archivo supera el límite permitido de 10 MB');
    }
    responder(false, 'Error al subir el archivo (código ' . $archivo['error'] . ')');
}

if ($archivo['size'] > $tamanoMaximo) {
    responder(false, 'El archivo supera el límite permitido de 10 MB');
}

// US-01: solo se aceptan documentos PDF (validado por extensión y tipo MIME real)
$extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));

if ($extension !== 'pdf') {
    responder(false, 'Solo se permiten archivos en formato PDF');
}

$tipoReal = '';
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipoReal = finfo_file($finfo, $archivo['tmp_name']);
    finfo_close($finfo);
}

if ($tipoReal !== '' && $tipoReal !== 'application/pdf') {
    responder(false, 'El archivo no es un PDF válido');
}

// Se guarda el PDF con un nombre unico en la carpeta Documento.
$carpetaDestino = __DIR__ . '/Documento/';

if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

$nombreLimpio = preg_replace('/[^a-zA-Z0-9._-]/', '_', $archivo['name']);
$nombreArchivo = time() . '_' . $nombreLimpio;
$ruta = $carpetaDestino . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
    responder(false, 'No se pudo guardar el archivo en el servidor');
}

// Datos escapados para insertar en la base.
$rutaBD = 'Documento/' . $nombreArchivo;

$tituloEscapado = $conexion->real_escape_string($titulo);
$categoriaEscapada = $conexion->real_escape_string($categoria);
$nomDocEscapado = $conexion->real_escape_string($nomDoc);
$nomPacEscapado = $conexion->real_escape_string($nomPac);

// US-01: cada documento tiene su propio QR vinculado al paciente.
// La tabla QR referencia a Pacientes, así que el paciente debe existir.
// Se asegura que el paciente exista para poder asociarle el QR.
$cedulaEscapada = $conexion->real_escape_string($cedula);

// Se separa el nombre y el apellido del paciente.
$partesNombre = explode(' ', $nomPac, 2);
$nombrePaciente = $conexion->real_escape_string(trim($partesNombre[0]));
$apellidoPaciente = '';
if (count($partesNombre) > 1) {
    $apellidoPaciente = $conexion->real_escape_string(trim($partesNombre[1]));
}

// Alta del paciente si no existe (sin modificar sus datos si ya existe).
$sqlPaciente = "INSERT INTO Pacientes (cedula, nombre, apellido)
                VALUES ('$cedulaEscapada', '$nombrePaciente', '$apellidoPaciente')
                ON DUPLICATE KEY UPDATE cedula = cedula";

if (!$conexion->query($sqlPaciente)) {
    responder(false, 'No se pudo registrar el paciente: ' . $conexion->error);
}

// Se crea el registro QR propio del documento y se obtiene su id.
$sqlQr = "INSERT INTO QR (url, cedula) VALUES (NULL, '$cedulaEscapada')";

if (!$conexion->query($sqlQr)) {
    responder(false, 'No se pudo generar el QR: ' . $conexion->error);
}

// Se obtiene el id del QR y se arma su URL publica.
$idQr = ultimoIdInsertado($conexion);

// Direccion del servidor donde quedara publicado el QR.
// La base se define una sola vez en conexion.php (URL_BASE_QR).
$urlQr = URL_BASE_QR . '/php/verDocumento.php?qr=' . $idQr;
$urlQrEscapada = $conexion->real_escape_string($urlQr);

$conexion->query("UPDATE QR SET url = '$urlQrEscapada' WHERE id_qr = $idQr");

// Finalmente se registra el documento.
$sql = "INSERT INTO Documentos(nom_doc, nom_pac, cedula, id_qr, titulo_del_documento, archivo, categoria_del_documento, fecha_publicacion)
        VALUES ('$nomDocEscapado', '$nomPacEscapado', '$cedula', $idQr, '$tituloEscapado', '$rutaBD', '$categoriaEscapada', '$fechaPublicacion')";

if (!$conexion->query($sql)) {
    responder(false, 'Falló el registro: ' . $conexion->error);
}

// Se devuelve el id del documento y del QR para mostrarlo en pantalla.
responder(true, 'Registro Exitoso', array(
    'archivo' => $rutaBD,
    'id_documento' => ultimoIdInsertado($conexion),
    'id_qr' => $idQr,
    'url_qr' => $urlQr
));
