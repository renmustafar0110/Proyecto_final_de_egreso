<?php

require_once 'conexion.php';

function responder($ok, $mensaje) {
    global $conexion;

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => $ok, 'mensaje' => $mensaje));
    $conexion->close();
    exit;
}

$categoriasValidas = array(
    'informacion_general',
    'indicaciones',
    'estudios',
    'enfermeria',
    'encuestas'
);

$accion = isset($_POST['accion']) ? $_POST['accion'] : '';
$id = isset($_POST['id_documento']) ? intval($_POST['id_documento']) : 0;

if ($id <= 0) {
    responder(false, 'Documento no válido');
}

if ($accion === 'editar') {
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $categoria = isset($_POST['tipo_documento']) ? trim($_POST['tipo_documento']) : '';
    $fecha = isset($_POST['fecha_publicacion']) ? trim($_POST['fecha_publicacion']) : '';

    if ($nombre === '') {
        responder(false, 'El título no puede quedar vacío');
    }

    if (!in_array($categoria, $categoriasValidas, true)) {
        responder(false, 'Categoría no válida');
    }

    $partes = explode('-', $fecha);
    $dia = isset($partes[2]) ? intval($partes[2]) : 0;
    $mes = isset($partes[1]) ? intval($partes[1]) : 0;
    $anio = isset($partes[0]) ? intval($partes[0]) : 0;

    if (count($partes) !== 3 || !checkdate($mes, $dia, $anio)) {
        responder(false, 'La fecha no es válida');
    }

    $sentencia = $conexion->prepare("UPDATE Documentos SET nombre = ?, tipo_documento = ?, fecha_publicacion = ? WHERE id_documento = ?");
    $sentencia->bind_param('sssi', $nombre, $categoria, $fecha, $id);

    if ($sentencia->execute()) {
        responder(true, 'Documento actualizado');
    }

    responder(false, 'Falló la actualización: ' . $sentencia->error);
}

if ($accion === 'estado') {
    $estado = (isset($_POST['estado']) && intval($_POST['estado']) === 1) ? 1 : 0;

    $sentencia = $conexion->prepare("UPDATE Documentos SET estado = ? WHERE id_documento = ?");
    $sentencia->bind_param('ii', $estado, $id);

    if ($sentencia->execute() && $sentencia->affected_rows > 0) {
        responder(true, $estado === 1 ? 'Documento activado' : 'Documento desactivado');
    }

    if ($sentencia->error !== '') {
        responder(false, 'Falló el cambio de estado: ' . $sentencia->error);
    }

    $sentencia->close();

    $comprobacion = $conexion->prepare("SELECT id_documento FROM Documentos WHERE id_documento = ?");
    $comprobacion->bind_param('i', $id);
    $comprobacion->execute();
    $comprobacion->store_result();

    if ($comprobacion->num_rows > 0) {
        responder(true, 'El documento ya estaba en ese estado');
    }

    responder(false, 'El documento no existe');
}

if ($accion === 'eliminar') {
    $sentencia = $conexion->prepare("SELECT archivo FROM Documentos WHERE id_documento = ?");
    $sentencia->bind_param('i', $id);
    $sentencia->execute();
    $sentencia->store_result();
    $sentencia->bind_result($rutaArchivo);

    if ($sentencia->num_rows === 0) {
        responder(false, 'El documento no existe');
    }

    $sentencia->fetch();
    $sentencia->close();

    $sentencia = $conexion->prepare("DELETE FROM Documentos WHERE id_documento = ?");
    $sentencia->bind_param('i', $id);

    if (!$sentencia->execute()) {
        responder(false, 'Falló la eliminación: ' . $sentencia->error);
    }

    $sentencia->close();

    $carpetaReal = realpath(__DIR__ . '/Documento');
    $archivoReal = realpath(__DIR__ . '/Documento/' . basename($rutaArchivo));

    if ($carpetaReal !== false && $archivoReal !== false && is_file($archivoReal) && strpos($archivoReal, $carpetaReal) === 0) {
        unlink($archivoReal);
    }

    responder(true, 'Documento eliminado');
}

responder(false, 'Acción no reconocida');
