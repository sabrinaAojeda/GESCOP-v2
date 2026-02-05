<?php
// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
include_once $base_path . '/config/database.php';
include_once $base_path . '/models/Personal.php';

$database = new Database();
$db = $database->getConnection();
$personal = new Personal($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $personal->id = $data->id;
    
    // Eliminación lógica (cambiar estado a inactivo)
    if ($personal->eliminar()) {
        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "Personal eliminado exitosamente"));
    } else {
        http_response_code(503);
        echo json_encode(array("success" => false, "message" => "No se pudo eliminar el personal"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "ID requerido"));
}