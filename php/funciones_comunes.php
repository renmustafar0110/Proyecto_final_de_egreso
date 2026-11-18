<?php

function campoPost($clave) {
    return isset($_POST[$clave]) ? trim($_POST[$clave]) : '';
}

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
