<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';
require_once 'sesion.php';
require_once 'encuestas_comun.php';

requiereSesion(array('admin_documentos', 'super_admin'));

$tiposValidos = array('multiple', 'escala', 'texto');

function responder($ok, $datos = array()) {
    echo json_encode(array_merge(array('ok' => $ok), $datos));
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------
if ($metodo == 'GET') {

    $accion = 'listar';
    if (isset($_GET['accion']) && $_GET['accion'] != '') {
        $accion = $_GET['accion'];
    }

    // US-04: listado de encuestas con su cantidad de preguntas y respuestas
    if ($accion == 'listar') {
        $encuestas = array();

        $sql = "SELECT e.id_encuesta, e.titulo, e.descripcion, e.estado, e.fecha_creacion,
                       (SELECT COUNT(*) FROM Encuestas_Preguntas p WHERE p.id_encuesta = e.id_encuesta) AS total_preguntas,
                       (SELECT COUNT(*) FROM Encuestas_Respuestas r WHERE r.id_encuesta = e.id_encuesta) AS total_respuestas
                FROM Encuestas_Formularios e
                ORDER BY e.id_encuesta DESC";

        $resultado = $conexion->query($sql);

        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $fila['id_encuesta'] = intval($fila['id_encuesta']);
                $fila['estado'] = intval($fila['estado']);
                $fila['total_preguntas'] = intval($fila['total_preguntas']);
                $fila['total_respuestas'] = intval($fila['total_respuestas']);
                $encuestas[] = $fila;
            }
        }

        echo json_encode($encuestas);
        exit;
    }

    // US-04: detalle de una encuesta con sus preguntas
    if ($accion == 'detalle') {

        $id = 0;
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
        }

        if ($id <= 0) {
            responder(false, array('mensaje' => 'Encuesta no válida'));
        }

        $encuesta = obtenerEncuesta($conexion, $id);

        if ($encuesta === null) {
            responder(false, array('mensaje' => 'La encuesta no existe'));
        }

        $encuesta['preguntas'] = obtenerPreguntas($conexion, $id);

        responder(true, array('encuesta' => $encuesta));
    }

    // US-06: resultados agregados para el dashboard
    if ($accion == 'resultados') {

        $id = 0;
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
        }

        if ($id <= 0) {
            responder(false, array('mensaje' => 'Encuesta no válida'));
        }

        $encuesta = obtenerEncuesta($conexion, $id);

        if ($encuesta === null) {
            responder(false, array('mensaje' => 'La encuesta no existe'));
        }

        $totalRespuestas = 0;
        $resultadoTotal = $conexion->query("SELECT COUNT(*) AS total FROM Encuestas_Respuestas WHERE id_encuesta = $id");

        if ($resultadoTotal && $filaTotal = $resultadoTotal->fetch_assoc()) {
            $totalRespuestas = intval($filaTotal['total']);
        }

        $preguntas = obtenerPreguntas($conexion, $id);

        foreach ($preguntas as $indice => $pregunta) {
            $idPregunta = intval($pregunta['id_pregunta']);

            if ($pregunta['tipo'] == 'texto') {
                $valores = array();
                $res = $conexion->query("SELECT valor FROM Encuestas_Respuesta_Detalle
                                         WHERE id_pregunta = $idPregunta AND valor IS NOT NULL AND valor <> ''
                                         ORDER BY id_detalle DESC");
                if ($res) {
                    while ($fila = $res->fetch_assoc()) {
                        $valores[] = $fila['valor'];
                    }
                }
                $preguntas[$indice]['respuestas_texto'] = $valores;
                continue;
            }

            $conteos = array();
            $res = $conexion->query("SELECT valor, COUNT(*) AS total FROM Encuestas_Respuesta_Detalle
                                     WHERE id_pregunta = $idPregunta
                                     GROUP BY valor");
            if ($res) {
                while ($fila = $res->fetch_assoc()) {
                    $conteos[$fila['valor']] = intval($fila['total']);
                }
            }

            $categorias = array();

            if ($pregunta['tipo'] == 'escala') {
                for ($i = 1; $i <= 5; $i++) {
                    $categorias[] = (string) $i;
                }
            } else {
                $categorias = $pregunta['opciones'];
            }

            $datos = array();
            foreach ($categorias as $categoria) {
                $cantidad = 0;
                if (isset($conteos[$categoria])) {
                    $cantidad = $conteos[$categoria];
                }
                $datos[] = array('etiqueta' => $categoria, 'total' => $cantidad);
            }

            $preguntas[$indice]['resultados'] = $datos;
        }

        responder(true, array(
            'encuesta' => $encuesta,
            'total_respuestas' => $totalRespuestas,
            'preguntas' => $preguntas
        ));
    }

    responder(false, array('mensaje' => 'Acción no reconocida'));
}

// ---------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------
if ($metodo != 'POST') {
    responder(false, array('mensaje' => 'Método no permitido'));
}

$accion = '';
if (isset($_POST['accion'])) {
    $accion = $_POST['accion'];
}

// US-04: crear encuesta con preguntas personalizables
if ($accion == 'crear') {

    $datos = leerEncuestaValidada($tiposValidos);

    $tituloEscapado = $conexion->real_escape_string($datos['titulo']);
    $descripcionEscapada = $conexion->real_escape_string($datos['descripcion']);

    $sql = "INSERT INTO Encuestas_Formularios (titulo, descripcion, estado, fecha_creacion)
            VALUES ('$tituloEscapado', '$descripcionEscapada', 1, NOW())";

    if (!$conexion->query($sql)) {
        responder(false, array('mensaje' => 'Falló el registro: ' . $conexion->error));
    }

    $idEncuesta = ultimoIdInsertado($conexion);
    $orden = 0;

    foreach ($datos['preguntas'] as $pregunta) {
        $texto = $conexion->real_escape_string(trim($pregunta['texto']));
        $entidadTipo = $conexion->real_escape_string($pregunta['tipo']);
        $opcionesJson = opcionesDePregunta($conexion, $pregunta);

        $sqlPregunta = "INSERT INTO Encuestas_Preguntas (id_encuesta, texto, tipo, opciones, orden)
                        VALUES ($idEncuesta, '$texto', '$entidadTipo', $opcionesJson, $orden)";

        if (!$conexion->query($sqlPregunta)) {
            responder(false, array('mensaje' => 'Falló el registro de una pregunta: ' . $conexion->error));
        }

        $orden++;
    }

    responder(true, array('mensaje' => 'Encuesta creada', 'id_encuesta' => $idEncuesta));
}

// US-04: editar una encuesta existente (título, descripción y preguntas).
// Las preguntas que conservan su id se actualizan, las nuevas se agregan
// y las que desaparecen del formulario se eliminan junto a sus respuestas.
if ($accion == 'editar') {

    $id = 0;
    if (isset($_POST['id_encuesta'])) {
        $id = intval($_POST['id_encuesta']);
    }

    if ($id <= 0) {
        responder(false, array('mensaje' => 'Encuesta no válida'));
    }

    $encuestaExistente = obtenerEncuesta($conexion, $id);

    if ($encuestaExistente === null) {
        responder(false, array('mensaje' => 'La encuesta no existe'));
    }

    $datos = leerEncuestaValidada($tiposValidos);

    $tituloEscapado = $conexion->real_escape_string($datos['titulo']);
    $descripcionEscapada = $conexion->real_escape_string($datos['descripcion']);

    $conexion->begin_transaction();

    if (!$conexion->query("UPDATE Encuestas_Formularios
                           SET titulo = '$tituloEscapado', descripcion = '$descripcionEscapada'
                           WHERE id_encuesta = $id")) {
        responder(false, array('mensaje' => 'Falló la actualización: ' . $conexion->error));
    }

    $existentes = array();
    $resultadoExistente = $conexion->query("SELECT id_pregunta FROM Encuestas_Preguntas
                                            WHERE id_encuesta = $id");

    if ($resultadoExistente) {
        while ($fila = $resultadoExistente->fetch_assoc()) {
            $existentes[] = intval($fila['id_pregunta']);
        }
    }

    $conservadas = array();
    $orden = 0;

    foreach ($datos['preguntas'] as $pregunta) {
        $texto = $conexion->real_escape_string(trim($pregunta['texto']));
        $entidadTipo = $conexion->real_escape_string($pregunta['tipo']);
        $opcionesJson = opcionesDePregunta($conexion, $pregunta);

        $idPregunta = 0;
        if (isset($pregunta['id_pregunta'])) {
            $idPregunta = intval($pregunta['id_pregunta']);
        }

        if ($idPregunta > 0 && in_array($idPregunta, $existentes, true)) {
            $sqlPregunta = "UPDATE Encuestas_Preguntas
                            SET texto = '$texto', tipo = '$entidadTipo', opciones = $opcionesJson, orden = $orden
                            WHERE id_pregunta = $idPregunta AND id_encuesta = $id";

            if (!$conexion->query($sqlPregunta)) {
                responder(false, array('mensaje' => 'Falló la actualización de una pregunta: ' . $conexion->error));
            }

            $conservadas[] = $idPregunta;
        } else {
            $sqlPregunta = "INSERT INTO Encuestas_Preguntas (id_encuesta, texto, tipo, opciones, orden)
                            VALUES ($id, '$texto', '$entidadTipo', $opcionesJson, $orden)";

            if (!$conexion->query($sqlPregunta)) {
                responder(false, array('mensaje' => 'Falló el registro de una pregunta: ' . $conexion->error));
            }
        }

        $orden++;
    }

    $eliminadas = array();

    foreach ($existentes as $idExistente) {
        if (in_array($idExistente, $conservadas, true) == false) {
            $eliminadas[] = $idExistente;
        }
    }

    if (count($eliminadas) > 0) {
        $listaEliminadas = implode(', ', $eliminadas);

        // Primero se quitan las respuestas que dependen de esas preguntas
        $conexion->query("DELETE FROM Encuestas_Respuesta_Detalle
                          WHERE id_pregunta IN ($listaEliminadas)");

        if (!$conexion->query("DELETE FROM Encuestas_Preguntas
                               WHERE id_pregunta IN ($listaEliminadas) AND id_encuesta = $id")) {
            responder(false, array('mensaje' => 'Falló la eliminación de una pregunta: ' . $conexion->error));
        }
    }

    $conexion->commit();

    responder(true, array('mensaje' => 'Encuesta actualizada', 'id_encuesta' => $id));
}

// US-04: activar / desactivar encuesta (el QR deja de funcionar al desactivar)
if ($accion == 'estado') {

    $id = 0;
    if (isset($_POST['id_encuesta'])) {
        $id = intval($_POST['id_encuesta']);
    }

    $estado = 0;
    if (isset($_POST['estado']) && intval($_POST['estado']) == 1) {
        $estado = 1;
    }

    if ($id <= 0) {
        responder(false, array('mensaje' => 'Encuesta no válida'));
    }

    if ($conexion->query("UPDATE Encuestas_Formularios SET estado = $estado WHERE id_encuesta = $id")) {
        if ($estado == 1) {
            responder(true, array('mensaje' => 'Encuesta activada'));
        }
        responder(true, array('mensaje' => 'Encuesta desactivada'));
    }

    responder(false, array('mensaje' => 'Falló el cambio de estado: ' . $conexion->error));
}

// US-04: eliminar encuesta
if ($accion == 'eliminar') {

    $id = 0;
    if (isset($_POST['id_encuesta'])) {
        $id = intval($_POST['id_encuesta']);
    }

    if ($id <= 0) {
        responder(false, array('mensaje' => 'Encuesta no válida'));
    }

    if ($conexion->query("DELETE FROM Encuestas_Formularios WHERE id_encuesta = $id")) {
        responder(true, array('mensaje' => 'Encuesta eliminada'));
    }

    responder(false, array('mensaje' => 'Falló la eliminación: ' . $conexion->error));
}

responder(false, array('mensaje' => 'Acción no reconocida'));

// ---------------------------------------------------------------------
// Funciones auxiliares
// ---------------------------------------------------------------------

// Lee y valida los datos enviados por el formulario de encuesta.
// Si algo falta o no es válido responde el error y detiene la ejecución.
function leerEncuestaValidada($tiposValidos) {
    $titulo = '';
    if (isset($_POST['titulo'])) {
        $titulo = trim($_POST['titulo']);
    }

    $descripcion = '';
    if (isset($_POST['descripcion'])) {
        $descripcion = trim($_POST['descripcion']);
    }

    if ($titulo == '') {
        responder(false, array('mensaje' => 'Ingrese el título de la encuesta'));
    }

    $preguntas = array();
    if (isset($_POST['preguntas'])) {
        $decodificado = json_decode($_POST['preguntas'], true);
        if (is_array($decodificado)) {
            $preguntas = $decodificado;
        }
    }

    if (count($preguntas) == 0) {
        responder(false, array('mensaje' => 'Agregue al menos una pregunta'));
    }

    foreach ($preguntas as $pregunta) {
        $texto = isset($pregunta['texto']) ? trim($pregunta['texto']) : '';
        $tipo = isset($pregunta['tipo']) ? $pregunta['tipo'] : '';

        if ($texto == '') {
            responder(false, array('mensaje' => 'Todas las preguntas deben tener un enunciado'));
        }

        if (!in_array($tipo, $tiposValidos, true)) {
            responder(false, array('mensaje' => 'Tipo de pregunta no válido'));
        }

        if ($tipo == 'multiple') {
            $opciones = isset($pregunta['opciones']) && is_array($pregunta['opciones']) ? $pregunta['opciones'] : array();
            $limpias = array();
            foreach ($opciones as $opcion) {
                $opcion = trim($opcion);
                if ($opcion != '') {
                    $limpias[] = $opcion;
                }
            }
            if (count($limpias) < 2) {
                responder(false, array('mensaje' => 'Las preguntas de opción múltiple necesitan al menos 2 opciones'));
            }
        }
    }

    return array('titulo' => $titulo, 'descripcion' => $descripcion, 'preguntas' => $preguntas);
}

// Devuelve la lista de opciones en JSON listo para la consulta,
// o NULL cuando la pregunta no es de opción múltiple.
function opcionesDePregunta($conexion, $pregunta) {
    if ($pregunta['tipo'] != 'multiple') {
        return 'NULL';
    }

    $limpias = array();
    foreach ($pregunta['opciones'] as $opcion) {
        $opcion = trim($opcion);
        if ($opcion != '') {
            $limpias[] = $opcion;
        }
    }

    $json = $conexion->real_escape_string(json_encode($limpias, JSON_UNESCAPED_UNICODE));

    return "'" . $json . "'";
}

function obtenerEncuesta($conexion, $id) {
    $resultado = $conexion->query("SELECT id_encuesta, titulo, descripcion, estado, fecha_creacion
                                   FROM Encuestas_Formularios WHERE id_encuesta = $id");

    if (!$resultado || $resultado->num_rows == 0) {
        return null;
    }

    $encuesta = $resultado->fetch_assoc();
    $encuesta['id_encuesta'] = intval($encuesta['id_encuesta']);
    $encuesta['estado'] = intval($encuesta['estado']);

    return $encuesta;
}
