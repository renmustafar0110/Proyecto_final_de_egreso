<?php

require_once 'conexion.php';

$sql = "SELECT id_documento, nombre, archivo, tipo_documento, fecha_publicacion FROM Documentos ORDER BY id_documento DESC";
$resultado = $conexion->query($sql);

$texto = "[";
$primero = true;

while ($fila = $resultado->fetch_assoc()) {
    if ($primero == false) {
        $texto = $texto . ",";
    }

    $primero = false;

    $texto = $texto . "{";
    $texto = $texto . '"id_documento":"' . $fila['id_documento'] . '",';
    $texto = $texto . '"nombre":"' . $fila['nombre'] . '",';
    $texto = $texto . '"archivo":"' . $fila['archivo'] . '",';
    $texto = $texto . '"tipo_documento":"' . $fila['tipo_documento'] . '",';
    $texto = $texto . '"fecha_publicacion":"' . $fila['fecha_publicacion'] . '"';
    $texto = $texto . "}";
}

$texto = $texto . "]";

header('Content-Type: application/json; charset=utf-8');
echo $texto;

$conexion->close();