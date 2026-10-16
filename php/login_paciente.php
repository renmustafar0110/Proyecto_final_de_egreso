<?php

require_once 'conexion.php';
require_once 'sesion.php';

header('Content-Type: application/json; charset=utf-8');

$cedula = isset($_POST['cedula']) ? trim($_POST['cedula']) : '';

if ($cedula === '') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese su cédula'));
    exit;
}

if (!ctype_digit($cedula)) {
    echo json_encode(array('ok' => false, 'mensaje' => 'La cédula solo debe contener números'));
    exit;
}

$cedulaEscapada = $conexion->real_escape_string($cedula);
$resultado = $conexion->query("SELECT cedula, nombre, apellido FROM Pacientes WHERE cedula = '$cedulaEscapada' LIMIT 1");

if (!$resultado || $resultado->num_rows === 0) {
    echo json_encode(array('ok' => false, 'mensaje' => 'No se encontró un paciente con esa cédula'));
    exit;
}

$paciente = $resultado->fetch_assoc();

session_regenerate_id(true);

$_SESSION['paciente'] = array(
    'cedula' => $paciente['cedula'],
    'nombre' => $paciente['nombre'],
    'apellido' => $paciente['apellido'],
    'tipo' => 'paciente'
);

echo json_encode(array('ok' => true, 'paciente' => $_SESSION['paciente']));
