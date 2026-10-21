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

    // Listado de funcionarios para elegir copiloto
    if ($accion == 'funcionarios') {
        $funcionarios = array();
        $resultado = $conexion->query("SELECT id_funcionario, cedula, nombre, apellido
                                       FROM Funcionarios
                                       ORDER BY apellido, nombre");

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $funcionarios[] = $fila;
            }
        }

        echo json_encode($funcionarios);
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
                       t.elemento_tipo, t.elemento_descripcion, t.id_conductor,
                       c.nombre AS conductor_nombre, c.apellido AS conductor_apellido,
                       a.numero_coche,
                       ac.nombre AS acompanante_nombre, ac.apellido AS acompanante_apellido,
                       ac.cedula AS acompanante_cedula, ac.telefono AS acompanante_telefono,
                       cp.id_funcionario AS copiloto_id_funcionario
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
                elemento_descripcion = '$elementoDescripcionEscapada'
            WHERE id_traslado = $id";

    if (!$conexion->query($sql)) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }

    // El acompañante y el copiloto se reemplazan por completo
    $conexion->query("DELETE FROM Acompanantes WHERE id_traslado = $id");

    if ($datos['acompanante'] !== null) {
        $nombreAcom = $conexion->real_escape_string($datos['acompanante']['nombre']);
        $apellidoAcom = $conexion->real_escape_string($datos['acompanante']['apellido']);
        $cedulaAcom = $conexion->real_escape_string($datos['acompanante']['cedula']);
        $telefonoAcom = $conexion->real_escape_string($datos['acompanante']['telefono']);

        if (!$conexion->query("INSERT INTO Acompanantes (nombre, apellido, cedula_acom, telefono, id_traslado)
                               VALUES ('$nombreAcom', '$apellidoAcom', '$cedulaAcom', '$telefonoAcom', $id)")) {
            echo json_encode(array('ok' => false, 'error' => $conexion->error));
            exit;
        }
    }

    $conexion->query("DELETE FROM Copilotos WHERE id_traslado = $id");

    if ($datos['copiloto'] !== null) {
        $nombreCop = $conexion->real_escape_string($datos['copiloto']['nombre']);
        $apellidoCop = $conexion->real_escape_string($datos['copiloto']['apellido']);
        $cedulaCop = $conexion->real_escape_string($datos['copiloto']['cedula']);

        if (!$conexion->query("INSERT INTO Copilotos (id_funcionario, nombre_copiloto, apellido_copiloto, cedula, id_traslado)
                               VALUES ({$datos['copiloto']['id_funcionario']}, '$nombreCop', '$apellidoCop', '$cedulaCop', $id)")) {
            echo json_encode(array('ok' => false, 'error' => $conexion->error));
            exit;
        }
    }

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

if ($datos['hora_llegada'] == '') {
    $valorLlegada = 'NULL';
} else {
    $valorLlegada = "'" . $conexion->real_escape_string($datos['hora_llegada']) . "'";
}

$sql = "INSERT INTO Traslados (hora_salida, hora_llegada, origen, destino, estado,
                              id_conductor, elemento_tipo, elemento_descripcion)
        VALUES ('$horaSalidaEscapada', $valorLlegada, '$origenEscapado', '$destinoEscapado', 'Pendiente',
                {$datos['id_conductor']}, '$elementoTipoEscapado', '$elementoDescripcionEscapada')";

if (!$conexion->query($sql)) {
    echo json_encode(array('ok' => false, 'error' => $conexion->error));
    exit;
}

$idTraslado = ultimoIdInsertado($conexion);

// US-08: registrar el estado inicial en el historial
$conexion->query("INSERT INTO Traslado_Estados (id_traslado, estado, fecha_cambio)
                  VALUES ($idTraslado, 'Pendiente', NOW())");

// Registrar acompañante si se completó algún campo
if ($datos['acompanante'] !== null) {
    $nombreAcom = $conexion->real_escape_string($datos['acompanante']['nombre']);
    $apellidoAcom = $conexion->real_escape_string($datos['acompanante']['apellido']);
    $cedulaAcom = $conexion->real_escape_string($datos['acompanante']['cedula']);
    $telefonoAcom = $conexion->real_escape_string($datos['acompanante']['telefono']);

    if (!$conexion->query("INSERT INTO Acompanantes (nombre, apellido, cedula_acom, telefono, id_traslado)
                           VALUES ('$nombreAcom', '$apellidoAcom', '$cedulaAcom', '$telefonoAcom', $idTraslado)")) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }
}

// Registrar copiloto si se eligió un funcionario
if ($datos['copiloto'] !== null) {
    $nombreCop = $conexion->real_escape_string($datos['copiloto']['nombre']);
    $apellidoCop = $conexion->real_escape_string($datos['copiloto']['apellido']);
    $cedulaCop = $conexion->real_escape_string($datos['copiloto']['cedula']);

    if (!$conexion->query("INSERT INTO Copilotos (id_funcionario, nombre_copiloto, apellido_copiloto, cedula, id_traslado)
                           VALUES ({$datos['copiloto']['id_funcionario']}, '$nombreCop', '$apellidoCop', '$cedulaCop', $idTraslado)")) {
        echo json_encode(array('ok' => false, 'error' => $conexion->error));
        exit;
    }
}

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

// Lee y valida los datos del formulario de traslado (US-07).
// $idTrasladoReferencia es el traslado que se está editando (0 al crear):
// así la ambulancia que ya tiene asignada no se considera ocupada.
// Si algún dato falta o no es válido, responde el error y detiene la ejecución.
function leerDatosTraslado($conexion, $idTrasladoReferencia) {

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

    $acompananteNombre = '';
    if (isset($_POST['acompanante_nombre'])) {
        $acompananteNombre = trim($_POST['acompanante_nombre']);
    }

    $acompananteApellido = '';
    if (isset($_POST['acompanante_apellido'])) {
        $acompananteApellido = trim($_POST['acompanante_apellido']);
    }

    $acompananteCedula = '';
    if (isset($_POST['acompanante_cedula'])) {
        $acompananteCedula = trim($_POST['acompanante_cedula']);
    }

    $acompananteTelefono = '';
    if (isset($_POST['acompanante_telefono'])) {
        $acompananteTelefono = trim($_POST['acompanante_telefono']);
    }

    $idFuncionarioCopiloto = 0;
    if (isset($_POST['copiloto_id_funcionario'])) {
        $idFuncionarioCopiloto = intval($_POST['copiloto_id_funcionario']);
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

    // Validación del copiloto (debe ser un funcionario y no la misma persona que el conductor)
    $datosCopiloto = null;
    $cedulaConductor = '';

    $resultadoConductor = $conexion->query("SELECT cedula FROM Conductores WHERE id_conductor = $idConductor");

    if ($resultadoConductor && $resultadoConductor->num_rows > 0) {
        $filaConductor = $resultadoConductor->fetch_assoc();
        $cedulaConductor = $filaConductor['cedula'];
    }

    if ($idFuncionarioCopiloto > 0) {
        $resultadoCopiloto = $conexion->query("SELECT nombre, apellido, cedula
                                               FROM Funcionarios
                                               WHERE id_funcionario = $idFuncionarioCopiloto");

        if (!$resultadoCopiloto || $resultadoCopiloto->num_rows == 0) {
            echo json_encode(array('ok' => false, 'error' => 'El funcionario seleccionado como copiloto no existe'));
            exit;
        }

        $filaCopiloto = $resultadoCopiloto->fetch_assoc();

        if ($cedulaConductor != '' && $filaCopiloto['cedula'] == $cedulaConductor) {
            echo json_encode(array('ok' => false, 'error' => 'El copiloto no puede ser la misma persona que el conductor'));
            exit;
        }

        $datosCopiloto = array(
            'id_funcionario' => $idFuncionarioCopiloto,
            'nombre' => $filaCopiloto['nombre'],
            'apellido' => $filaCopiloto['apellido'],
            'cedula' => $filaCopiloto['cedula']
        );
    }

    if ($elementoDescripcion == '') {
        echo json_encode(array('ok' => false, 'error' => 'Ingrese el paciente o elemento a trasladar'));
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

    $acompananteDatos = null;

    if ($acompananteNombre != '' || $acompananteApellido != '' || $acompananteCedula != '' || $acompananteTelefono != '') {
        $acompananteDatos = array(
            'nombre' => $acompananteNombre,
            'apellido' => $acompananteApellido,
            'cedula' => $acompananteCedula,
            'telefono' => $acompananteTelefono
        );
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
        'acompanante' => $acompananteDatos,
        'copiloto' => $datosCopiloto
    );
}
