<?php

// Conexión a la base de datos
require_once 'conexion.php';

// Cédula y contraseña del formulario
$cedula = $_POST['cedula'];
$password = $_POST['password'];

// Limpia los valores contra inyección SQL
$cedula = $conexion->real_escape_string($cedula);
$password = $conexion->real_escape_string($password);

// Busca el funcionario por cédula y contraseña
$sql = "SELECT cedula, nombre, apellido, cargo FROM Funcionarios WHERE cedula = '$cedula' AND password = '$password'";
$resultado = $conexion->query($sql);

// Si existe, muestra bienvenida
if ($resultado && $resultado->num_rows > 0) {
    $funcionario = $resultado->fetch_assoc();
    echo 'Bienvenido, ' . $funcionario['nombre'] . ' ' . $funcionario['apellido'];
} else {
    // Si no existe, muestra error
    echo 'Cédula o contraseña incorrecta';
}

// Cierra la conexión
$conexion->close();