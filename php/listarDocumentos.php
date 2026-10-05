<?php

require_once 'conexion.php';

$sql = "SELECT id_documento, titulo_del_documento, archivo, categoria_del_documento, fecha_publicacion, estado
        FROM Documentos
        ORDER BY id_documento DESC";

$resultado = $conexion->query($sql);

$documentos = array();

while ($fila = $resultado->fetch_assoc()) {
    $documentos[] = array(
        'id_documento' => intval($fila['id_documento']),
        'titulo_del_documento' => $fila['titulo_del_documento'],
        'archivo' => $fila['archivo'],
        'categoria_del_documento' => $fila['categoria_del_documento'],
        'fecha_publicacion' => $fila['fecha_publicacion'],
        'estado' => intval($fila['estado'])
    );
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($documentos);

