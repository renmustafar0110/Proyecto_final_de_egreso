<?php

require_once 'conexion.php';

$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

$carpetaDestino = __DIR__ . '/Documento/';

if (!is_dir($carpetaDestino)) {
    @mkdir($carpetaDestino, 0777, true);
}

if (!is_writable($carpetaDestino)) {
    @chmod($carpetaDestino, 0777);
}

if (!is_writable($carpetaDestino)) {
    echo "No tengo permiso de escritura en la carpeta Documento/" .
         "Ejecuta en la terminal: sudo chmod -R 777 " . __DIR__ . "/Documento";
    $conexion->close();
    exit;
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

$sql = "INSERT INTO Documentos(nombre, archivo)
        VALUES ('$nombre', '$rutaBD')";

if ($conexion->query($sql)) {
    echo "Registro Exitoso";
} else {
    echo "Falló el registro: " . $conexion->error;
}

$conexion->close();

?>