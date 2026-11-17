<?php

// buscador_documentos.php - Busca documentos activos del paciente logueado.
// La respuesta sera JSON.
header('Content-Type: application/json; charset=utf-8');

// Se cargan la conexion y la sesion del paciente.
require_once 'conexion.php';
require_once 'sesion_paciente.php';

// Solo se puede buscar con una sesion de paciente activa.
$paciente = verificarSesionPaciente();

// Parametros de busqueda enviados por el buscador.
$cedula = isset($paciente['cedula']) ? trim($paciente['cedula']) : '';
$categoria = isset($_GET['categoria']) ? trim($_GET['categoria']) : '';
$titulo = isset($_GET['titulo']) ? trim($_GET['titulo']) : '';

// Filtro base: documentos activos del paciente.
$sql = "SELECT d.id_documento, d.titulo_del_documento, d.categoria_del_documento, d.fecha_publicacion, 
               d.nom_pac, d.cedula, d.archivo, d.id_qr
        FROM Documentos d
        WHERE d.estado = 1";

// Filtro por cedula del paciente.
if ($cedula !== '') {
    if (ctype_digit($cedula)) {
        $cedulaEscapada = $conexion->real_escape_string($cedula);
        $sql .= " AND d.cedula = '$cedulaEscapada'";
    } else {
        $cedulaEscapada = $conexion->real_escape_string($cedula);
        $sql .= " AND d.cedula LIKE '%$cedulaEscapada%'";
    }
}

// Filtro por categoria valida.
if ($categoria !== '') {
    $categoriasValidas = array('informacion_general', 'indicaciones', 'estudios', 'enfermeria', 'encuestas');
    if (in_array($categoria, $categoriasValidas, true)) {
        $categoriaEscapada = $conexion->real_escape_string($categoria);
        $sql .= " AND d.categoria_del_documento = '$categoriaEscapada'";
    }
}

// Filtro por titulo (coincidencia parcial).
if ($titulo !== '') {
    $tituloEscapado = $conexion->real_escape_string($titulo);
    $sql .= " AND d.titulo_del_documento LIKE '%$tituloEscapado%'";
}

// Orden por fecha y se ejecuta la consulta.
$sql .= " ORDER BY d.fecha_publicacion DESC, d.id_documento DESC";

$resultado = $conexion->query($sql);
$documentos = array();

// Se devuelve el arreglo de documentos como JSON.
if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $documentos[] = $fila;
    }
}

echo json_encode($documentos);
