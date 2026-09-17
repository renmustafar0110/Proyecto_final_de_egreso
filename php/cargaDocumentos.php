<?php

require_once 'conexion.php';

$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

$tipo = 'informacion_general';
if (isset($_POST['tipo_documento'])) {
    if ($_POST['tipo_documento'] != '') {
        $tipo = $_POST['tipo_documento'];
    }
}

$fecha = date('Y-m-d');
if (isset($_POST['fecha_publicacion'])) {
    if ($_POST['fecha_publicacion'] != '') {
        $fecha = $_POST['fecha_publicacion'];
    }
}

$carpetaDestino = __DIR__ . '/Documento/';

if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

if ($archivo['error'] !== 0) {
    echo "Error al subir el archivo (código " . $archivo['error'] . ")";
    $conexion->close();
    exit;
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