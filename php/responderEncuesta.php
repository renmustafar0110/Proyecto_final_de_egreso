<?php

require_once 'conexion.php';
require_once 'encuestas_comun.php';

function paginaError($titulo, $mensaje) {
    http_response_code(404);
    ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="../css/responderEncuesta.css">
</head>
<body class="pagina-error">
    <div class="tarjeta-error">
        <div class="error-icono">!</div>
        <h1><?php echo htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8'); ?></h1>
        <p><?php echo htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'); ?></p>
    </div>
</body>
</html>
    <?php
    exit;
}

$id = 0;
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
} else if (isset($_POST['id_encuesta'])) {
    $id = intval($_POST['id_encuesta']);
}

if ($id <= 0) {
    paginaError('Encuesta no disponible', 'El enlace no corresponde a una encuesta válida.');
}

$resultado = $conexion->query("SELECT id_encuesta, titulo, descripcion, estado
                               FROM Encuestas_Formularios WHERE id_encuesta = $id");

if (!$resultado || $resultado->num_rows == 0) {
    paginaError('Encuesta no disponible', 'La encuesta no existe o fue eliminada.');
}

$encuesta = $resultado->fetch_assoc();

if (intval($encuesta['estado']) != 1) {
    paginaError('Encuesta no disponible', 'La encuesta fue desactivada por el personal administrativo.');
}

$preguntas = obtenerPreguntas($conexion, $id);
$enviado = false;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // US-05: guardar respuestas de forma anónima
    $conexion->query("INSERT INTO Encuestas_Respuestas (id_encuesta, fecha_envio) VALUES ($id, NOW())");
    $idRespuesta = $conexion->insert_id;

    foreach ($preguntas as $pregunta) {
        $idPregunta = intval($pregunta['id_pregunta']);
        $campo = 'resp_' . $idPregunta;
        $valor = '';

        if (isset($_POST[$campo])) {
            $valor = trim($_POST[$campo]);
        }

        $valorEscapado = $conexion->real_escape_string($valor);

        $conexion->query("INSERT INTO Encuestas_Respuesta_Detalle (id_respuesta, id_pregunta, valor)
                          VALUES ($idRespuesta, $idPregunta, '$valorEscapado')");
    }

    $enviado = true;
}

$titulo = htmlspecialchars($encuesta['titulo'], ENT_QUOTES, 'UTF-8');
$descripcion = htmlspecialchars($encuesta['descripcion'], ENT_QUOTES, 'UTF-8');

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $titulo; ?> - Hospital de Clínicas</title>
    <link rel="stylesheet" href="../css/responderEncuesta.css">
</head>
<body>
    <header class="enc-header">
        <span class="marca">Hospital de Clínicas</span>
        <span class="categoria-badge">Encuesta</span>
    </header>

    <main class="enc-main">
        <?php if ($enviado) { ?>

            <div class="tarjeta-exito">
                <div class="exito-icono">&#10003;</div>
                <h1>¡Gracias por su respuesta!</h1>
                <p>Su opinión fue registrada correctamente de forma anónima.</p>
            </div>

        <?php } else { ?>

            <h1 class="enc-titulo"><?php echo $titulo; ?></h1>
            <?php if ($descripcion != '') { ?>
                <p class="enc-descripcion"><?php echo $descripcion; ?></p>
            <?php } ?>

            <form method="post" action="responderEncuesta.php?id=<?php echo $id; ?>" class="enc-form">
                <input type="hidden" name="id_encuesta" value="<?php echo $id; ?>">

                <?php $numero = 1; foreach ($preguntas as $pregunta) { ?>
                    <?php
                        $idPregunta = intval($pregunta['id_pregunta']);
                        $texto = htmlspecialchars($pregunta['texto'], ENT_QUOTES, 'UTF-8');
                    ?>
                    <div class="pregunta">
                        <p class="pregunta-texto"><?php echo $numero . '. ' . $texto; ?></p>

                        <?php if ($pregunta['tipo'] == 'multiple') { ?>
                            <?php foreach ($pregunta['opciones'] as $opcion) { ?>
                                <label class="opcion">
                                    <input type="radio" name="resp_<?php echo $idPregunta; ?>"
                                           value="<?php echo htmlspecialchars($opcion, ENT_QUOTES, 'UTF-8'); ?>" required>
                                    <span><?php echo htmlspecialchars($opcion, ENT_QUOTES, 'UTF-8'); ?></span>
                                </label>
                            <?php } ?>

                        <?php } else if ($pregunta['tipo'] == 'escala') { ?>
                            <div class="escala">
                                <?php for ($i = 1; $i <= 5; $i++) { ?>
                                    <label class="escala-opcion">
                                        <input type="radio" name="resp_<?php echo $idPregunta; ?>" value="<?php echo $i; ?>" required>
                                        <span><?php echo $i; ?></span>
                                    </label>
                                <?php } ?>
                            </div>
                            <div class="escala-etiquetas">
                                <span>Nada satisfecho</span>
                                <span>Muy satisfecho</span>
                            </div>

                        <?php } else { ?>
                            <textarea name="resp_<?php echo $idPregunta; ?>" rows="3"
                                      placeholder="Escriba su respuesta..."></textarea>
                        <?php } ?>
                    </div>
                <?php $numero++; } ?>

                <button type="submit" class="btn-enviar">Enviar respuestas</button>
            </form>

        <?php } ?>
    </main>

    <footer class="enc-footer">
        &copy; Hospital de Clínicas
    </footer>
</body>
</html>
