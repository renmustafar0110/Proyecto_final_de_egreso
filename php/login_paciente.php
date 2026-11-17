<?php

// login_paciente.php - Autentica a un paciente por cedula y guarda su sesion.
// Se cargan la conexion y el helper de sesion.
require_once 'conexion.php';
require_once 'sesion.php';



// La respuesta siempre sera JSON.
header('Content-Type: application/json; charset=utf-8');



// Se recibe y valida la cedula.
$cedula = isset($_POST['cedula']) ? trim($_POST['cedula']) : '';



// Validaciones del formato de cedula.
if ($cedula === '') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese su cédula'));
    exit;
}



if (!ctype_digit($cedula)) {
    echo json_encode(array('ok' => false, 'mensaje' => 'La cédula solo debe contener números'));
    exit;
}



// Se busca el paciente en la base y se escapa la cedula.
$cedulaEscapada = $conexion->real_escape_string($cedula);
$resultado = $conexion->query("SELECT cedula, nombre, apellido FROM Pacientes WHERE cedula = '$cedulaEscapada' LIMIT 1");



// Si no existe el paciente, se informa el error.
if (!$resultado || $resultado->num_rows === 0) {
    echo json_encode(array('ok' => false, 'mensaje' => 'No se encontró un paciente con esa cédula'));
    exit;
}



// Se obtienen los datos del paciente encontrado.
$paciente = $resultado->fetch_assoc();



// Se regenera el id de sesion y se guardan los datos del paciente.
session_regenerate_id(true);



$_SESSION['paciente'] = array(
    'cedula' => $paciente['cedula'],
    'nombre' => $paciente['nombre'],
    'apellido' => $paciente['apellido'],
    'tipo' => 'paciente'
);



echo json_encode(array('ok' => true, 'paciente' => $_SESSION['paciente']));
