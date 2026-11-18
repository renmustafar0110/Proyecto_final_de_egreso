<?php

// conexion.php - Conexion unica a MySQL y helper para obtener el ultimo id insertado.
// Parametros de conexion a la base de datos local.
define('DB_HOST', 'localhost');
define('DB_NAME', 'hospital_clinicas');
define('DB_USER', 'root');
define('DB_PASS', '');

// Base publica usada para armar las URL de los QR.
// Cambiar solo aqui si cambia el IP o se pasa a un dominio.
define('URL_BASE_QR', 'http://192.168.1.3/proyecto');

// Se abre la conexion y se corta la ejecucion si falla.
$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conexion->connect_error) {
    die('ERROR al conectar: ' . $conexion->connect_error);
}

// Se usa UTF-8 para no romper tildes ni enes.
$conexion->set_charset('utf8');

// Devuelve el id generado por el trigger del ultimo INSERT realizado.
// (MySQL no actualiza insert_id cuando un trigger asigna el AUTO_INCREMENT,
// por eso los triggers dejan el valor en la variable de sesion @ultimo_id).
function ultimoIdInsertado($conexion) {
    $resultado = $conexion->query("SELECT @ultimo_id AS id");

    if ($resultado && ($fila = $resultado->fetch_assoc())) {
        return intval($fila['id']);
    }

    return 0;
}
