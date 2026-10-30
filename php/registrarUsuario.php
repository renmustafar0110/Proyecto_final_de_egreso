<?php

require_once 'conexion.php';
require_once 'sesion.php';

requiereSesion(array('super_admin'));

header('Content-Type: application/json; charset=utf-8');

function responder($ok, $mensaje, $extra = array()) {
    echo json_encode(array_merge(array('ok' => $ok, 'mensaje' => $mensaje), $extra));
    exit;
}

function campoPost($clave) {
    return isset($_POST[$clave]) ? trim($_POST[$clave]) : '';
}

function fechaValida($fecha) {
    $partes = explode('-', $fecha);

    if (count($partes) != 3) {
        return false;
    }

    if (!ctype_digit($partes[0]) || !ctype_digit($partes[1]) || !ctype_digit($partes[2])) {
        return false;
    }

    return checkdate(intval($partes[1]), intval($partes[2]), intval($partes[0]));
}

$accion = campoPost('accion');

if ($accion != 'funcionario' && $accion != 'paciente') {
    responder(false, 'Acción no válida');
}

$cedula = campoPost('cedula');
$nombre = campoPost('nombre');
$apellido = campoPost('apellido');

if ($cedula === '') {
    responder(false, 'Ingrese la cédula');
}

if (!ctype_digit($cedula)) {
    responder(false, 'La cédula solo puede contener números');
}

if (strlen($cedula) > 20) {
    responder(false, 'La cédula no puede superar los 20 caracteres');
}

if ($nombre === '' || $apellido === '') {
    responder(false, 'Ingrese nombre y apellido');
}

if (strlen($nombre) > 100 || strlen($apellido) > 100) {
    responder(false, 'El nombre y el apellido no pueden superar los 100 caracteres');
}

// ---------------------------------------------------------------------
// Alta de funcionario
// ---------------------------------------------------------------------
if ($accion == 'funcionario') {

    $cargo = campoPost('cargo');
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $telefonoFuncionario = campoPost('telefono_funcionario');
    $esConductor = isset($_POST['es_conductor']) && $_POST['es_conductor'] === '1';
    $esCopiloto = isset($_POST['es_copiloto']) && $_POST['es_copiloto'] === '1';

    if ($cargo === '') {
        responder(false, 'Ingrese el cargo del funcionario');
    }

    if (strlen($cargo) > 100) {
        responder(false, 'El cargo no puede superar los 100 caracteres');
    }

    if ($password === '') {
        responder(false, 'Ingrese una contraseña para el funcionario');
    }

    if (strlen($password) < 6) {
        responder(false, 'La contraseña debe tener al menos 6 caracteres');
    }

    if ($telefonoFuncionario !== '' && !ctype_digit($telefonoFuncionario)) {
        responder(false, 'El teléfono solo puede contener números');
    }

    if (strlen($telefonoFuncionario) > 20) {
        responder(false, 'El teléfono no puede superar los 20 caracteres');
    }

    $consulta = $conexion->prepare("SELECT id_funcionario FROM Funcionarios WHERE cedula = ? LIMIT 1");

    if (!$consulta) {
        responder(false, 'Error interno del servidor');
    }

    $consulta->bind_param('s', $cedula);
    $consulta->execute();
    $consulta->store_result();

    if ($consulta->num_rows > 0) {
        $consulta->close();
        responder(false, 'Ya existe un funcionario con esa cédula');
    }

    $consulta->close();

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $conexion->begin_transaction();

    // id_funcionario = 0 para que el trigger de la base asigne el ID.
    $insertar = $conexion->prepare("INSERT INTO Funcionarios
                                      (id_funcionario, nombre, apellido, cargo, cedula, `password_hash`)
                                    VALUES (0, ?, ?, ?, ?, ?)");

    if (!$insertar) {
        $conexion->rollback();
        responder(false, 'Error interno del servidor');
    }

    $insertar->bind_param('sssss', $nombre, $apellido, $cargo, $cedula, $hash);

    if (!$insertar->execute()) {
        $error = $insertar->error;
        $insertar->close();
        $conexion->rollback();
        responder(false, 'No se pudo registrar el funcionario: ' . $error);
    }

    $insertar->close();
    $idFuncionario = ultimoIdInsertado($conexion);

    $telefonoConductor = $telefonoFuncionario === '' ? null : $telefonoFuncionario;

    // Alta opcional como conductor (la tabla Conductores tiene cédula única).
    if ($esConductor) {

        $insertarConductor = $conexion->prepare("INSERT INTO Conductores
                                                   (id_funcionario, cedula, nombre, apellido, telefono)
                                                 VALUES (?, ?, ?, ?, ?)
                                                 ON DUPLICATE KEY UPDATE
                                                   id_funcionario = VALUES(id_funcionario),
                                                   nombre = VALUES(nombre),
                                                   apellido = VALUES(apellido),
                                                   telefono = VALUES(telefono)");

        if (!$insertarConductor) {
            $conexion->rollback();
            responder(false, 'Error interno del servidor');
        }

        $insertarConductor->bind_param('issss', $idFuncionario, $cedula, $nombre, $apellido, $telefonoConductor);

        if (!$insertarConductor->execute()) {
            $error = $insertarConductor->error;
            $insertarConductor->close();
            $conexion->rollback();
            responder(false, 'No se pudo registrar como conductor: ' . $error);
        }

        $insertarConductor->close();
    }

    // Alta opcional como copiloto. Se reutiliza la fila libre si ya existe.
    if ($esCopiloto) {

        $idCopiloto = 0;

        $consultaCopiloto = $conexion->prepare("SELECT id_copiloto FROM Copilotos
                                                WHERE cedula = ? AND id_traslado IS NULL
                                                LIMIT 1");

        if (!$consultaCopiloto) {
            $conexion->rollback();
            responder(false, 'Error interno del servidor');
        }

        $consultaCopiloto->bind_param('s', $cedula);
        $consultaCopiloto->execute();
        $consultaCopiloto->bind_result($idCopiloto);
        $consultaCopiloto->fetch();
        $consultaCopiloto->close();

        if ($idCopiloto > 0) {

            $actualizarCopiloto = $conexion->prepare("UPDATE Copilotos
                                                      SET id_funcionario = ?,
                                                          nombre_copiloto = ?,
                                                          apellido_copiloto = ?
                                                      WHERE id_copiloto = ?");

            if (!$actualizarCopiloto) {
                $conexion->rollback();
                responder(false, 'Error interno del servidor');
            }

            $actualizarCopiloto->bind_param('issi', $idFuncionario, $nombre, $apellido, $idCopiloto);

            if (!$actualizarCopiloto->execute()) {
                $error = $actualizarCopiloto->error;
                $actualizarCopiloto->close();
                $conexion->rollback();
                responder(false, 'No se pudo registrar como copiloto: ' . $error);
            }

            $actualizarCopiloto->close();

        } else {

            $insertarCopiloto = $conexion->prepare("INSERT INTO Copilotos
                                                      (id_funcionario, nombre_copiloto, apellido_copiloto, cedula)
                                                    VALUES (?, ?, ?, ?)");

            if (!$insertarCopiloto) {
                $conexion->rollback();
                responder(false, 'Error interno del servidor');
            }

            $insertarCopiloto->bind_param('isss', $idFuncionario, $nombre, $apellido, $cedula);

            if (!$insertarCopiloto->execute()) {
                $error = $insertarCopiloto->error;
                $insertarCopiloto->close();
                $conexion->rollback();
                responder(false, 'No se pudo registrar como copiloto: ' . $error);
            }

            $insertarCopiloto->close();
        }
    }

    $conexion->commit();

    responder(true, 'Funcionario registrado correctamente', array(
        'id_funcionario' => $idFuncionario,
        'cedula' => $cedula,
        'conductor' => $esConductor,
        'copiloto' => $esCopiloto
    ));
}

// ---------------------------------------------------------------------
// Alta de paciente
// ---------------------------------------------------------------------
$fechaNac = campoPost('fecha_nac');
$telefono = campoPost('telefono');
$email = campoPost('email');
$direccion = campoPost('direccion');

if ($fechaNac !== '' && !fechaValida($fechaNac)) {
    responder(false, 'La fecha de nacimiento no es válida');
}

if ($telefono !== '' && !ctype_digit($telefono)) {
    responder(false, 'El teléfono solo puede contener números');
}

if (strlen($telefono) > 20) {
    responder(false, 'El teléfono no puede superar los 20 caracteres');
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'El email no es válido');
}

if (strlen($email) > 100) {
    responder(false, 'El email no puede superar los 100 caracteres');
}

if (strlen($direccion) > 200) {
    responder(false, 'La dirección no puede superar los 200 caracteres');
}

$consulta = $conexion->prepare("SELECT id_paciente FROM Pacientes WHERE cedula = ? LIMIT 1");

if (!$consulta) {
    responder(false, 'Error interno del servidor');
}

$consulta->bind_param('s', $cedula);
$consulta->execute();
$consulta->store_result();

if ($consulta->num_rows > 0) {
    $consulta->close();
    responder(false, 'Ya existe un paciente con esa cédula');
}

$consulta->close();

$valorFecha = $fechaNac === '' ? null : $fechaNac;
$valorTelefono = $telefono === '' ? null : $telefono;
$valorEmail = $email === '' ? null : $email;
$valorDireccion = $direccion === '' ? null : $direccion;

$insertar = $conexion->prepare("INSERT INTO Pacientes
                                  (cedula, nombre, apellido, fecha_nac, telefono, email, direccion)
                                VALUES (?, ?, ?, ?, ?, ?, ?)");

if (!$insertar) {
    responder(false, 'Error interno del servidor');
}

$insertar->bind_param('sssssss', $cedula, $nombre, $apellido, $valorFecha, $valorTelefono, $valorEmail, $valorDireccion);

if (!$insertar->execute()) {
    $error = $insertar->error;
    $insertar->close();
    responder(false, 'No se pudo registrar el paciente: ' . $error);
}

$insertar->close();
$idPaciente = ultimoIdInsertado($conexion);

responder(true, 'Paciente registrado correctamente', array(
    'id_paciente' => $idPaciente,
    'cedula' => $cedula
));
