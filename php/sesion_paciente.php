<?php

// sesion_paciente.php - Sesion y helpers para el portal del paciente.
// Arranque de sesion para el paciente.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Devuelve el paciente logueado o null.
function sesionPaciente() {
    return isset($_SESSION['paciente']) ? $_SESSION['paciente'] : null;
}

// Responde error JSON y corta la ejecucion.
function responderNoAutorizadoPaciente($codigo, $mensaje) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'mensaje' => $mensaje));
    exit;
}

// Exige una sesion de paciente activa.
function verificarSesionPaciente() {
    $paciente = sesionPaciente();
    if ($paciente === null) {
        responderNoAutorizadoPaciente(401, 'Debe iniciar sesión para realizar esta acción');
    }
    return $paciente;
}

// Endpoint GET ?accion=info para consultar los datos del paciente logueado.
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'info') {
    header('Content-Type: application/json; charset=utf-8');
    $paciente = sesionPaciente();
    if ($paciente === null) {
        echo json_encode(array('ok' => false, 'mensaje' => 'No hay sesión activa'));
        exit;
    }
    echo json_encode(array('ok' => true, 'paciente' => $paciente));
    exit;
}
