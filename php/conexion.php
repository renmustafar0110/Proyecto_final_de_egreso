<?php

// Datos de conexión a la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'hospital_clinicas');
define('DB_USER', 'root');
define('DB_PASS', '');

// Crea la conexión MySQL con mysqli
$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Si falla la conexión, muestra error y detiene
if ($conexion->connect_error) {
    die('ERROR al conectar: ' . $conexion->connect_error);
}

// Juego de caracteres para tildes y ñ
$conexion->set_charset('utf8');