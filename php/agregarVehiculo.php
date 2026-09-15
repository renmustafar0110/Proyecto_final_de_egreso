<?php

// Se indica que la respuesta será en formato JSON
header('Content-Type: application/json');

// Se incluye el archivo de conexión a la base de datos
require_once 'conexion.php';

// Se obtiene el número de coche enviado desde el formulario
$numero = isset($_POST['numero_coche']) ? trim($_POST['numero_coche']) : '';

// Si el número viene vacío se muestra un error y se termina
if ($numero === '') {
    echo json_encode(['ok' => false, 'error' => 'Debe completar el número de coche']);
    $conexion->close();
    exit;
}

// Se limpia el valor para evitar inyección SQL
$numero = $conexion->real_escape_string($numero);

// Se verifica que no exista ya un vehículo con ese número
$verificar = "SELECT matricula FROM Ambulancias WHERE matricula = '$numero' OR numero_coche = '$numero'";
$resultado = $conexion->query($verificar);

// Si ya existe un vehículo se informa y se termina
if ($resultado && $resultado->num_rows > 0) {
    echo json_encode(['ok' => false, 'error' => 'Ya existe un vehículo con ese número de coche']);
    $conexion->close();
    exit;
}

// Se inserta el nuevo vehículo con el estado "Disponible"
$sql = "INSERT INTO Ambulancias (matricula, numero_coche, estado)
        VALUES ('$numero', '$numero', 'Disponible')";

// Se ejecuta la consulta y se devuelve el resultado
if ($conexion->query($sql)) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
}

// Se cierra la conexión a la base de datos
$conexion->close();