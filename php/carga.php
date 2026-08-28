<?php

require_once 'config.php';

$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

if ($archivo['error'] === 0) {
    $ruta = "documento/" . $archivo['name'];
    move_uploaded_file($archivo['tmp_name'], $ruta);

    $sql = "INSERT INTO documento (nombre, archivo)
            VALUES ('$nombre', '$ruta')";

    if ($con->query($sql)) {
        echo "Registro exitoso";
    } else {
        echo "Falló el registro";
    }
}

$con->close();

?>