<?php

require_once 'conexion.php';

$archivo = $_FILES['archivo'];
$nombre = $_POST['nombre'];

if ($archivo['error'] === 0) {
    $ruta = "Documento/" . $archivo['name'];
    move_uploaded_file($archivo['tmp_name'], $ruta);

    $sql = "INSERT INTO Documento (nombre, archivo)
            VALUES ('$nombre', '$ruta')";

    if ($conexion->query($sql)) {
        echo "Registro exitoso";
    } else {
        echo "Falló el registro";
    }
}

$conexion->close();
