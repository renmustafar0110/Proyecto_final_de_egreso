<?php

require_once 'conexion.php';

$tamanoMaximo = 10 * 1024 * 1024; // 10 MB

if (!isset($_FILES['archivo'])) {
    echo "No se seleccionó ningún archivo";
    exit;
}

$archivo = $_FILES['archivo'];

$titulo = '';
if (isset($_POST['titulo_del_documento'])) {
    $titulo = trim($_POST['titulo_del_documento']);
}

$nomDoc = '';
if (isset($_POST['nom_doc'])) {
    $nomDoc = trim($_POST['nom_doc']);
}

$nomPac = '';
if (isset($_POST['nom_pac'])) {
    $nomPac = trim($_POST['nom_pac']);
}

$cedula = '';
if (isset($_POST['cedula'])) {
    $cedula = trim($_POST['cedula']);
}

$fecha = '';
if (isset($_POST['fecha'])) {
    $fecha = trim($_POST['fecha']);
}

if ($titulo == '') {
    echo "Seleccione el titulo del documento";
    exit;
}

if ($fecha == '') {
    echo "Seleccione la fecha de publicación";
    exit;
}

$partesFecha = explode('-', $fecha);

if (count($partesFecha) != 3) {
    echo "La fecha de publicación no es valida";
    exit;
}

$anio = $partesFecha[0];
$mes = $partesFecha[1];
$dia = $partesFecha[2];

if (!ctype_digit($anio) || !ctype_digit($mes) || !ctype_digit($dia)) {
    echo "La fecha de publicación no es valida";
    exit;
}

if (!checkdate(intval($mes), intval($dia), intval($anio))) {
    echo "La fecha de publicación no es valida";
    exit;
}

if ($nomDoc == '') {
    echo "Ingrese el nombre del doctor que sube el documento";
    exit;
}

if ($nomPac == '') {
    echo "Ingrese el nombre del paciente al que corresponde el documento";
    exit;
}

if ($cedula == '') {
    echo "Ingrese la cedula del paciente";
    exit;
}

if (!ctype_digit($cedula)) {
    echo "La cedula del paciente solo puede contener numeros";
    exit;
}

$categoria = 'informacion_general';
if (isset($_POST['categoria_del_documento']) && $_POST['categoria_del_documento'] != '') {
    $categoria = $_POST['categoria_del_documento'];
}

$carpetaDestino = __DIR__ . '/Documento/';

if ($archivo['error'] != 0) {
    if ($archivo['error'] == UPLOAD_ERR_INI_SIZE || $archivo['error'] == UPLOAD_ERR_FORM_SIZE) {
        echo "El archivo supera el límite permitido de 10 MB";
    } else {
        echo "Error al subir el archivo (código " . $archivo['error'] . ")";
    }
    exit;
}

if ($archivo['size'] > $tamanoMaximo) {
    echo "El archivo supera el límite permitido de 10 MB";
    exit;
}

if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

$nombreOriginal = $archivo['name'];
$nombreLimpio = preg_replace('/[^a-zA-Z0-9._-]/', '_', $nombreOriginal);
$nombreArchivo = time() . '_' . $nombreLimpio;
$ruta = $carpetaDestino . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
    echo "No se pudo guardar el archivo en el servidor";
    exit;
}

$rutaBD = "Documento/" . $nombreArchivo;

$tituloEscapado = $conexion->real_escape_string($titulo);
$categoriaEscapada = $conexion->real_escape_string($categoria);
$nomDocEscapado = $conexion->real_escape_string($nomDoc);
$nomPacEscapado = $conexion->real_escape_string($nomPac);

$sql = "INSERT INTO Documentos(nom_doc, nom_pac, cedula, titulo_del_documento, archivo, categoria_del_documento, fecha_publicacion)
        VALUES ('$nomDocEscapado', '$nomPacEscapado', '$cedula', '$tituloEscapado', '$rutaBD', '$categoriaEscapada', '$fecha')";

if ($conexion->query($sql)) {
    echo "Registro Exitoso";
} else {
    echo "Falló el registro: " . $conexion->error;
}
