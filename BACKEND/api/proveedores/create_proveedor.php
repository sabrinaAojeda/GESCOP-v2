<?php
// BACKEND/api/proveedores/create_proveedor.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();
$proveedor = new Proveedor($db);

$data = json_decode(file_get_contents("php://input"));

// Validaciones básicas
if (
    !empty($data->razon_social) && 
    !empty($data->cuit) && 
    !empty($data->rubro) &&
    !empty($data->codigo)
) {
    // Validar formato CUIT (XX-XXXXXXXX-X)
    if (!preg_match('/^\d{2}-\d{8}-\d{1}$/', $data->cuit)) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Formato de CUIT inválido. Use formato: XX-XXXXXXXX-X"
        ));
        exit();
    }
    
    $proveedor->codigo = $data->codigo;
    $proveedor->razon_social = $data->razon_social;
    $proveedor->cuit = $data->cuit;
    $proveedor->rubro = $data->rubro;
    $proveedor->direccion = $data->direccion ?? '';
    $proveedor->localidad = $data->localidad ?? '';
    $proveedor->provincia = $data->provincia ?? '';
    $proveedor->telefono = $data->telefono ?? '';
    $proveedor->email = $data->email ?? '';
    $proveedor->contacto_nombre = $data->contacto_nombre ?? '';
    $proveedor->contacto_cargo = $data->contacto_cargo ?? '';
    $proveedor->estado = $data->estado ?? 'Activo';
    $proveedor->seguro_RT = $data->seguro_RT ?? false;
    $proveedor->habilitacion_personal = $data->habilitacion_personal ?? '';
    $proveedor->habilitacion_vehiculo = $data->habilitacion_vehiculo ?? '';
    $proveedor->campos_personalizados = $data->campos_personalizados ?? [];
    
    try {
        if ($proveedor->crear()) {
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Proveedor creado exitosamente",
                "id" => $proveedor->id
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "No se pudo crear el proveedor"
            ));
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Datos incompletos. Razón social, CUIT, rubro y código son requeridos"
    ));
}
?>