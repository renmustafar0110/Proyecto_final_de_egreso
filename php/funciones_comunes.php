<?php

// funciones_comunes.php - Helpers compartidos por varios endpoints.
// Lee un campo POST y le quita espacios.
function campoPost($clave) {
    return isset($_POST[$clave]) ? trim($_POST[$clave]) : '';
}

// Valida una fecha en formato YYYY-MM-DD.
function fechaValida($fecha) {
    $partes = explode('-', $fecha);

    if (count($partes) != 3) {
        return false;
    }

    if (!ctype_digit($partes[0]) || !ctype_digit($partes[1]) || !ctype_digit($partes[2])) {
        return false;
    }

    return checkdate(intval($partes[1]), intval($partes[2]), intval($partes[0]));
}
