<?php

define('DB_HOST', 'localhost');
define('DB_NAME', 'hospital_clinicas');
define('DB_USER', 'root');
define('DB_PASS', '');

function detectarUrlBaseQr() {
    $host = 'localhost';

    if (!empty($_SERVER['HTTP_HOST']) && preg_match('/^[a-z0-9.\-]+(?::[0-9]+)?$/i', $_SERVER['HTTP_HOST'])) {
        $host = $_SERVER['HTTP_HOST'];
    } elseif (!empty($_SERVER['SERVER_ADDR'])) {
        $host = $_SERVER['SERVER_ADDR'];
    }

    $esHttps = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https');
    $esquema = $esHttps ? 'https' : 'http';

    $ruta = '';
    if (!empty($_SERVER['SCRIPT_NAME'])) {
        $ruta = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));

        if (substr($ruta, -4) === '/php') {
            $ruta = substr($ruta, 0, -4);
        }

        if ($ruta === '.' || $ruta === '/') {
            $ruta = '';
        }
    }

    return $esquema . '://' . $host . $ruta;
}

$urlBaseQrForzada = getenv('URL_BASE_QR');
define('URL_BASE_QR', $urlBaseQrForzada ? rtrim($urlBaseQrForzada, '/') : detectarUrlBaseQr());

$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conexion->connect_error) {
    die('ERROR al conectar: ' . $conexion->connect_error);
}

$conexion->set_charset('utf8');

function ultimoIdInsertado($conexion) {
    $resultado = $conexion->query("SELECT @ultimo_id AS id");

    if ($resultado && ($fila = $resultado->fetch_assoc())) {
        return intval($fila['id']);
    }

    return 0;
}
