<?php

require_once 'conexion.php';
require_once 'sesion.php';

header('Content-Type: application/json; charset=utf-8');

$cedula = isset($_POST['cedula']) ? trim($_POST['cedula']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : 'funcionario';

if ($cedula === '' || $password === '') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese cédula y contraseña'));
    exit;
}

if ($tipo === 'administrador') {
    $consulta = "SELECT id_administrador, cedula, nombre, cargo, `contraseña`
                 FROM administradores
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
} else {
    $consulta = "SELECT id_funcionario, cedula, nombre, apellido, cargo, password_hash
                 FROM Funcionarios
                 WHERE cedula = ?
                 LIMIT 1";

    $stmt = $conexion->prepare($consulta);

    if (!$stmt) {
        echo json_encode(array('ok' => false, 'mensaje' => 'Error interno del servidor'));
        exit;
    }

    $stmt->bind_param('s', $cedula);
    $stmt->execute();
    $stmt->bind_result($idUsuario, $cedulaBD, $nombre, $apellido, $cargo, $passwordHash);

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
        'apellido' => $apellido,
        'cargo' => $cargo,
        'rol' => 'admin_documentos',
        'roles' => array('admin_documentos', 'admin_ambulancias'),
        'tipo' => 'funcionario'
    );
}

session_regenerate_id(true);

$_SESSION['usuario'] = $usuario;

echo json_encode(array('ok' => true, 'usuario' => $usuario));
