<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../models/Personal.php';

$database = new Database();
$db = $database->getConnection();
$personal = new Personal($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $personal->id = $data->id;
    
    // Eliminación lógica (cambiar estado a inactivo)
    if ($personal->eliminar()) {
        http_response_code(200);
        echo json_encode(array("message" => "Personal eliminado exitosamente"));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "No se pudo eliminar el personal"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "ID requerido"));
}
?>