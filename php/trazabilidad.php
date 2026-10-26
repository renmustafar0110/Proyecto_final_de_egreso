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

    // Acompañantes registrados (los que todavía no están asignados a un traslado)
    if ($accion == 'acompanantes') {
        $acompanantes = array();
        $resultado = $conexion->query("SELECT id_acompanante AS id, nombre, apellido, cedula_acom AS cedula
                                       FROM Acompanantes
                                       WHERE id_traslado IS NULL
                                       ORDER BY apellido, nombre");

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $acompanantes[] = $fila;
            }
        }

        echo json_encode($acompanantes);
        exit;
    }

    // Copilotos registrados (los que todavía no están asignados a un traslado)
    if ($accion == 'copilotos') {
        $copilotos = array();
        $resultado = $conexion->query("SELECT id_copiloto AS id, nombre_copiloto AS nombre,
                                              apellido_copiloto AS apellido, cedula
                                       FROM Copilotos
                                       WHERE id_traslado IS NULL
                                       ORDER BY apellido_copiloto, nombre_copiloto");

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $copilotos[] = $fila;
            }
        }

        echo json_encode($copilotos);
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
                       t.elemento_dato1, t.elemento_dato2, t.elemento_dato3,
                       c.nombre AS conductor_nombre, c.apellido AS conductor_apellido,
                       ac.nombre AS acompanante_nombre, ac.apellido AS acompanante_apellido,
                       cp.nombre_copiloto AS copiloto_nombre, cp.apellido_copiloto AS copiloto_apellido,
                       a.numero_coche
                FROM Traslados t
                LEFT JOIN Conductores c ON c.id_conductor = t.id_conductor
                LEFT JOIN Acompanantes ac ON ac.id_traslado = t.id_traslado
                LEFT JOIN Copilotos cp ON cp.id_traslado = t.id_traslado
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
                       t.elemento_tipo, t.elemento_descripcion, t.elemento_dato1, t.elemento_dato2, t.elemento_dato3,
                       t.id_conductor,
                       c.nombre AS conductor_nombre, c.apellido AS conductor_apellido,
                       a.numero_coche,
                       ac.nombre AS acompanante_nombre, ac.apellido AS acompanante_apellido,
                       ac.cedula_acom AS acompanante_cedula, ac.telefono AS acompanante_telefono,
                       (SELECT a2.id_acompanante FROM Acompanantes a2
                          WHERE a2.id_traslado IS NULL AND a2.cedula_acom = ac.cedula_acom
                          ORDER BY a2.id_acompanante LIMIT 1) AS acompanante_id,
                       (SELECT c2.id_copiloto FROM Copilotos c2
                          WHERE c2.id_traslado IS NULL AND c2.cedula = cp.cedula
                          ORDER BY c2.id_copiloto LIMIT 1) AS copiloto_id
                FROM Traslados t
                LEFT JOIN Conductores c ON c.id_conductor = t.id_conductor
                LEFT JOIN Ambulancias a ON a.id_traslado = t.id_traslado
                LEFT JOIN Acompanantes ac ON ac.id_traslado = t.id_traslado
                LEFT JOIN Copilotos cp ON cp.id_traslado = t.id_traslado
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

// US-07: edición de un traslado. Solo aplica mientras siga en estado "Pendiente".
if ($accionPost == 'editar') {

    $id = 0;
    if (isset($_POST['id_traslado'])) {
        $id = intval($_POST['id_traslado']);
    }

    if ($id <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Traslado no válido'));
        exit;
    }

    $resultadoEdicion = $conexion->query("SELECT estado FROM Traslados WHERE id_traslado = $id");

    if (!$resultadoEdicion || $resultadoEdicion->num_rows == 0) {
        echo json_encode(array('ok' => false, 'error' => 'El traslado no existe'));
        exit;
    }

    $filaEdicion = $resultadoEdicion->fetch_assoc();

    if ($filaEdicion['estado'] != 'Pendiente') {
        echo json_encode(array('ok' => false, 'error' => 'Solo se pueden editar los traslados en estado Pendiente'));
        exit;
    }

    $datos = leerDatosTraslado($conexion, $id);

    $origenEscapado = $conexion->real_escape_string($datos['origen']);
    $destinoEscapado = $conexion->real_escape_string($datos['destino']);
    $horaSalidaEscapada = $conexion->real_escape_string($datos['hora_salida']);
    $elementoTipoEscapado = $conexion->real_escape_string($datos['elemento_tipo']);
    $elementoDescripcionEscapada = $conexion->real_escape_string($datos['elemento_descripcion']);
    $elementoDato1Escapado = $conexion->real_escape_string($datos['elemento_dato1']);
    $elementoDato2Escapado = $conexion->real_escape_string($datos['elemento_dato2']);
    $elementoDato3Escapado = $conexion->real_escape_string($datos['elemento_dato3']);

    if ($datos['hora_llegada'] == '') {
        $valorLlegada = 'NULL';
    } else {
        $valorLlegada = "'" . $conexion->real_escape_string($datos['hora_llegada']) . "'";
    }

    $sql = "UPDATE Traslados
            SET hora_salida = '$horaSalidaEscapada', hora_llegada = $valorLlegada,
                origen = '$origenEscapado', destino = '$destinoEscapado',
                id_conductor = {$datos['id_conductor']},
                elemento_tipo = '$elementoTipoEscapado',
                elemento_descripcion = '$elementoDescripcionEscapada',
                elemento_dato1 = '$elementoDato1Escapado',
                elemento_dato2 = '$elementoDato2Escapado',
                elemento_dato3 = '$elementoDato3Escapado'
            WHERE id_traslado = $id";

    if (!$conexion->query($sql)) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }

    // El acompañante y el copiloto se reemplazan por completo
    $conexion->query("DELETE FROM Acompanantes WHERE id_traslado = $id");
    $conexion->query("DELETE FROM Copilotos WHERE id_traslado = $id");

    guardarAcompanante($conexion, $datos, $id);
    guardarCopiloto($conexion, $datos, $id);

    // La ambulancia anterior queda libre y se asigna la indicada
    $conexion->query("UPDATE Ambulancias SET id_traslado = NULL WHERE id_traslado = $id");

    $matriculaEscapada = $conexion->real_escape_string($datos['matricula']);

    if (!$conexion->query("UPDATE Ambulancias SET id_traslado = $id WHERE matricula = '$matriculaEscapada'")) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }

    echo json_encode(array('ok' => true, 'id_traslado' => $id, 'mensaje' => 'Traslado actualizado'));
    exit;
}

// US-07: eliminación de un traslado. Solo aplica mientras siga en estado "Pendiente".
if ($accionPost == 'eliminar') {

    $id = 0;
    if (isset($_POST['id_traslado'])) {
        $id = intval($_POST['id_traslado']);
    }

    if ($id <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Traslado no válido'));
        exit;
    }

    $resultadoEliminacion = $conexion->query("SELECT estado FROM Traslados WHERE id_traslado = $id");

    if (!$resultadoEliminacion || $resultadoEliminacion->num_rows == 0) {
        echo json_encode(array('ok' => false, 'error' => 'El traslado no existe'));
        exit;
    }

    $filaEliminacion = $resultadoEliminacion->fetch_assoc();

    if ($filaEliminacion['estado'] != 'Pendiente') {
        echo json_encode(array('ok' => false, 'error' => 'Solo se pueden eliminar los traslados en estado Pendiente'));
        exit;
    }

    // Se libera la ambulancia y se borran los registros asociados
    $conexion->query("UPDATE Ambulancias SET id_traslado = NULL WHERE id_traslado = $id");
    $conexion->query("DELETE FROM Acompanantes WHERE id_traslado = $id");
    $conexion->query("DELETE FROM Copilotos WHERE id_traslado = $id");
    $conexion->query("DELETE FROM Traslado_Estados WHERE id_traslado = $id");

    if (!$conexion->query("DELETE FROM Traslados WHERE id_traslado = $id")) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }

    echo json_encode(array('ok' => true, 'mensaje' => 'Traslado eliminado'));
    exit;
}

// US-07: se leen y validan los datos del formulario para registrar el traslado
$datos = leerDatosTraslado($conexion, 0);

$origenEscapado = $conexion->real_escape_string($datos['origen']);
$destinoEscapado = $conexion->real_escape_string($datos['destino']);
$horaSalidaEscapada = $conexion->real_escape_string($datos['hora_salida']);
$elementoTipoEscapado = $conexion->real_escape_string($datos['elemento_tipo']);
$elementoDescripcionEscapada = $conexion->real_escape_string($datos['elemento_descripcion']);
$elementoDato1Escapado = $conexion->real_escape_string($datos['elemento_dato1']);
$elementoDato2Escapado = $conexion->real_escape_string($datos['elemento_dato2']);
$elementoDato3Escapado = $conexion->real_escape_string($datos['elemento_dato3']);

if ($datos['hora_llegada'] == '') {
    $valorLlegada = 'NULL';
} else {
    $valorLlegada = "'" . $conexion->real_escape_string($datos['hora_llegada']) . "'";
}

$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado,
                              id_conductor, elemento_tipo, elemento_descripcion,
                              elemento_dato1, elemento_dato2, elemento_dato3)
        VALUES ('$horaSalidaEscapada', $valorLlegada, '$origenEscapado', '$destinoEscapado', 'Pendiente',
                {$datos['id_conductor']}, '$elementoTipoEscapado', '$elementoDescripcionEscapada',
                '$elementoDato1Escapado', '$elementoDato2Escapado', '$elementoDato3Escapado')";

if (!$conexion->query($sql)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

$idTraslado = ultimoIdInsertado($conexion);

// US-08: registrar el estado inicial en el historial
$conexion->query("INSERT INTO Traslado_Estados (id_traslado, estado, fecha_cambio)
                  VALUES ($idTraslado, 'Pendiente', NOW())");

// Registrar acompañante y copiloto si se eligieron
guardarAcompanante($conexion, $datos, $idTraslado);
guardarCopiloto($conexion, $datos, $idTraslado);

$matriculaEscapada = $conexion->real_escape_string($datos['matricula']);

$actualizar = "UPDATE Ambulancias SET id_traslado = $idTraslado
               WHERE matricula = '$matriculaEscapada'";

if (!$conexion->query($actualizar)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

echo json_encode(array('ok' => true, 'id_traslado' => $idTraslado));

// ---------------------------------------------------------------------
// Funciones auxiliares
// ---------------------------------------------------------------------

function campoPost($clave) {
    return isset($_POST[$clave]) ? trim($_POST[$clave]) : '';
}

function guardarAcompanante($conexion, $datos, $idTraslado) {
    if ($datos['acompanante'] === null) {
        return;
    }

    $acompanante = $datos['acompanante'];

    $telefono = 'NULL';
    if ($acompanante['telefono'] !== null && $acompanante['telefono'] !== '') {
        $telefono = "'" . $conexion->real_escape_string($acompanante['telefono']) . "'";
    }

    $nombre = $conexion->real_escape_string($acompanante['nombre']);
    $apellido = $conexion->real_escape_string($acompanante['apellido']);
    $cedula = $conexion->real_escape_string($acompanante['cedula']);

    $sql = "INSERT INTO Acompanantes (nombre, apellido, cedula_acom, telefono, id_traslado)
            VALUES ('$nombre', '$apellido', '$cedula', $telefono, $idTraslado)";

    if (!$conexion->query($sql)) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }
}

function guardarCopiloto($conexion, $datos, $idTraslado) {
    if ($datos['copiloto'] === null) {
        return;
    }

    $copiloto = $datos['copiloto'];

    $idFuncionario = 'NULL';
    if ($copiloto['id_funcionario'] !== null && $copiloto['id_funcionario'] !== '') {
        $idFuncionario = intval($copiloto['id_funcionario']);
    }

    $nombre = $conexion->real_escape_string($copiloto['nombre']);
    $apellido = $conexion->real_escape_string($copiloto['apellido']);
    $cedula = $conexion->real_escape_string($copiloto['cedula']);

    $sql = "INSERT INTO Copilotos (id_funcionario, nombre_copiloto, apellido_copiloto, cedula, id_traslado)
            VALUES ($idFuncionario, '$nombre', '$apellido', '$cedula', $idTraslado)";

    if (!$conexion->query($sql)) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }
}

// Lee y valida los datos del formulario de traslado (US-07).
// $idTrasladoReferencia es el traslado que se está editando (0 al crear):
// así la ambulancia que ya tiene asignada no se considera ocupada.
// Si algún dato falta o no es válido, responde el error y detiene la ejecución.
function leerDatosTraslado($conexion, $idTrasladoReferencia) {

    $numero = campoPost('numero_coche');
    $origen = campoPost('origen');
    $destino = campoPost('destino');
    $horaSalida = campoPost('hora_salida');
    $horaLlegada = campoPost('hora_llegada');

    $idConductor = intval(campoPost('id_conductor'));
    $idAcompanante = intval(campoPost('acompanante_id'));
    $idCopiloto = intval(campoPost('copiloto_id'));

    $tiposValidos = array('paciente_biologico', 'equipamiento_medico', 'muestra_biologica');

    $elementoTipo = campoPost('elemento_tipo');
    if (!in_array($elementoTipo, $tiposValidos, true)) {
        $elementoTipo = 'paciente_biologico';
    }

    $elementoDato1 = campoPost('elemento_dato1');
    $elementoDato2 = campoPost('elemento_dato2');
    $elementoDato3 = campoPost('elemento_dato3');

    $partesDescripcion = array();
    if ($elementoDato1 !== '') {
        $partesDescripcion[] = $elementoDato1;
    }
    if ($elementoDato2 !== '') {
        $partesDescripcion[] = $elementoDato2;
    }
    if ($elementoDato3 !== '') {
        $partesDescripcion[] = $elementoDato3;
    }
    $elementoDescripcion = implode(' | ', $partesDescripcion);

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

    // Validación del acompañante y del copiloto (salen del catálogo de sus tablas)
    $datosCopiloto = null;
    $datosAcompanante = null;
    $cedulaConductor = '';

    $resultadoConductor = $conexion->query("SELECT cedula FROM Conductores WHERE id_conductor = $idConductor");

    if ($resultadoConductor && $resultadoConductor->num_rows > 0) {
        $filaConductor = $resultadoConductor->fetch_assoc();
        $cedulaConductor = $filaConductor['cedula'];
    }

    if ($idAcompanante > 0) {
        $resultadoAcompanante = $conexion->query("SELECT nombre, apellido, cedula_acom, telefono
                                                   FROM Acompanantes
                                                   WHERE id_acompanante = $idAcompanante
                                                     AND id_traslado IS NULL");

        if (!$resultadoAcompanante || $resultadoAcompanante->num_rows == 0) {
            echo json_encode(array('ok' => false, 'error' => 'El acompañante seleccionado no existe'));
            exit;
        }

        $filaAcompanante = $resultadoAcompanante->fetch_assoc();

        if ($cedulaConductor != '' && $filaAcompanante['cedula_acom'] == $cedulaConductor) {
            echo json_encode(array('ok' => false, 'error' => 'El acompañante no puede ser la misma persona que el conductor'));
            exit;
        }

        $datosAcompanante = array(
            'nombre' => $filaAcompanante['nombre'],
            'apellido' => $filaAcompanante['apellido'],
            'cedula' => $filaAcompanante['cedula_acom'],
            'telefono' => $filaAcompanante['telefono']
        );
    }

    if ($idCopiloto > 0) {
        $resultadoCopiloto = $conexion->query("SELECT id_funcionario, nombre_copiloto, apellido_copiloto, cedula
                                               FROM Copilotos
                                               WHERE id_copiloto = $idCopiloto
                                                 AND id_traslado IS NULL");

        if (!$resultadoCopiloto || $resultadoCopiloto->num_rows == 0) {
            echo json_encode(array('ok' => false, 'error' => 'El copiloto seleccionado no existe'));
            exit;
        }

        $filaCopiloto = $resultadoCopiloto->fetch_assoc();

        if ($cedulaConductor != '' && $filaCopiloto['cedula'] == $cedulaConductor) {
            echo json_encode(array('ok' => false, 'error' => 'El copiloto no puede ser la misma persona que el conductor'));
            exit;
        }

        $datosCopiloto = array(
            'id_funcionario' => $filaCopiloto['id_funcionario'],
            'nombre' => $filaCopiloto['nombre_copiloto'],
            'apellido' => $filaCopiloto['apellido_copiloto'],
            'cedula' => $filaCopiloto['cedula']
        );
    }

    if ($datosAcompanante !== null && $datosCopiloto !== null && $datosAcompanante['cedula'] == $datosCopiloto['cedula']) {
        echo json_encode(array('ok' => false, 'error' => 'El acompañante y el copiloto no pueden ser la misma persona'));
        exit;
    }

    if ($elementoDato1 == '' || $elementoDato2 == '') {
        echo json_encode(array('ok' => false, 'error' => 'Complete los datos del elemento a trasladar'));
        exit;
    }

    $numeroEscapado = $conexion->real_escape_string($numero);

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

    // La ambulancia no puede tener otro traslado activo (la propia no cuenta)
    $trasladoAsignado = 0;
    if ($ambulancia['id_traslado'] != null) {
        $trasladoAsignado = intval($ambulancia['id_traslado']);
    }

    $libre = $trasladoAsignado == 0
             || $trasladoAsignado == $idTrasladoReferencia
             || $ambulancia['estado'] == null
             || $ambulancia['estado'] == 'Finalizado';

    if ($libre == false) {
        echo json_encode(array('ok' => false, 'error' => 'La ambulancia ya tiene un traslado en curso'));
        exit;
    }

    return array(
        'numero' => $numero,
        'matricula' => $ambulancia['matricula'],
        'origen' => $origen,
        'destino' => $destino,
        'hora_salida' => str_replace('T', ' ', $horaSalida),
        'hora_llegada' => str_replace('T', ' ', $horaLlegada),
        'id_conductor' => $idConductor,
        'elemento_tipo' => $elementoTipo,
        'elemento_descripcion' => $elementoDescripcion,
        'elemento_dato1' => $elementoDato1,
        'elemento_dato2' => $elementoDato2,
        'elemento_dato3' => $elementoDato3,
        'acompanante' => $datosAcompanante,
        'copiloto' => $datosCopiloto
    );
}
