<?php

// login_Funcionario_Administrativo.php - Autentica a un administrador (super_admin).
// Se cargan la conexion y el helper de sesion.
require_once 'conexion.php';
require_once 'sesion.php';

// La respuesta siempre sera JSON.
header('Content-Type: application/json; charset=utf-8');

// Datos recibidos del formulario de login.
$cedula = isset($_POST['cedula']) ? trim($_POST['cedula']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// Validacion de campos obligatorios.
if ($cedula === '' || $password === '') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese cédula y contraseña'));
    exit;
}

// Consulta preparada para buscar el administrador por cedula.
$consulta = "SELECT id_administrador, cedula, nombre, cargo, `contraseña`
             FROM Administradores
             WHERE cedula = ?
             LIMIT 1";

// Se prepara y ejecuta la consulta.
$stmt = $conexion->prepare($consulta);

if (!$stmt) {
    echo json_encode(array('ok' => false, 'mensaje' => 'Error interno del servidor'));
    exit;
}

$stmt->bind_param('s', $cedula);
$stmt->execute();
$stmt->bind_result($idUsuario, $cedulaBD, $nombre, $cargo, $passwordHash);

$encontrado = $stmt->fetch();
$stmt->close();

// Se verifica la contrasena con password_verify.
if (!$encontrado || !password_verify($password, $passwordHash)) {
    echo json_encode(array('ok' => false, 'mensaje' => 'Cédula o contraseña incorrecta.'));
    exit;
}

// Datos del administrador que se guardan en la sesion.
$usuario = array(
    'id_usuario' => intval($idUsuario),
    'cedula' => $cedulaBD,
    'nombre' => $nombre,
    'apellido' => '',
    'cargo' => $cargo,
    'rol' => 'super_admin',
    'roles' => array('super_admin'),
    'tipo' => 'administrador'
);

// Se regenera la sesion y se responde con el usuario autenticado.
session_regenerate_id(true);

$_SESSION['usuario'] = $usuario;

echo json_encode(array('ok' => true, 'usuario' => $usuario));
