<?php

// cerrar_sesion.php - Destruye la sesion del funcionario y responde en JSON.
// Se carga el helper de sesion para poder destruirla.
require_once 'sesion.php';



// Se vacian los datos de sesion y se elimina la cookie.
$_SESSION = array();



if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $parametros['path'], $parametros['domain'],
        $parametros['secure'], $parametros['httponly']);
}



// Se destruye la sesion en el servidor.
session_destroy();



// Se confirma al cliente que la sesion quedo cerrada.
header('Content-Type: application/json; charset=utf-8');
echo json_encode(array('ok' => true));
