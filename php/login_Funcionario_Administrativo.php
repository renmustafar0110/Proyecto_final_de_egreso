<?php

require_once 'conexion.php';
require_once 'sesion.php';



header('Content-Type: application/json; charset=utf-8');



$cedula = isset($_POST['cedula']) ? trim($_POST['cedula']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';



if ($cedula === '' || $password === '') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese cédula y contraseña'));
    exit;
}



$consulta = "SELECT id_administrador, cedula, nombre, cargo, `contraseña`
             FROM Administradores
             WHERE cedula = ?
             LIMIT 1";



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



if (!$encontrado || !password_verify($password, $passwordHash)) {
    echo json_encode(array('ok' => false, 'mensaje' => 'Cédula o contraseña incorrecta.'));
    exit;
}



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



session_regenerate_id(true);



$_SESSION['usuario'] = $usuario;



echo json_encode(array('ok' => true, 'usuario' => $usuario));
