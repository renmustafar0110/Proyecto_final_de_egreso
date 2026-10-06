<?php

header('Content-Type: application/json');

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {

    $sql = "SELECT a.numero_coche, a.id_traslado,
                   t.origen, t.destino, t.hora_salida, t.hora_llegada, t.estado
            FROM Ambulancias a
            LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
            ORDER BY a.numero_coche";

    $resultado = $conexion->query($sql);

    $ambulancias = array();

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {

            if ($fila['estado'] == null || $fila['estado'] == 'Finalizado') {
                $fila['estado'] = 'Disponible';
            }

            $ambulancias[] = $fila;
        }
    }

    echo json_encode($ambulancias);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array('ok' => false, 'error' => 'Método no permitido'));
    exit;
}

$numero = '';
if (isset($_POST['numero_coche'])) {
    $numero = trim($_POST['numero_coche']);
}

$origen = '';
if (isset($_POST['origen'])) {
    $origen = trim($_POST['origen']);
}

$destino = '';
if (isset($_POST['destino'])) {
    $destino = trim($_POST['destino']);
}

$horaSalida = '';
if (isset($_POST['hora_salida'])) {
    $horaSalida = trim($_POST['hora_salida']);
}

$horaLlegada = '';
if (isset($_POST['hora_llegada'])) {
    $horaLlegada = trim($_POST['hora_llegada']);
}

$numero = str_ireplace('coche', '', $numero);
$numero = trim($numero);

if ($numero == '' || $origen == '' || $destino == '' || $horaSalida == '') {
    echo json_encode(array('ok' => false, 'error' => 'Debe completar todos los campos obligatorios'));
    exit;
}

$numeroEscapado = $conexion->real_escape_string($numero);
$origenEscapado = $conexion->real_escape_string($origen);
$destinoEscapado = $conexion->real_escape_string($destino);
$horaSalidaEscapada = $conexion->real_escape_string($horaSalida);
$horaLlegadaEscapada = $conexion->real_escape_string($horaLlegada);

$horaSalidaEscapada = str_replace('T', ' ', $horaSalidaEscapada);
$horaLlegadaEscapada = str_replace('T', ' ', $horaLlegadaEscapada);

$consulta = "SELECT a.matricula, a.id_traslado, t.estado
             FROM Ambulancias a
             LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
             WHERE a.numero_coche = '$numeroEscapado'
                OR a.matricula = '$numeroEscapado'";

$resultado = $conexion->query($consulta);

if (!$resultado) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

$ambulancia = $resultado->fetch_assoc();

if (!$ambulancia) {
    echo json_encode(array('ok' => false, 'error' => 'No existe una ambulancia con ese número de coche'));
    exit;
}

if ($ambulancia['estado'] != null && $ambulancia['estado'] != 'Finalizado') {
    echo json_encode(array('ok' => false, 'error' => 'La ambulancia ya tiene un traslado en curso'));
    exit;
}

if ($horaLlegadaEscapada == '') {
    $valorLlegada = 'NULL';
} else {
    $valorLlegada = "'$horaLlegadaEscapada'";
}

$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado)
        VALUES ('$horaSalidaEscapada', $valorLlegada, '$origenEscapado', '$destinoEscapado', 'En curso')";

if (!$conexion->query($sql)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

$idTraslado = $conexion->insert_id;

$matriculaEscapada = $conexion->real_escape_string($ambulancia['matricula']);

$actualizar = "UPDATE Ambulancias SET id_traslado = $idTraslado
               WHERE matricula = '$matriculaEscapada'";

if (!$conexion->query($actualizar)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

echo json_encode(array('ok' => true, 'id_traslado' => $idTraslado));
