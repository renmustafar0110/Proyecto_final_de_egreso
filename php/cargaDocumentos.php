<?php

require_once 'conexion.php';

$tamanoMaximo = 10 * 1024 * 1024; // 10 MB

if (!isset($_FILES['archivo'])) {
    echo "No se seleccionó ningún archivo";
    $conexion->close();
    exit;
}

$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

$tipo = 'informacion_general';
if (isset($_POST['tipo_documento'])) {
    if ($_POST['tipo_documento'] != '') {
        $tipo = $_POST['tipo_documento'];
    }
}

$fecha = date('Y-m-d');

$carpetaDestino = __DIR__ . '/Documento/';

if ($archivo['error'] !== 0) {
    if ($archivo['error'] === UPLOAD_ERR_INI_SIZE || $archivo['error'] === UPLOAD_ERR_FORM_SIZE) {
        echo "El archivo supera el límite permitido de 10 MB";
    } else {
        echo "Error al subir el archivo (código " . $archivo['error'] . ")";
    }
    $conexion->close();
    exit;
}

if ($archivo['size'] > $tamanoMaximo) {
    echo "El archivo supera el límite permitido de 10 MB";
    $conexion->close();
    exit;
}

if (!is_uploaded_file($archivo['tmp_name']) || filesize($archivo['tmp_name']) !== $archivo['size']) {
    echo "El archivo llegó incompleto al servidor, intente de nuevo";
    $conexion->close();
    exit;
}

if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

$nombreArchivo = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $archivo['name']);
$ruta = $carpetaDestino . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
    echo "No se pudo guardar el archivo en el servidor";
    $conexion->close();
    exit;
}

$rutaBD = "Documento/" . $nombreArchivo;
$nombre = $conexion->real_escape_string($nombre);
$tipo = $conexion->real_escape_string($tipo);
$fecha = $conexion->real_escape_string($fecha);

$sql = "INSERT INTO Documentos(nombre, archivo, tipo_documento, fecha_publicacion)
        VALUES ('$nombre', '$rutaBD', '$tipo', '$fecha')";

if ($conexion->query($sql)) {
    echo "Registro Exitoso";
} else {
    echo "Falló el registro: " . $conexion->error;
}

$conexion->close();