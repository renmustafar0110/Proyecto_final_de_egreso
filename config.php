<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'hospital de clínicas');
define('DB_USER', 'root');
define('DB_PASS', '');
define('BASE_URL', 'http://localhost/hospital');
 
$con = new mysqli (DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($con -> connect_error) {
    die ("ERROR al conectar: "  .  $con -> connect_error);
}