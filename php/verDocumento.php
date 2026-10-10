<?php

require_once 'conexion.php';

function responderNoDisponible() {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento no disponible</title>
    <link rel="stylesheet" href="../css/verDocumento.css">
</head>
<body class="pagina-error">
    <div class="tarjeta-error">
        <div class="error-icono">!</div>
        <h1>Documento no disponible</h1>
        <p>El documento no existe o fue desactivado por el personal administrativo.</p>
    </div>
</body>
</html>
    <?php
    exit;
}

function etiquetaCategoria($categoria) {
    $etiquetas = array(
        'informacion_general' => 'Información general',
        'indicaciones' => 'Indicaciones médicas',
        'estudios' => 'Estudios imagenológicos',
        'enfermeria' => 'Enfermería',
        'encuestas' => 'Encuestas'
    );

    if (isset($etiquetas[$categoria])) {
        return $etiquetas[$categoria];
    }

    return 'Documento';
}

function formatearFecha($fecha) {
    $partes = explode('-', $fecha);

    if (count($partes) == 3) {
        return $partes[2] . '/' . $partes[1] . '/' . $partes[0];
    }

    return $fecha;
}

function obtenerExtension($nombre) {
    $partes = explode('.', $nombre);

    if (count($partes) > 1) {
        return strtolower($partes[count($partes) - 1]);
    }

    return '';
}

function esImagen($extension) {
    $imagenes = array('jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp');
    return in_array($extension, $imagenes, true);
}

function servirArchivo($rutaCompleta, $nombre) {
    $tipo = 'application/octet-stream';

    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detectado = $finfo->file($rutaCompleta);

        if ($detectado) {
            $tipo = $detectado;
        }
    }

    header('Content-Type: ' . $tipo);
    header('Content-Disposition: inline; filename="' . $nombre . '"');
    header('Content-Length: ' . filesize($rutaCompleta));

    readfile($rutaCompleta);
    exit;
}

$archivo = '';

if (isset($_GET['archivo'])) {
    $archivo = basename(trim($_GET['archivo']));
}

if ($archivo == '') {
    responderNoDisponible();
}

$rutaBD = $conexion->real_escape_string('Documento/' . $archivo);

$sql = "SELECT titulo_del_documento, categoria_del_documento, fecha_publicacion, estado
        FROM Documentos WHERE archivo = '$rutaBD'";
$resultado = $conexion->query($sql);

if (!$resultado || $resultado->num_rows == 0) {
    responderNoDisponible();
}

$documento = $resultado->fetch_assoc();

if (intval($documento['estado']) != 1) {
    responderNoDisponible();
}

$rutaCompleta = __DIR__ . '/Documento/' . $archivo;

if (!is_file($rutaCompleta)) {
    responderNoDisponible();
}

if (isset($_GET['raw'])) {
    servirArchivo($rutaCompleta, $archivo);
}

$extension = obtenerExtension($archivo);
$titulo = htmlspecialchars($documento['titulo_del_documento'], ENT_QUOTES, 'UTF-8');
$categoria = etiquetaCategoria($documento['categoria_del_documento']);
$fecha = formatearFecha($documento['fecha_publicacion']);
$urlArchivo = 'verDocumento.php?archivo=' . urlencode($archivo) . '&amp;raw=1';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $titulo; ?> - Hospital de Clínicas</title>
    <link rel="stylesheet" href="../css/verDocumento.css">
</head>
<body>
    <header class="visor-header">
        <span class="marca">Hospital de Clínicas</span>
        <span class="categoria-badge"><?php echo $categoria; ?></span>
    </header>

    <main class="visor-main">
        <h1 class="titulo-documento"><?php echo $titulo; ?></h1>
        <p class="meta-documento">Publicado el <?php echo $fecha; ?></p>

        <?php if ($extension == 'pdf') { ?>
            <div class="acciones">
                <a class="btn-abrir" href="<?php echo $urlArchivo; ?>" target="_blank" rel="noopener">Abrir documento</a>
                <a class="btn-descargar" href="<?php echo $urlArchivo; ?>" download>Descargar</a>
            </div>
            <div class="contenedor-pdf">
                <iframe src="<?php echo $urlArchivo; ?>" title="Documento PDF"></iframe>
            </div>
        <?php } else if (esImagen($extension)) { ?>
            <div class="acciones">
                <a class="btn-descargar" href="<?php echo $urlArchivo; ?>" download>Descargar imagen</a>
            </div>
            <img class="documento-imagen" src="<?php echo $urlArchivo; ?>" alt="<?php echo $titulo; ?>">
        <?php } else { ?>
            <div class="tarjeta-archivo">
                <p>Este formato no se puede previsualizar en el navegador. Abrí o descargá el documento para verlo.</p>
                <a class="btn-abrir" href="<?php echo $urlArchivo; ?>" download>Abrir / Descargar</a>
            </div>
        <?php } ?>
    </main>

    <footer class="visor-footer">
        &copy; Hospital de Clínicas
    </footer>
</body>
</html>
