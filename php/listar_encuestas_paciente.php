<?php

// listar_encuestas_paciente.php - Devuelve las encuestas activas para el paciente.
// Se carga la conexion a la base.
require_once 'conexion.php';



// La respuesta sera un arreglo JSON.
header('Content-Type: application/json; charset=utf-8');



// Se consultan las encuestas activas y se devuelven como JSON.
$encuestas = array();



$sql = "SELECT id_encuesta, titulo, descripcion, fecha_creacion
        FROM Encuestas_Formularios
        WHERE estado = 1
        ORDER BY id_encuesta DESC";



$resultado = $conexion->query($sql);



if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $fila['id_encuesta'] = intval($fila['id_encuesta']);
        $encuestas[] = $fila;
    }
}



echo json_encode($encuestas);
