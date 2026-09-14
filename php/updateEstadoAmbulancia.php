<?php

header('Content-Type: application/json');

require_once 'conexion.php';

$matricula = isset($_POST['matricula']) ? $conexion->real_escape_string($_POST['matricula']) : '';
$estado = isset($_POST['estado']) ? $conexion->real_escape_string($_POST['estado']) : '';

if ($matricula === '' || $estado === '') {
    echo json_encode(['ok' => false, 'error' => 'Faltan datos']);
    $conexion->close();
    exit;
}

$estadosValidos = ['Disponible', 'En curso', 'En ruta', 'Finalizado'];

if (!in_array($estado, $estadosValidos)) {
    echo json_encode(['ok' => false, 'error' => 'Estado inválido']);
    $conexion->close();
    exit;
}

$sql = "UPDATE Ambulancias
        SET estado = '$estado'
        WHERE matricula = '$matricula'";

if ($conexion->query($sql)) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
}

$conexion->close();

?>