<?php

require_once 'conexion.php';

$tamanoMaximo = 10 * 1024 * 1024; // 10 MB

if (!isset($_FILES['archivo'])) {
    echo "No se seleccionó ningún archivo";
exit;
}

$archivo = $_FILES['archivo'];
$titulo = isset($_POST['titulo_del_documento']) ? trim($_POST['titulo_del_documento']) : '';

if ($titulo === '') {
    echo "Seleccione el titulo del documento";
exit;
}

$nomDoc = isset($_POST['nom_doc']) ? trim($_POST['nom_doc']) : '';
$nomPac = isset($_POST['nom_pac']) ? trim($_POST['nom_pac']) : '';
$cedula = isset($_POST['cedula']) ? trim($_POST['cedula']) : '';
$fecha = isset($_POST['fecha']) ? trim($_POST['fecha']) : '';

if ($fecha === '') {
    echo "Seleccione la fecha de publicación";
exit;
}

if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $fecha, $partes) || !checkdate((int)$partes[2], (int)$partes[3], (int)$partes[1])) {
    echo "La fecha de publicación no es valida";
exit;
}

if ($nomDoc === '') {
    echo "Ingrese el nombre del doctor que sube el documento";
exit;
}

if ($nomPac === '') {
    echo "Ingrese el nombre del paciente al que corresponde el documento";
exit;
}

if ($cedula === '') {
    echo "Ingrese la cedula del paciente";
exit;
}

if (!preg_match('/^\d+$/', $cedula)) {
    echo "La cedula del paciente solo puede contener numeros";
exit;
}

$categoria = 'informacion_general';
if (isset($_POST['categoria_del_documento']) && $_POST['categoria_del_documento'] != '') {
    $categoria = $_POST['categoria_del_documento'];
}

$carpetaDestino = __DIR__ . '/Documento/';

if ($archivo['error'] !== 0) {
    if ($archivo['error'] === UPLOAD_ERR_INI_SIZE || $archivo['error'] === UPLOAD_ERR_FORM_SIZE) {
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

if (!is_uploaded_file($archivo['tmp_name']) || filesize($archivo['tmp_name']) !== $archivo['size']) {
    echo "El archivo llegó incompleto al servidor, intente de nuevo";
exit;
}

if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

$nombreArchivo = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $archivo['name']);
$ruta = $carpetaDestino . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
    echo "No se pudo guardar el archivo en el servidor";
exit;
}

$rutaBD = "Documento/" . $nombreArchivo;
$titulo = $conexion->real_escape_string($titulo);
$categoria = $conexion->real_escape_string($categoria);
$nomDoc = $conexion->real_escape_string($nomDoc);
$nomPac = $conexion->real_escape_string($nomPac);

$sql = "INSERT INTO Documentos(nom_doc, nom_pac, cedula, titulo_del_documento, archivo, categoria_del_documento, fecha_publicacion)
        VALUES ('$nomDoc', '$nomPac', '$cedula', '$titulo', '$rutaBD', '$categoria', '$fecha')";

if ($conexion->query($sql)) {
    echo "Registro Exitoso";
} else {
    echo "Falló el registro: " . $conexion->error;
}

