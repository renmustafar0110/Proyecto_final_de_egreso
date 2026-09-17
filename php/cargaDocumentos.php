<?php

// Conexión a la base de datos
require_once 'conexion.php';

// Archivo subido y nombre del documento
$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

// Categoría del documento (por defecto "informacion_general")
$tipo = 'informacion_general';
if (isset($_POST['tipo_documento'])) {
    if ($_POST['tipo_documento'] != '') {
        $tipo = $_POST['tipo_documento'];
    }
}

// Fecha de publicación (por defecto la de hoy)
$fecha = date('Y-m-d');
if (isset($_POST['fecha_publicacion'])) {
    if ($_POST['fecha_publicacion'] != '') {
        $fecha = $_POST['fecha_publicacion'];
    }
}

// Carpeta destino de los archivos subidos
$carpetaDestino = __DIR__ . '/Documento/';

// Si la carpeta no existe, se crea
if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0777, true);
}

// Si hubo error al subir, se informa
if ($archivo['error'] !== 0) {
    echo "Error al subir el archivo (código " . $archivo['error'] . ")";
    $conexion->close();
    exit;
}

// Renombra el archivo con la hora actual para evitar repeticiones
$nombreArchivo = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $archivo['name']);
$ruta = $carpetaDestino . $nombreArchivo;

// Mueve el archivo temporal a la carpeta de documentos
if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
    echo "No se pudo guardar el archivo en el servidor";
    $conexion->close();
    exit;
}

// Guarda la ruta relativa y limpia los datos
$rutaBD = "Documento/" . $nombreArchivo;
$nombre = $conexion->real_escape_string($nombre);
$tipo = $conexion->real_escape_string($tipo);
$fecha = $conexion->real_escape_string($fecha);

// Inserta el documento en la tabla Documentos
$sql = "INSERT INTO Documentos(nombre, archivo, tipo_documento, fecha_publicacion)
        VALUES ('$nombre', '$rutaBD', '$tipo', '$fecha')";

// Indica si el registro se guardó o falló
if ($conexion->query($sql)) {
    echo "Registro Exitoso";
} else {
    echo "Falló el registro: " . $conexion->error;
}

// Cierra la conexión
$conexion->close();