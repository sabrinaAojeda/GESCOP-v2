<?php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Usuario.php';

$database = new Database();
$db = $database->getConnection();

$usuario = new Usuario($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->email) &&
    !empty($data->password)
){
    $usuario->email = $data->email;
    $usuario->password = $data->password;

    if($usuario->login()){
        http_response_code(200);
        echo json_encode(array(
            "message" => "Login exitoso",
            "id" => $usuario->id,
            "nombre" => $usuario->nombre
        ));
    } else{
        http_response_code(401);
        echo json_encode(array("message" => "Credenciales incorrectas"));
    }
} else{
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos"));
}
?>