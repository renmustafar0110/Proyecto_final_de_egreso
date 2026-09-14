<?php

header('Content-Type: application/json');

require_once 'conexion.php';

$numero = isset($_POST['numero_coche']) ? $conexion->real_escape_string($_POST['numero_coche']) : '';
$estado = isset($_POST['estado']) ? $conexion->real_escape_string($_POST['estado']) : '';

if ($numero === '' || $estado === '') {
    echo json_encode(['ok' => false, 'error' => 'Faltan datos']);
    $conexion->close();
    exit;
}

$estadosValidos = ['Disponible', 'Reservado', 'En curso', 'En ruta', 'Finalizado'];

if (!in_array($estado, $estadosValidos)) {
    echo json_encode(['ok' => false, 'error' => 'Estado inválido']);
    $conexion->close();
    exit;
}

$sql = "UPDATE Ambulancias
        SET estado = '$estado'
        WHERE numero_coche = '$numero' OR matricula = '$numero'";

if ($conexion->query($sql)) {
    if ($conexion->affected_rows > 0) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'No se encontró el vehículo']);
    }
} else {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
}

$conexion->close();

?>