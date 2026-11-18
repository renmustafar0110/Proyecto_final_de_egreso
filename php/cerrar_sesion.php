<?php

require_once 'sesion.php';

$_SESSION = array();

if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $parametros['path'], $parametros['domain'],
        $parametros['secure'], $parametros['httponly']);
}

session_destroy();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(array('ok' => true));
