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

?>
