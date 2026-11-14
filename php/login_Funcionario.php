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



$consulta = "SELECT id_funcionario, cedula, nombre, apellido, cargo, password_hash, rol
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
$stmt->bind_result($idUsuario, $cedulaBD, $nombre, $apellido, $cargo, $passwordHash, $rolBD);



$encontrado = $stmt->fetch();
$stmt->close();



if (!$encontrado || !password_verify($password, $passwordHash)) {
    echo json_encode(array('ok' => false, 'mensaje' => 'Cédula o contraseña incorrecta.'));
    exit;
}



// CU-01 / PRD 7.3: el rol se define por funcionario en la tabla Funcionarios
// (admin_documentos, admin_ambulancias o ambos). Antes todos recibían ambos roles.
$roles = array('admin_documentos', 'admin_ambulancias');



if ($rolBD == 'admin_documentos') {
    $roles = array('admin_documentos');
} elseif ($rolBD == 'admin_ambulancias') {
    $roles = array('admin_ambulancias');
} else {
    $rolBD = 'ambos';
}



$usuario = array(
    'id_usuario' => intval($idUsuario),
    'cedula' => $cedulaBD,
    'nombre' => $nombre,
    'apellido' => $apellido,
    'cargo' => $cargo,
    'rol' => $rolBD,
    'roles' => $roles,
    'tipo' => 'funcionario'
);



session_regenerate_id(true);



$_SESSION['usuario'] = $usuario;



echo json_encode(array('ok' => true, 'usuario' => $usuario));
