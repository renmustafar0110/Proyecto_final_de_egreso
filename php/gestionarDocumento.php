<?php

require_once 'conexion.php';

function responder($ok, $mensaje) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => $ok, 'mensaje' => $mensaje));
    exit;
}

$categoriasValidas = array(
    'informacion_general',
    'indicaciones',
    'estudios',
    'enfermeria',
    'encuestas'
);

$accion = '';
if (isset($_POST['accion'])) {
    $accion = $_POST['accion'];
}

$id = 0;
if (isset($_POST['id_documento'])) {
    $id = intval($_POST['id_documento']);
}

if ($id <= 0) {
    responder(false, 'Documento no válido');
}

if ($accion == 'editar') {

    $titulo = '';
    if (isset($_POST['titulo_del_documento'])) {
        $titulo = trim($_POST['titulo_del_documento']);
    }

    $categoria = '';
    if (isset($_POST['categoria_del_documento'])) {
        $categoria = trim($_POST['categoria_del_documento']);
    }

    $fecha = '';
    if (isset($_POST['fecha_publicacion'])) {
        $fecha = trim($_POST['fecha_publicacion']);
    }

    if ($titulo == '') {
        responder(false, 'El título no puede quedar vacío');
    }

    if (!in_array($categoria, $categoriasValidas)) {
        responder(false, 'Categoría no válida');
    }

    $partesFecha = explode('-', $fecha);

    if (count($partesFecha) != 3) {
        responder(false, 'La fecha no es válida');
    }

    $anio = intval($partesFecha[0]);
    $mes = intval($partesFecha[1]);
    $dia = intval($partesFecha[2]);

    if (!checkdate($mes, $dia, $anio)) {
        responder(false, 'La fecha no es válida');
    }

    $tituloEscapado = $conexion->real_escape_string($titulo);
    $categoriaEscapada = $conexion->real_escape_string($categoria);
    $fechaEscapada = $conexion->real_escape_string($fecha);

    $sql = "UPDATE Documentos
            SET titulo_del_documento = '$tituloEscapado',
                categoria_del_documento = '$categoriaEscapada',
                fecha_publicacion = '$fechaEscapada'
            WHERE id_documento = $id";

    if ($conexion->query($sql)) {
        responder(true, 'Documento actualizado');
    } else {
        responder(false, 'Falló la actualización: ' . $conexion->error);
    }
}

if ($accion == 'estado') {

    $estado = 0;
    if (isset($_POST['estado']) && intval($_POST['estado']) == 1) {
        $estado = 1;
    }

    $sql = "UPDATE Documentos SET estado = $estado WHERE id_documento = $id";

    if ($conexion->query($sql)) {
        if ($conexion->affected_rows > 0) {
            if ($estado == 1) {
                responder(true, 'Documento activado');
            } else {
                responder(true, 'Documento desactivado');
            }
        }

        $comprobacion = $conexion->query("SELECT id_documento FROM Documentos WHERE id_documento = $id");
        if ($comprobacion && $comprobacion->num_rows > 0) {
            responder(true, 'El documento ya estaba en ese estado');
        }

        responder(false, 'El documento no existe');
    } else {
        responder(false, 'Falló el cambio de estado: ' . $conexion->error);
    }
}

if ($accion == 'eliminar') {

    $sql = "SELECT archivo FROM Documentos WHERE id_documento = $id";
    $resultado = $conexion->query($sql);

    if (!$resultado || $resultado->num_rows == 0) {
        responder(false, 'El documento no existe');
    }

    $fila = $resultado->fetch_assoc();
    $rutaArchivo = $fila['archivo'];

    $sql = "DELETE FROM Documentos WHERE id_documento = $id";

    if (!$conexion->query($sql)) {
        responder(false, 'Falló la eliminación: ' . $conexion->error);
    }

    $nombreArchivo = basename($rutaArchivo);
    $rutaCompleta = __DIR__ . '/Documento/' . $nombreArchivo;

    if (is_file($rutaCompleta)) {
        unlink($rutaCompleta);
    }

    responder(true, 'Documento eliminado');
}

responder(false, 'Acción no reconocida');
