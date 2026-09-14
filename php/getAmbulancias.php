<?php

header('Content-Type: application/json');

require_once 'conexion.php';

$sql = "SELECT matricula, numero_coche, estado
        FROM Ambulancias
        ORDER BY numero_coche ASC";

$resultado = $conexion->query($sql);

if (!$resultado) {
    echo '[]';
    $conexion->close();
    exit;
}

$ambulancias = [];

while ($fila = $resultado->fetch_assoc()) {
    $ambulancias[] = [
        'matricula' => $fila['matricula'],
        'numero_coche' => $fila['numero_coche'],
        'estado' => $fila['estado']
    ];
}

echo json_encode($ambulancias);

$conexion->close();

?>