<?php

define('DB_HOST', 'localhost');
define('DB_NAME', 'hospital_clinicas');
define('DB_USER', 'root');
define('DB_PASS', '');

$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conexion->connect_error) {
    die('ERROR al conectar: ' . $conexion->connect_error);
}

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