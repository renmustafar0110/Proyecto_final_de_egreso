<?php

require_once 'conexion.php';
require_once 'sesion.php';

header('Content-Type: application/json; charset=utf-8');

$cedula = '';
if (isset($_POST['cedula'])) {
    $cedula = trim($_POST['cedula']);
}

$password = '';
if (isset($_POST['password'])) {
    $password = $_POST['password'];
}

if ($cedula === '' || $password === '') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese cédula y contraseña'));
    exit;
}

$consulta = "SELECT id_usuario, cedula, nombre, apellido, cargo, password_hash, rol
             FROM Usuarios
             WHERE cedula = ? AND estado = 1
             LIMIT 1";

$stmt = $conexion->prepare($consulta);

if (!$stmt) {
    echo json_encode(array('ok' => false, 'mensaje' => 'Error interno del servidor'));
    exit;
}

$stmt->bind_param('s', $cedula);
$stmt->execute();
$stmt->bind_result($idUsuario, $cedulaBD, $nombre, $apellido, $cargo, $passwordHash, $rol);

$encontrado = $stmt->fetch();
$stmt->close();

if (!$encontrado || !password_verify($password, $passwordHash)) {
    echo json_encode(array('ok' => false, 'mensaje' => 'Cédula o contraseña incorrecta.'));
    exit;
}

session_regenerate_id(true);

$_SESSION['usuario'] = array(
    'id_usuario' => intval($idUsuario),
    'cedula' => $cedulaBD,
    'nombre' => $nombre,
    'apellido' => $apellido,
    'cargo' => $cargo,
    'rol' => $rol
);

echo json_encode(array('ok' => true, 'usuario' => $_SESSION['usuario']));
