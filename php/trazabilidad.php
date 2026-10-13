<?php

header('Content-Type: application/json');

require_once 'conexion.php';
require_once 'sesion.php';

requiereSesion(array('admin_ambulancias', 'super_admin'));

// US-08: orden de los estados (no se puede retroceder)
$ordenEstados = array('Pendiente', 'En curso', 'En ruta', 'Llegada a destino', 'Retorno', 'Finalizado');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {

    $accion = 'ambulancias';
    if (isset($_GET['accion']) && $_GET['accion'] != '') {
        $accion = $_GET['accion'];
    }

    // US-07: listado precargado de conductores
    if ($accion == 'conductores') {
        $conductores = array();
        $resultado = $conexion->query("SELECT id_conductor, cedula, nombre, apellido, telefono
                                       FROM Conductores
                                       ORDER BY apellido, nombre");

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $conductores[] = $fila;
            }
        }

        echo json_encode($conductores);
        exit;
    }

    // US-07: listado precargado de acompañantes
    if ($accion == 'acompanantes') {
        $acompanantes = array();
        $resultado = $conexion->query("SELECT id_acompanante, cedula, nombre, apellido, telefono
                                       FROM Acompanantes_Catalogo
                                       ORDER BY apellido, nombre");

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $acompanantes[] = $fila;
            }
        }

        echo json_encode($acompanantes);
        exit;
    }

    // US-09: panel de control de traslados con filtros
    if ($accion == 'panel') {

        $estado = '';
        if (isset($_GET['estado'])) {
            $estado = trim($_GET['estado']);
        }

        $fecha = '';
        if (isset($_GET['fecha'])) {
            $fecha = trim($_GET['fecha']);
        }

        $sql = "SELECT t.id_traslado, t.origen, t.destino,
                       t.hora_salida, t.hora_llegada, t.estado,
                       t.elemento_tipo, t.elemento_descripcion,
                       c.nombre AS conductor_nombre, c.apellido AS conductor_apellido,
                       ac.nombre AS acompanante_nombre, ac.apellido AS acompanante_apellido,
                       a.numero_coche
                FROM Traslados t
                LEFT JOIN Conductores c ON c.id_conductor = t.id_conductor
                LEFT JOIN Acompanantes_Catalogo ac ON ac.id_acompanante = t.id_acompanante
                LEFT JOIN Ambulancias a ON a.id_traslado = t.id_traslado
                WHERE 1 = 1";

        if ($estado != '') {
            $estadoEscapado = $conexion->real_escape_string($estado);
            $sql = $sql . " AND t.estado = '$estadoEscapado'";
        }

        if ($fecha != '') {
            $fechaEscapada = $conexion->real_escape_string($fecha);
            $sql = $sql . " AND DATE(t.hora_salida) = '$fechaEscapada'";
        }

        // Los traslados activos van primero, los finalizados al final
        $sql = $sql . " ORDER BY (t.estado = 'Finalizado') ASC, t.hora_salida DESC, t.id_traslado DESC";

        $resultado = $conexion->query($sql);

        $traslados = array();

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $traslados[] = $fila;
            }
        }

        echo json_encode($traslados);
        exit;
    }

    // US-08: detalle de un traslado con su historial de estados
    if ($accion == 'detalle') {

        $id = 0;
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
        }

        if ($id <= 0) {
            echo json_encode(array('ok' => false, 'error' => 'Traslado no válido'));
            exit;
        }

        $sql = "SELECT t.id_traslado, t.origen, t.destino, t.hora_salida, t.hora_llegada, t.estado,
                       t.elemento_tipo, t.elemento_descripcion,
                       c.nombre AS conductor_nombre, c.apellido AS conductor_apellido,
                       a.numero_coche
                FROM Traslados t
                LEFT JOIN Conductores c ON c.id_conductor = t.id_conductor
                LEFT JOIN Ambulancias a ON a.id_traslado = t.id_traslado
                WHERE t.id_traslado = $id";

        $resultado = $conexion->query($sql);

        if (!$resultado || $resultado->num_rows == 0) {
            echo json_encode(array('ok' => false, 'error' => 'El traslado no existe'));
            exit;
        }

        $traslado = $resultado->fetch_assoc();

        $historial = array();
        $resultadoHistorial = $conexion->query("SELECT estado, fecha_cambio
                                                FROM Traslado_Estados
                                                WHERE id_traslado = $id
                                                ORDER BY fecha_cambio ASC, id_estado ASC");

        if ($resultadoHistorial) {
            while ($fila = $resultadoHistorial->fetch_assoc()) {
                $historial[] = $fila;
            }
        }

        // Solo se ofrecen los estados posteriores al actual
        $estadosPermitidos = array();
        $indiceActual = array_search($traslado['estado'], $ordenEstados);

        if ($indiceActual !== false) {
            for ($i = $indiceActual + 1; $i < count($ordenEstados); $i++) {
                $estadosPermitidos[] = $ordenEstados[$i];
            }
        }

        echo json_encode(array(
            'ok' => true,
            'traslado' => $traslado,
            'historial' => $historial,
            'estados_permitidos' => $estadosPermitidos
        ));
        exit;
    }

    // US-10: histórico de traslados con filtros
    if ($accion == 'historico') {

        $id = 0;
        if (isset($_GET['id']) && $_GET['id'] != '') {
            $id = intval($_GET['id']);
        }

        $conductor = '';
        if (isset($_GET['conductor'])) {
            $conductor = trim($_GET['conductor']);
        }

        $paciente = '';
        if (isset($_GET['paciente'])) {
            $paciente = trim($_GET['paciente']);
        }

        $fechaDesde = '';
        if (isset($_GET['fecha_desde'])) {
            $fechaDesde = trim($_GET['fecha_desde']);
        }

        $fechaHasta = '';
        if (isset($_GET['fecha_hasta'])) {
            $fechaHasta = trim($_GET['fecha_hasta']);
        }

        $estado = '';
        if (isset($_GET['estado'])) {
            $estado = trim($_GET['estado']);
        }

        $sql = "SELECT t.id_traslado, t.origen, t.destino, t.hora_salida, t.hora_llegada, t.estado,
                       t.elemento_tipo, t.elemento_descripcion,
                       c.nombre AS conductor_nombre, c.apellido AS conductor_apellido,
                       a.numero_coche
                FROM Traslados t
                LEFT JOIN Conductores c ON c.id_conductor = t.id_conductor
                LEFT JOIN Ambulancias a ON a.id_traslado = t.id_traslado
                WHERE 1 = 1";

        if ($id > 0) {
            $sql = $sql . " AND t.id_traslado = $id";
        }

        if ($conductor != '') {
            $conductorEscapado = $conexion->real_escape_string($conductor);
            $sql = $sql . " AND (c.nombre LIKE '%$conductorEscapado%' OR c.apellido LIKE '%$conductorEscapado%')";
        }

        if ($paciente != '') {
            $pacienteEscapado = $conexion->real_escape_string($paciente);
            $sql = $sql . " AND t.elemento_descripcion LIKE '%$pacienteEscapado%'";
        }

        if ($fechaDesde != '') {
            $desdeEscapada = $conexion->real_escape_string($fechaDesde);
            $sql = $sql . " AND DATE(t.hora_salida) >= '$desdeEscapada'";
        }

        if ($fechaHasta != '') {
            $hastaEscapada = $conexion->real_escape_string($fechaHasta);
            $sql = $sql . " AND DATE(t.hora_salida) <= '$hastaEscapada'";
        }

        if ($estado != '') {
            $estadoEscapado = $conexion->real_escape_string($estado);
            $sql = $sql . " AND t.estado = '$estadoEscapado'";
        }

        $sql = $sql . " ORDER BY t.hora_salida DESC, t.id_traslado DESC";

        $resultado = $conexion->query($sql);

        $traslados = array();

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $traslados[] = $fila;
            }
        }

        echo json_encode($traslados);
        exit;
    }

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

// US-08: actualizar el estado de un traslado
$accionPost = '';
if (isset($_POST['accion'])) {
    $accionPost = $_POST['accion'];
}

if ($accionPost == 'actualizar_estado') {

    $id = 0;
    if (isset($_POST['id_traslado'])) {
        $id = intval($_POST['id_traslado']);
    }

    $nuevoEstado = '';
    if (isset($_POST['estado'])) {
        $nuevoEstado = trim($_POST['estado']);
    }

    if ($id <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Traslado no válido'));
        exit;
    }

    if (!in_array($nuevoEstado, $ordenEstados, true)) {
        echo json_encode(array('ok' => false, 'error' => 'Estado no válido'));
        exit;
    }

    $resultado = $conexion->query("SELECT estado FROM Traslados WHERE id_traslado = $id");

    if (!$resultado || $resultado->num_rows == 0) {
        echo json_encode(array('ok' => false, 'error' => 'El traslado no existe'));
        exit;
    }

    $fila = $resultado->fetch_assoc();
    $estadoActual = $fila['estado'];

    $indiceActual = array_search($estadoActual, $ordenEstados);
    $indiceNuevo = array_search($nuevoEstado, $ordenEstados);

    // No se puede retroceder ni repetir el estado
    if ($indiceNuevo <= $indiceActual) {
        echo json_encode(array('ok' => false, 'error' => 'No se puede retroceder a un estado anterior'));
        exit;
    }

    $nuevoEscapado = $conexion->real_escape_string($nuevoEstado);

    if (!$conexion->query("UPDATE Traslados SET estado = '$nuevoEscapado' WHERE id_traslado = $id")) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }

    // Se registra el cambio con su timestamp
    $conexion->query("INSERT INTO Traslado_Estados (id_traslado, estado, fecha_cambio)
                      VALUES ($id, '$nuevoEscapado', NOW())");

    echo json_encode(array('ok' => true, 'estado' => $nuevoEstado));
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

$idConductor = 0;
if (isset($_POST['id_conductor'])) {
    $idConductor = intval($_POST['id_conductor']);
}

$idAcompanante = 0;
if (isset($_POST['id_acompanante'])) {
    $idAcompanante = intval($_POST['id_acompanante']);
}

$tiposValidos = array('paciente_biologico', 'equipamiento_medico', 'otros_insumos', 'otro');

$elementoTipo = 'paciente_biologico';
if (isset($_POST['elemento_tipo']) && in_array($_POST['elemento_tipo'], $tiposValidos, true)) {
    $elementoTipo = $_POST['elemento_tipo'];
}

$elementoDescripcion = '';
if (isset($_POST['elemento_descripcion'])) {
    $elementoDescripcion = trim($_POST['elemento_descripcion']);
}

$numero = str_ireplace('coche', '', $numero);
$numero = trim($numero);

if ($numero == '' || $origen == '' || $destino == '' || $horaSalida == '') {
    echo json_encode(array('ok' => false, 'error' => 'Debe completar todos los campos obligatorios'));
    exit;
}

if ($idConductor <= 0) {
    echo json_encode(array('ok' => false, 'error' => 'Seleccione un conductor'));
    exit;
}

if ($elementoDescripcion == '') {
    echo json_encode(array('ok' => false, 'error' => 'Ingrese el paciente o elemento a trasladar'));
    exit;
}

$numeroEscapado = $conexion->real_escape_string($numero);
$origenEscapado = $conexion->real_escape_string($origen);
$destinoEscapado = $conexion->real_escape_string($destino);
$horaSalidaEscapada = $conexion->real_escape_string($horaSalida);
$horaLlegadaEscapada = $conexion->real_escape_string($horaLlegada);

$elementoDescripcionEscapada = $conexion->real_escape_string($elementoDescripcion);
$elementoTipoEscapado = $conexion->real_escape_string($elementoTipo);

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

if ($idAcompanante > 0) {
    $valorAcompanante = $idAcompanante;
} else {
    $valorAcompanante = 'NULL';
}

$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado,
                              id_conductor, id_acompanante, elemento_tipo, elemento_descripcion)
        VALUES ('$horaSalidaEscapada', $valorLlegada, '$origenEscapado', '$destinoEscapado', 'Pendiente',
                $idConductor, $valorAcompanante, '$elementoTipoEscapado', '$elementoDescripcionEscapada')";

if (!$conexion->query($sql)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

$idTraslado = $conexion->insert_id;

// US-08: registrar el estado inicial en el historial
$conexion->query("INSERT INTO Traslado_Estados (id_traslado, estado, fecha_cambio)
                  VALUES ($idTraslado, 'Pendiente', NOW())");

$matriculaEscapada = $conexion->real_escape_string($ambulancia['matricula']);

$actualizar = "UPDATE Ambulancias SET id_traslado = $idTraslado
               WHERE matricula = '$matriculaEscapada'";

if (!$conexion->query($actualizar)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

echo json_encode(array('ok' => true, 'id_traslado' => $idTraslado));
