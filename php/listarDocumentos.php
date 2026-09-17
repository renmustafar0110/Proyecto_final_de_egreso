<?php

// Conexión a la base de datos
require_once 'conexion.php';

// Consulta todos los documentos, del más reciente hacia atrás
$sql = "SELECT id_documento, nombre, archivo, tipo_documento, fecha_publicacion FROM Documentos ORDER BY id_documento DESC";
$resultado = $conexion->query($sql);

// Arma el JSON de forma manual
$texto = "[";
$primero = true;

// Recorre cada fila del resultado
while ($fila = $resultado->fetch_assoc()) {
    // Agrega coma entre documento y documento
    if ($primero == false) {
        $texto = $texto . ",";
    }

    $primero = false;

    // Arma el objeto JSON de cada documento
    $texto = $texto . "{";
    $texto = $texto . '"id_documento":"' . $fila['id_documento'] . '",';
    $texto = $texto . '"nombre":"' . $fila['nombre'] . '",';
    $texto = $texto . '"archivo":"' . $fila['archivo'] . '",';
    $texto = $texto . '"tipo_documento":"' . $fila['tipo_documento'] . '",';
    $texto = $texto . '"fecha_publicacion":"' . $fila['fecha_publicacion'] . '"';
    $texto = $texto . "}";
}

// Cierra el arreglo JSON
$texto = $texto . "]";

// Envía la respuesta como JSON
header('Content-Type: application/json; charset=utf-8');
echo $texto;

// Cierra la conexión
$conexion->close();