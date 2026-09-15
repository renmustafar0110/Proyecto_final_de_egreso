<?php

// Se indica que la respuesta será en formato JSON
header('Content-Type: application/json');

// Se incluye el archivo de conexión a la base de datos
require_once 'conexion.php';

// Se obtienen el número de coche y el nuevo estado enviados por el usuario
$numero = isset($_POST['numero_coche']) ? $conexion->real_escape_string($_POST['numero_coche']) : '';
$estado = isset($_POST['estado']) ? $conexion->real_escape_string($_POST['estado']) : '';

// Si falta alguno de los datos se muestra un error y se termina
if ($numero === '' || $estado === '') {
    echo json_encode(['ok' => false, 'error' => 'Faltan datos']);
    $conexion->close();
    exit;
}

// Estados permitidos para una ambulancia
$estadosValidos = ['Disponible', 'Reservado', 'En curso', 'En ruta', 'Finalizado'];

// Si el estado no está en la lista se rechaza
if (!in_array($estado, $estadosValidos)) {
    echo json_encode(['ok' => false, 'error' => 'Estado inválido']);
    $conexion->close();
    exit;
}

// Se actualiza el estado del vehículo en la tabla Ambulancias
$sql = "UPDATE Ambulancias
        SET estado = '$estado'
        WHERE numero_coche = '$numero' OR matricula = '$numero'";

// Se ejecuta la consulta y se devuelve el resultado
if ($conexion->query($sql)) {
    if ($conexion->affected_rows > 0) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'No se encontró el vehículo']);
    }
} else {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
}

// Se cierra la conexión a la base de datos
$conexion->close();