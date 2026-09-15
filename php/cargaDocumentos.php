<?php

// Se incluye el archivo de conexión a la base de datos
require_once 'conexion.php';

// Se obtienen el archivo subido y el nombre del documento
$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

// Se obtiene la categoría del documento (por defecto "informacion_general")
$tipo = 'informacion_general';
if (isset($_POST['tipo_documento'])) {
    if ($_POST['tipo_documento'] != '') {
        $tipo = $_POST['tipo_documento'];
    }
}

// Se obtiene la fecha de publicación (por defecto la fecha de hoy)
$fecha = date('Y-m-d');
if (isset($_POST['fecha_publicacion'])) {
    if ($_POST['fecha_publicacion'] != '') {
        $fecha = $_POST['fecha_publicacion'];
    }
}

// Carpeta donde se guardan los archivos subidos
$carpetaDestino = __DIR__ . '/Documento/';

// Si la carpeta no existe se crea
if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

// Si hubo un error al subir el archivo se informa
if ($archivo['error'] !== 0) {
    echo "Error al subir el archivo (código " . $archivo['error'] . ")";
    $conexion->close();
    exit;
}

// Se renombra el archivo con la hora actual para evitar nombres repetidos
$nombreArchivo = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $archivo['name']);
$ruta = $carpetaDestino . $nombreArchivo;

// Se mueve el archivo temporal a la carpeta de documentos
if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
    echo "No se pudo guardar el archivo en el servidor";
    $conexion->close();
    exit;
}

// Se guarda en la base de datos la ruta relativa y se limpian los datos
$rutaBD = "Documento/" . $nombreArchivo;
$nombre = $conexion->real_escape_string($nombre);
$tipo = $conexion->real_escape_string($tipo);
$fecha = $conexion->real_escape_string($fecha);

// Se inserta el documento en la tabla Documentos
$sql = "INSERT INTO Documentos(nombre, archivo, tipo_documento, fecha_publicacion)
        VALUES ('$nombre', '$rutaBD', '$tipo', '$fecha')";

// Se muestra si el registro se guardó correctamente o falló
if ($conexion->query($sql)) {
    echo "Registro Exitoso";
} else {
    echo "Falló el registro: " . $conexion->error;
}

// Se cierra la conexión a la base de datos
$conexion->close();