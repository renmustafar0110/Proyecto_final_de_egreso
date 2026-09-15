<?php

// Se incluye el archivo de conexión a la base de datos
require_once 'conexion.php';

// Se obtienen la cédula y la contraseña enviadas desde el formulario
$cedula = $_POST['cedula'];
$password = $_POST['password'];

// Se limpian los valores para evitar inyección SQL
$cedula = $conexion->real_escape_string($cedula);
$password = $conexion->real_escape_string($password);

// Se busca el funcionario con esa cédula y contraseña
$sql = "SELECT cedula, nombre, apellido, cargo FROM Funcionarios WHERE cedula = '$cedula' AND password = '$password'";
$resultado = $conexion->query($sql);

// Si existe el funcionario se muestra el mensaje de bienvenida
if ($resultado && $resultado->num_rows > 0) {
    $funcionario = $resultado->fetch_assoc();
    echo 'Bienvenido, ' . $funcionario['nombre'] . ' ' . $funcionario['apellido'];
} else {
    // Si no existe se muestra un mensaje de error
    echo 'Cédula o contraseña incorrecta';
}

// Se cierra la conexión a la base de datos
$conexion->close();