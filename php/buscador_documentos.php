<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';
require_once 'sesion_paciente.php';

verificarSesionPaciente();

$cedula = isset($_GET['cedula']) ? trim($_GET['cedula']) : '';
$categoria = isset($_GET['categoria']) ? trim($_GET['categoria']) : '';
$titulo = isset($_GET['titulo']) ? trim($_GET['titulo']) : '';

$sql = "SELECT d.id_documento, d.titulo_del_documento, d.categoria_del_documento, d.fecha_publicacion, 
               d.nom_pac, d.cedula, d.archivo, d.id_qr
        FROM Documentos d
        WHERE d.estado = 1";

if ($cedula !== '') {
    if (ctype_digit($cedula)) {
        $cedulaEscapada = $conexion->real_escape_string($cedula);
        $sql .= " AND d.cedula = '$cedulaEscapada'";
    } else {
        $cedulaEscapada = $conexion->real_escape_string($cedula);
        $sql .= " AND d.cedula LIKE '%$cedulaEscapada%'";
    }
}

if ($categoria !== '') {
    $categoriasValidas = array('informacion_general', 'indicaciones', 'estudios', 'enfermeria', 'encuestas');
    if (in_array($categoria, $categoriasValidas, true)) {
        $categoriaEscapada = $conexion->real_escape_string($categoria);
        $sql .= " AND d.categoria_del_documento = '$categoriaEscapada'";
    }
}

if ($titulo !== '') {
    $tituloEscapado = $conexion->real_escape_string($titulo);
    $sql .= " AND d.titulo_del_documento LIKE '%$tituloEscapado%'";
}

$sql .= " ORDER BY d.fecha_publicacion DESC, d.id_documento DESC";

$resultado = $conexion->query($sql);
$documentos = array();

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $documentos[] = $fila;
    }
}

echo json_encode($documentos);
