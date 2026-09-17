<?php
// GET: lista ambulancias. POST: guarda un traslado nuevo.

// La respuesta se entrega como JSON
header('Content-Type: application/json');

// Conexión a la base de datos
require_once 'conexion.php';

// CASO 1: GET = LISTAR AMBULANCIAS
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Consulta ambulancias junto a su traslado actual
    $sql = "SELECT a.matricula, a.numero_coche, a.id_traslado,
                   t.origen, t.destino, t.hora_salida, t.hora_llegada, t.estado
            FROM Ambulancias a
            LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
            ORDER BY a.numero_coche";

    $resultado = $conexion->query($sql);

    // Lista con las ambulancias
    $ambulancias = [];

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {

            // Sin traslado o ya finalizado se muestra "Disponible"
            if ($fila['estado'] === null || $fila['estado'] === 'Finalizado') {
                $fila['estado'] = 'Disponible';
            }

            $ambulancias[] = $fila;
        }
    }

    // Devuelve la lista como JSON
    echo json_encode($ambulancias);
    $conexion->close();
    exit;
}

// Valida que el método sea solo GET o POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    $conexion->close();
    exit;
}

// CASO 2: POST = GUARDAR TRASLADO NUEVO

// Lee los datos del formulario
$numero      = isset($_POST['numero_coche']) ? trim($_POST['numero_coche']) : '';
$origen      = isset($_POST['origen']) ? trim($_POST['origen']) : '';
$destino     = isset($_POST['destino']) ? trim($_POST['destino']) : '';
$horaSalida  = isset($_POST['hora_salida']) ? trim($_POST['hora_salida']) : '';
$horaLlegada = isset($_POST['hora_llegada']) ? trim($_POST['hora_llegada']) : '';

// Deja solo el número del coche
$numero = str_ireplace('coche', '', $numero);
$numero = trim($numero);

// Valida campos obligatorios
if ($numero === '' || $origen === '' || $destino === '' || $horaSalida === '') {
    echo json_encode(['ok' => false, 'error' => 'Debe completar todos los campos obligatorios']);
    $conexion->close();
    exit;
}

// Limpia los textos contra inyección SQL
$numero      = $conexion->real_escape_string($numero);
$origen      = $conexion->real_escape_string($origen);
$destino     = $conexion->real_escape_string($destino);
$horaSalida  = $conexion->real_escape_string($horaSalida);
$horaLlegada = $conexion->real_escape_string($horaLlegada);

// Cambia "T" de la hora por espacio para MySQL
$horaSalida = str_replace('T', ' ', $horaSalida);

// Si falta hora de llegada se guarda NULL
if ($horaLlegada !== '') {
    $horaLlegada = str_replace('T', ' ', $horaLlegada);
    $horaLlegadaParaBD = "'$horaLlegada'";
} else {
    $horaLlegadaParaBD = 'NULL';
}

// Verifica que la ambulancia exista y esté disponible
$consulta = "SELECT a.matricula, a.id_traslado, t.estado
             FROM Ambulancias a
             LEFT JOIN Traslados t ON t.id_traslado = a.id_traslado
             WHERE a.numero_coche = '$numero'
                OR a.matricula = '$numero'";
$resultado = $conexion->query($consulta);
$ambulancia = $resultado ? $resultado->fetch_assoc() : null;

// Si no existe la ambulancia, avisa
if (!$ambulancia) {
    echo json_encode(['ok' => false, 'error' => 'No existe una ambulancia con ese número de coche']);
    $conexion->close();
    exit;
}

// Rechaza si ya tiene un traslado en curso
if ($ambulancia['estado'] !== null && $ambulancia['estado'] !== 'Finalizado') {
    echo json_encode(['ok' => false, 'error' => 'La ambulancia ya tiene un traslado en curso']);
    $conexion->close();
    exit;
}

// Inserta el traslado nuevo con estado "En curso"
$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado)
        VALUES ('$horaSalida', $horaLlegadaParaBD, '$origen', '$destino', 'En curso')";

if (!$conexion->query($sql)) {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
    $conexion->close();
    exit;
}

// Id del traslado recién creado
$idTraslado = $conexion->insert_id;

// Asocia la ambulancia al traslado nuevo
$actualizar = "UPDATE Ambulancias SET id_traslado = $idTraslado
               WHERE matricula = '{$ambulancia['matricula']}'";

if (!$conexion->query($actualizar)) {
    echo json_encode(['ok' => false, 'error' => $conexion->error]);
    $conexion->close();
    exit;
}

// Respuesta de éxito con el id del traslado
echo json_encode(['ok' => true, 'id_traslado' => $idTraslado]);
$conexion->close();