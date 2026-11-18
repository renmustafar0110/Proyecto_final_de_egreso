<?php

$idQr = isset($_GET['qr']) ? intval($_GET['qr']) : 0;

if ($idQr <= 0) {
    http_response_code(404);
    echo 'QR no válido';
    exit;
}

header('Location: ../php/verDocumento.php?qr=' . $idQr);
exit;
