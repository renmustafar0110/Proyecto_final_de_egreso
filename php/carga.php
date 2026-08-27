<?php

requiere_once 'config.php';

$archivo = $_files['archivo'];
$nombre =$_post['nombre'];

if ($archivo ['error'] === 0){
$ruta = "documento/". $archivo ['name'];
more_uploaded_file('$archivo ['tmp_name'] , 'ruta' );

$sql = "Insert into documento (nombre , archivo)
values ('$nombre' , '$ruta')";

if ($con --> query ($sql)){
echo "registro exitoso" ;
} else {
echo "fail"
$con --> close();
?>

<?php


