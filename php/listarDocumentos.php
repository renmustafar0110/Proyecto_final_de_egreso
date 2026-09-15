<?php

// Se incluye el archivo de conexión a la base de datos
require_once 'conexion.php';

// Se consultan todos los documentos ordenados desde el más reciente
$sql = "SELECT id_documento, nombre, archivo, tipo_documento, fecha_publicacion FROM Documentos ORDER BY id_documento DESC";
$resultado = $conexion->query($sql);

// Se arma el JSON de forma manual (estilo simple para el curso)
$texto = "[";
$primero = true;

// Se recorre cada fila del resultado
while ($fila = $resultado->fetch_assoc()) {
    // Se agrega una coma entre documento y documento
    if ($primero == false) {
        $texto = $texto . ",";
    }

    $primero = false;

    // Se arma el objeto JSON con los datos de cada documento
    $texto = $texto . "{";
    $texto = $texto . '"id_documento":"' . $fila['id_documento'] . '",';
    $texto = $texto . '"nombre":"' . $fila['nombre'] . '",';
    $texto = $texto . '"archivo":"' . $fila['archivo'] . '",';
    $texto = $texto . '"tipo_documento":"' . $fila['tipo_documento'] . '",';
    $texto = $texto . '"fecha_publicacion":"' . $fila['fecha_publicacion'] . '"';
    $texto = $texto . "}";
}

// Se cierra el arreglo JSON
$texto = $texto . "]";

// Se envía la respuesta como JSON
header('Content-Type: application/json; charset=utf-8');
echo $texto;

// Se cierra la conexión a la base de datos
$conexion->close();