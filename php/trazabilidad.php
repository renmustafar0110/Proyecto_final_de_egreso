<?php
// ============================================================================
// trazabilidad.php
//
// Este archivo hace DOS trabajos, depende de cómo lo llamen:
//
//   1) Cuando se pide con GET  -> devuelve la lista de ambulancias
//      (cada una con los datos de su traslado actual).
//   2) Cuando se pide con POST -> guarda un traslado NUEVO en la base de datos.
//
// En los dos casos la respuesta se entrega en formato JSON.
// ============================================================================

// Le aviso al navegador que lo que voy a responder es JSON
header('Content-Type: application/json');

// Traigo la conexión a la base de datos (definida en conexion.php)
require_once 'conexion.php';

// ----------------------------------------------------------------------------
// CASO 1: PEDIDO GET = LISTAR LAS AMBULANCIAS
// ----------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Consulto cada ambulancia (a) junto con los datos de su traslado (t).
    // El LEFT JOIN sirve para que aparezcan TODAS las ambulancias,
    // incluso las que todavía no tienen ningún traslado.
    $sql = "SELECT a.matricula, a.numero_coche, a.id_traslado,
                   t.origen, t.destino, t.hora_salida, t.hora_llegada, t.estado
            FROM Ambulancias a
            LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
            ORDER BY a.numero_coche";

    $resultado = $conexion->query($sql);

    // En esta lista voy guardando todas las ambulancias
    $ambulancias = [];

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {

            // Si la ambulancia no tiene traslado (estado null)
            // o su traslado ya terminó (Finalizado),
            // entonces la mostramos como "Disponible".
            if ($fila['estado'] === null || $fila['estado'] === 'Finalizado') {
                $fila['estado'] = 'Disponible';
            }

            $ambulancias[] = $fila;
        }
    }

    // Devuelvo la lista de ambulancias como JSON
    echo json_encode($ambulancias);
    $conexion->close();
    exit;
}

// Si el pedido no es GET ni POST, lo rechazo
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    $conexion->close();
    exit;
}

// ----------------------------------------------------------------------------
// CASO 2: PEDIDO POST = GUARDAR UN TRASLADO NUEVO
// ----------------------------------------------------------------------------

// 1) Leo los datos que envía el formulario (vienen en $_POST)
$numero      = isset($_POST['numero_coche']) ? trim($_POST['numero_coche']) : '';
$origen      = isset($_POST['origen']) ? trim($_POST['origen']) : '';
$destino     = isset($_POST['destino']) ? trim($_POST['destino']) : '';
$horaSalida  = isset($_POST['hora_salida']) ? trim($_POST['hora_salida']) : '';
$horaLlegada = isset($_POST['hora_llegada']) ? trim($_POST['hora_llegada']) : '';

// Si el usuario eligió algo como "Coche 01", saco la palabra "Coche"
// y dejo solamente el número (por ejemplo "01").
$numero = str_ireplace('coche', '', $numero);
$numero = trim($numero);

// 2) Reviso que estén completos los campos obligatorios
if ($numero === '' || $origen === '' || $destino === '' || $horaSalida === '') {
    echo json_encode(['ok' => false, 'error' => 'Debe completar todos los campos obligatorios']);
    $conexion->close();
    exit;
}

// 3) Limpio los textos para evitar inyección SQL
$numero      = $conexion->real_escape_string($numero);
$origen      = $conexion->real_escape_string($origen);
$destino     = $conexion->real_escape_string($destino);
$horaSalida  = $conexion->real_escape_string($horaSalida);
$horaLlegada = $conexion->real_escape_string($horaLlegada);

// 4) El navegador manda la hora así: 2026-09-15T10:30
//    MySQL la guarda así:          2026-09-15 10:30
//    Por eso cambio la "T" por un espacio.
$horaSalida = str_replace('T', ' ', $horaSalida);

// Si se mandó hora de llegada hago lo mismo.
// Si quedó vacía, MySQL guardará NULL (que está bien porque no llegó todavía).
if ($horaLlegada !== '') {
    $horaLlegada = str_replace('T', ' ', $horaLlegada);
    $horaLlegadaParaBD = "'$horaLlegada'";
} else {
    $horaLlegadaParaBD = 'NULL';
}

// 5) Verifico que la ambulancia elegida exista
//    y que en este momento esté disponible (sin traslado en curso).
$consulta = "SELECT a.matricula, a.id_traslado, t.estado
             FROM Ambulancias a
             LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
             WHERE a.numero_coche = '$numero'
                OR a.matricula = '$numero'";
$resultado = $conexion->query($consulta);
$ambulancia = $resultado ? $resultado->fetch_assoc() : null;

// Si no existe ninguna ambulancia con ese número, aviso
if (!$ambulancia) {
    echo json_encode(['ok' => false, 'error' => 'No existe una ambulancia con ese número de coche']);
    $conexion->close();
    exit;
}

// Si tiene un traslado sin terminar, no puedo ordenarle otro
if ($ambulancia['estado'] !== null && $ambulancia['estado'] !== 'Finalizado') {
    echo json_encode(['ok' => false, 'error' => 'La ambulancia ya tiene un traslado en curso']);
    $conexion->close();
    exit;
}

// 6) Guardo el traslado nuevo con estado "En curso"
$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado)
        VALUES ('$horaSalida', $horaLlegadaParaBD, '$origen', '$destino', 'En curso')";

if (!$conexion->query($sql)) {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
    $conexion->close();
    exit;
}

// MySQL me da el id recién creado
$idTraslado = $conexion->insert_id;

// 7) Asocio la ambulancia al traslado nuevo.
//    Guardo ese id en la tabla Ambulancias para que queden vinculados.
$actualizar = "UPDATE Ambulancias SET id_traslado = $idTraslado
               WHERE matricula = '{$ambulancia['matricula']}'";

if (!$conexion->query($actualizar)) {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
    $conexion->close();
    exit;
}

// Todo salió bien: aviso "ok" y el id del traslado creado
echo json_encode(['ok' => true, 'id_traslado' => $idTraslado]);
$conexion->close();