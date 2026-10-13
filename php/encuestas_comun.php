<?php

// Funciones compartidas por el modulo de encuestas (gestion y respuesta publica).

function obtenerPreguntas($conexion, $id) {
    $preguntas = array();

    $resultado = $conexion->query("SELECT id_pregunta, texto, tipo, opciones, orden
                                   FROM Encuestas_Preguntas WHERE id_encuesta = $id
                                   ORDER BY orden ASC, id_pregunta ASC");

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $fila['id_pregunta'] = intval($fila['id_pregunta']);
            $opcionesJson = $fila['opciones'];
            $fila['opciones'] = array();

            if ($fila['tipo'] == 'multiple' && $opcionesJson != null) {
                $decodificado = json_decode($opcionesJson, true);
                if (is_array($decodificado)) {
                    $fila['opciones'] = $decodificado;
                }
            }

            $preguntas[] = $fila;
        }
    }

    return $preguntas;
}
