<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';
require_once 'sesion.php';

requiereSesion(array('admin_ambulancias', 'super_admin'));

$estadosTrafico = array('Libre', 'Congestionada', 'Cortada', 'En obras');

// ---------- GET ----------
if ($_SERVER['REQUEST_METHOD'] == 'GET') {

    $accion = 'listar';
    if (isset($_GET['accion']) && $_GET['accion'] != '') {
        $accion = $_GET['accion'];
    }

    // Listado de traslados para el select "asociar a traslado"
    if ($accion == 'traslados') {
        $traslados = array();
        $resultado = $conexion->query("SELECT id_traslado, origen, destino, estado
                                       FROM Traslados
                                       ORDER BY id_traslado DESC");

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $traslados[] = $fila;
            }
        }

        echo json_encode($traslados);
        exit;
    }

    // Listado de rutas (con datos del traslado si esta asociada)
    $rutas = array();
    $sql = "SELECT r.id_ruta, r.domicilio, r.km, r.estado_trafico, r.id_traslado,
                   t.origen, t.destino, t.estado
            FROM Rutas r
            LEFT JOIN Traslados t ON t.id_traslado = r.id_traslado
            ORDER BY r.id_ruta DESC";

    $resultado = $conexion->query($sql);

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $rutas[] = $fila;
        }
    }

    echo json_encode($rutas);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array('ok' => false, 'mensaje' => 'Método no permitido'));
    exit;
}

// ---------- POST ----------
$accion = '';
if (isset($_POST['accion'])) {
    $accion = $_POST['accion'];
}

$domicilio = '';
if (isset($_POST['domicilio'])) {
    $domicilio = trim($_POST['domicilio']);
}

$km = '';
if (isset($_POST['km'])) {
    $km = trim($_POST['km']);
}

$estadoTrafico = 'Libre';
if (isset($_POST['estado_trafico']) && in_array($_POST['estado_trafico'], $estadosTrafico, true)) {
    $estadoTrafico = $_POST['estado_trafico'];
}

$idTraslado = 0;
if (isset($_POST['id_traslado']) && $_POST['id_traslado'] != '') {
    $idTraslado = intval($_POST['id_traslado']);
}

$idRuta = 0;
if (isset($_POST['id_ruta'])) {
    $idRuta = intval($_POST['id_ruta']);
}

if ($accion == 'crear' || $accion == 'editar') {

    if ($domicilio == '') {
        echo json_encode(array('ok' => false, 'mensaje' => 'Ingrese el domicilio o tramo de la ruta'));
        exit;
    }

    if ($km != '' && !is_numeric($km)) {
        echo json_encode(array('ok' => false, 'mensaje' => 'Los kilómetros deben ser un número'));
        exit;
    }

    $domicilioEscapado = $conexion->real_escape_string($domicilio);
    $estadoTraficoEscapado = $conexion->real_escape_string($estadoTrafico);

    if ($km == '') {
        $valorKm = 'NULL';
    } else {
        $valorKm = floatval($km);
    }

    if ($idTraslado > 0) {
        $valorTraslado = $idTraslado;
    } else {
        $valorTraslado = 'NULL';
    }

    if ($accion == 'crear') {
        $sql = "INSERT INTO Rutas (domicilio, km, id_traslado, estado_trafico)
                VALUES ('$domicilioEscapado', $valorKm, $valorTraslado, '$estadoTraficoEscapado')";

        if ($conexion->query($sql)) {
            echo json_encode(array('ok' => true, 'mensaje' => 'Ruta registrada', 'id_ruta' => $conexion->insert_id));
        } else {
            echo json_encode(array('ok' => false, 'mensaje' => 'Falló el registro: ' . $conexion->error));
        }

        exit;
    }

    // editar
    if ($idRuta <= 0) {
        echo json_encode(array('ok' => false, 'mensaje' => 'Ruta no válida'));
        exit;
    }

    $sql = "UPDATE Rutas
            SET domicilio = '$domicilioEscapado',
                km = $valorKm,
                id_traslado = $valorTraslado,
                estado_trafico = '$estadoTraficoEscapado'
            WHERE id_ruta = $idRuta";

    if ($conexion->query($sql)) {
        echo json_encode(array('ok' => true, 'mensaje' => 'Ruta actualizada'));
    } else {
        echo json_encode(array('ok' => false, 'mensaje' => 'Falló la actualización: ' . $conexion->error));
    }

    exit;
}

if ($accion == 'eliminar') {

    if ($idRuta <= 0) {
        echo json_encode(array('ok' => false, 'mensaje' => 'Ruta no válida'));
        exit;
    }

    $sql = "DELETE FROM Rutas WHERE id_ruta = $idRuta";

    if ($conexion->query($sql)) {
        echo json_encode(array('ok' => true, 'mensaje' => 'Ruta eliminada'));
    } else {
        echo json_encode(array('ok' => false, 'mensaje' => 'Falló la eliminación: ' . $conexion->error));
    }

    exit;
}

echo json_encode(array('ok' => false, 'mensaje' => 'Acción no reconocida'));
