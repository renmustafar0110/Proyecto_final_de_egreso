<?php

header('Content-Type: application/json');

require_once 'conexion.php';

$numero = isset($_POST['numero_coche']) ? trim($_POST['numero_coche']) : '';

if ($numero === '') {
    echo json_encode(['ok' => false, 'error' => 'Debe completar el número de coche']);
    $conexion->close();
    exit;
}

$numero = $conexion->real_escape_string($numero);

$verificar = "SELECT matricula FROM Ambulancias WHERE matricula = '$numero' OR numero_coche = '$numero'";
$resultado = $conexion->query($verificar);

if ($resultado && $resultado->num_rows > 0) {
    echo json_encode(['ok' => false, 'error' => 'Ya existe un vehículo con ese número de coche']);
    $conexion->close();
    exit;
}

$sql = "INSERT INTO Ambulancias (matricula, numero_coche, estado)
        VALUES ('$numero', '$numero', 'Disponible')";

if ($conexion->query($sql)) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
}

$conexion->close();

?>