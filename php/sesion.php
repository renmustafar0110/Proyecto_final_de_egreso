<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function sesionUsuario() {
    return isset($_SESSION['usuario']) ? $_SESSION['usuario'] : null;
}

function responderNoAutorizado($codigo, $mensaje) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'mensaje' => $mensaje));
    exit;
}

function requiereSesion($rolesPermitidos = null) {
    $usuario = sesionUsuario();

    if ($usuario === null) {
        responderNoAutorizado(401, 'Debe iniciar sesión para realizar esta acción');
    }

    if ($rolesPermitidos !== null) {
        $roles = isset($usuario['roles']) ? $usuario['roles'] : array($usuario['rol']);
        $permitido = false;

        foreach ($roles as $rol) {
            if (in_array($rol, $rolesPermitidos, true)) {
                $permitido = true;
                break;
            }
        }

        if (!$permitido) {
            responderNoAutorizado(403, 'No tiene permisos para realizar esta acción');
        }
    }

    return $usuario;
}
