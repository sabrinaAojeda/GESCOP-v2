<?php
// BACKEND/api/proveedores/delete_proveedor.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();
$proveedor = new Proveedor($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $proveedor->id = $data->id;
    
    if ($proveedor->eliminar()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Proveedor eliminado exitosamente"
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "No se pudo eliminar el proveedor"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "ID requerido"
    ));
}
?>