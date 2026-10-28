<?php

require_once 'conexion.php';

header('Content-Type: application/json; charset=utf-8');

$idQr = 0;
if (isset($_GET['qr'])) {
    $idQr = intval($_GET['qr']);
}

if ($idQr <= 0) {
    echo json_encode(array('ok' => false, 'mensaje' => 'QR inválido'));
    exit;
}

$sql = "SELECT q.id_qr, q.url, q.cedula,
               d.titulo_del_documento, d.categoria_del_documento, d.fecha_publicacion, d.archivo, d.estado
        FROM QR q
        LEFT JOIN Documentos d ON d.id_qr = q.id_qr
        WHERE q.id_qr = $idQr
        LIMIT 1";

$resultado = $conexion->query($sql);

if (!$resultado || $resultado->num_rows == 0) {
    echo json_encode(array('ok' => false, 'mensaje' => 'No se encontró información para este QR'));
    exit;
}

$fila = $resultado->fetch_assoc();

echo json_encode(array(
    'ok' => true,
    'qr' => array(
        'id_qr' => intval($fila['id_qr']),
        'url' => $fila['url'],
        'cedula' => $fila['cedula']
    ),
    'documento' => array(
        'titulo' => $fila['titulo_del_documento'],
        'categoria' => $fila['categoria_del_documento'],
        'fecha_publicacion' => $fila['fecha_publicacion'],
        'archivo' => $fila['archivo'],
        'estado' => intval($fila['estado'])
    )
));
