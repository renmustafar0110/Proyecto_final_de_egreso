<?php

// listarDocumentos.php - Lista todos los documentos para el panel administrativo.
// Se carga la conexion y el control de sesion.
require_once 'conexion.php';
require_once 'sesion.php';

// Solo administradores de documentos o super_admin.
requiereSesion(array('admin_documentos', 'super_admin'));

// Se consultan los documentos y se devuelven con tipos normalizados.
$sql = "SELECT id_documento, titulo_del_documento, archivo, categoria_del_documento, fecha_publicacion, estado
        FROM Documentos
        ORDER BY id_documento DESC";

$resultado = $conexion->query($sql);

$documentos = array();

if ($resultado) {
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
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($documentos);
