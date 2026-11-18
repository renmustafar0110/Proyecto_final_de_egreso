<?php

// verDocumento/verDocumento.php - Redireccion de compatibilidad.
// Los QR impresos antes apuntaban a esta ruta, que ya no contiene el visor.
// Se redirige al visor real conservando el id del QR.

$idQr = isset($_GET['qr']) ? intval($_GET['qr']) : 0;

if ($idQr <= 0) {
    http_response_code(404);
    echo 'QR no válido';
    exit;
}

// La ruta es relativa: funciona aunque cambie el IP o el dominio.
header('Location: ../php/verDocumento.php?qr=' . $idQr);
exit;
