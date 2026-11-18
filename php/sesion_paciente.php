<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function sesionPaciente() {
    return isset($_SESSION['paciente']) ? $_SESSION['paciente'] : null;
}

function responderNoAutorizadoPaciente($codigo, $mensaje) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'mensaje' => $mensaje));
    exit;
}

function verificarSesionPaciente() {
    $paciente = sesionPaciente();
    if ($paciente === null) {
        responderNoAutorizadoPaciente(401, 'Debe iniciar sesión para realizar esta acción');
    }
    return $paciente;
}

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
