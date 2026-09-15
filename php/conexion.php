<?php

// Datos de conexión a la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'hospital_clinicas');
define('DB_USER', 'root');
define('DB_PASS', '');

// Se crea la conexión con MySQL usando mysqli
$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Si falla la conexión se muestra el error y se detiene el script
if ($conexion->connect_error) {
    die('ERROR al conectar: ' . $conexion->connect_error);
}

// Se define el juego de caracteres para que acepte tildes y ñ
$conexion->set_charset('utf8');