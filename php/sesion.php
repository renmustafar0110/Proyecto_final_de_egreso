<?php

// sesion.php - Arranque de sesion y helpers de autorizacion por rol.
// La sesion se inicia una sola vez.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Devuelve el usuario logueado o null.
function sesionUsuario() {
    return isset($_SESSION['usuario']) ? $_SESSION['usuario'] : null;
}

// Responde un error JSON y corta la ejecucion.
function responderNoAutorizado($codigo, $mensaje) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'mensaje' => $mensaje));
    exit;
}

// Exige sesion activa y, opcionalmente, uno de los roles permitidos.
function requiereSesion($rolesPermitidos = null) {
    $usuario = sesionUsuario();

    // Sin sesion se responde 401.
    if ($usuario === null) {
        responderNoAutorizado(401, 'Debe iniciar sesión para realizar esta acción');
    }

    // Si se indicaron roles, se comprueba que el usuario tenga alguno.
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
