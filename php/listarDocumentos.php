<?php

require_once 'conexion.php';

$sql = "SELECT id_documento, nombre, archivo, tipo_documento, fecha_publicacion, estado
        FROM Documentos
        ORDER BY id_documento DESC";

$resultado = $conexion->query($sql);

$documentos = array();

while ($fila = $resultado->fetch_assoc()) {
    $documentos[] = array(
        'id_documento' => intval($fila['id_documento']),
        'nombre' => $fila['nombre'],
        'archivo' => $fila['archivo'],
        'tipo_documento' => $fila['tipo_documento'],
        'fecha_publicacion' => $fila['fecha_publicacion'],
        'estado' => intval($fila['estado'])
    );
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($documentos);

$conexion->close();
