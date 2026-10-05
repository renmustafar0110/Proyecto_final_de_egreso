<?php

header('Content-Type: application/json');

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $sql = "SELECT a.numero_coche, a.id_traslado,
                   t.origen, t.destino, t.hora_salida, t.hora_llegada, t.estado
            FROM Ambulancias a
            LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
            ORDER BY a.numero_coche";

    $resultado = $conexion->query($sql);

    $ambulancias = [];

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {

            if ($fila['estado'] === null || $fila['estado'] === 'Finalizado') {
                $fila['estado'] = 'Disponible';
            }

            $ambulancias[] = $fila;
        }
    }

    echo json_encode($ambulancias);
exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
exit;
}


$numero      = isset($_POST['numero_coche']) ? trim($_POST['numero_coche']) : '';
$origen      = isset($_POST['origen']) ? trim($_POST['origen']) : '';
$destino     = isset($_POST['destino']) ? trim($_POST['destino']) : '';
$horaSalida  = isset($_POST['hora_salida']) ? trim($_POST['hora_salida']) : '';
$horaLlegada = isset($_POST['hora_llegada']) ? trim($_POST['hora_llegada']) : '';

$numero = str_ireplace('coche', '', $numero);
$numero = trim($numero);

if ($numero === '' || $origen === '' || $destino === '' || $horaSalida === '') {
    echo json_encode(['ok' => false, 'error' => 'Debe completar todos los campos obligatorios']);
exit;
}

$numero      = $conexion->real_escape_string($numero);
$origen      = $conexion->real_escape_string($origen);
$destino     = $conexion->real_escape_string($destino);
$horaSalida  = $conexion->real_escape_string($horaSalida);
$horaLlegada = $conexion->real_escape_string($horaLlegada);

$horaSalida = str_replace('T', ' ', $horaSalida);

if ($horaLlegada !== '') {
    $horaLlegada = str_replace('T', ' ', $horaLlegada);
    $horaLlegadaParaBD = "'$horaLlegada'";
} else {
    $horaLlegadaParaBD = 'NULL';
}

$consulta = "SELECT a.matricula, a.id_traslado, t.estado
             FROM Ambulancias a
             LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
             WHERE a.numero_coche = '$numero'
                OR a.matricula = '$numero'";
$resultado = $conexion->query($consulta);
$ambulancia = $resultado ? $resultado->fetch_assoc() : null;

if (!$ambulancia) {
    echo json_encode(['ok' => false, 'error' => 'No existe una ambulancia con ese número de coche']);
exit;
}

if ($ambulancia['estado'] !== null && $ambulancia['estado'] !== 'Finalizado') {
    echo json_encode(['ok' => false, 'error' => 'La ambulancia ya tiene un traslado en curso']);
exit;
}

$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado)
        VALUES ('$horaSalida', $horaLlegadaParaBD, '$origen', '$destino', 'En curso')";

if (!$conexion->query($sql)) {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
exit;
}

$idTraslado = $conexion->insert_id;

$actualizar = "UPDATE Ambulancias SET id_traslado = $idTraslado
               WHERE matricula = '{$ambulancia['matricula']}'";

if (!$conexion->query($actualizar)) {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
exit;
}

echo json_encode(['ok' => true, 'id_traslado' => $idTraslado]);
