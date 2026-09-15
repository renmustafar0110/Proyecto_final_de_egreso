<?php

require_once 'conexion.php';

$cedula = $_POST['cedula'];
$password = $_POST['password'];

$cedula = $conexion->real_escape_string($cedula);
$password = $conexion->real_escape_string($password);

$sql = "SELECT cedula, nombre, apellido, cargo FROM Funcionarios WHERE cedula = '$cedula' AND password = '$password'";
$resultado = $conexion->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $funcionario = $resultado->fetch_assoc();
    echo 'Bienvenido, ' . $funcionario['nombre'] . ' ' . $funcionario['apellido'];
} else {
    echo 'Cédula o contraseña incorrecta';
}

$conexion->close();

?>