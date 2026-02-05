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

// BACKEND/api/proveedores/create_proveedor.php - CORREGIDO PARA COINCIDIR CON MODELO

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
include_once $base_path . '/config/database.php';
include_once $base_path . '/models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();
$proveedor = new Proveedor($db);

$data = json_decode(file_get_contents("php://input"));

// Validaciones básicas
if (!empty($data->razon_social) && !empty($data->cuit)) {
    // Validar formato CUIT (XX-XXXXXXXX-X)
    if (!preg_match('/^\d{2}-\d{8}-\d{1}$/', $data->cuit)) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Formato de CUIT inválido. Use formato: XX-XXXXXXXX-X"
        ));
        exit();
    }
    
    // Asignar todos los campos según el modelo Proveedor.php
    $proveedor->codigo = $data->codigo ?? '';
    $proveedor->razon_social = $data->razon_social;
    $proveedor->cuit = $data->cuit;
    $proveedor->rubro = $data->rubro ?? '';
    $proveedor->tipo_proveedor = $data->tipo_proveedor ?? 'terciarizado';
    $proveedor->sector_servicio = $data->sector_servicio ?? '';
    $proveedor->servicio_especifico = $data->servicio_especifico ?? $data->servicio ?? '';
    $proveedor->direccion = $data->direccion ?? '';
    $proveedor->localidad = $data->localidad ?? '';
    $proveedor->provincia = $data->provincia ?? 'Buenos Aires';
    $proveedor->telefono = $data->telefono ?? '';
    $proveedor->email = $data->email ?? '';
    $proveedor->contacto_nombre = $data->contacto_nombre ?? '';
    $proveedor->contacto_cargo = $data->contacto_cargo ?? '';
    $proveedor->estado = $data->estado ?? 'Activo';
    $proveedor->seguro_RT = $data->seguro_RT ?? false;
    $proveedor->seguro_vida_personal = $data->seguro_vida_personal ?? $data->seguro_vida ?? false;
    $proveedor->poliza_RT = $data->poliza_RT ?? '';
    $proveedor->vencimiento_poliza_RT = $data->vencimiento_poliza_RT ?? '';
    $proveedor->habilitacion_personal = $data->habilitacion_personal ?? '';
    $proveedor->vencimiento_habilitacion_personal = $data->vencimiento_habilitacion_personal ?? '';
    $proveedor->habilitacion_vehiculo = $data->habilitacion_vehiculo ?? '';
    $proveedor->vencimiento_habilitacion_vehiculo = $data->vencimiento_habilitacion_vehiculo ?? '';
    $proveedor->documentos_cantidad = $data->documentos_cantidad ?? 0;
    $proveedor->proximo_vencimiento = !empty($data->proximo_vencimiento) ? $data->proximo_vencimiento : null;
    $proveedor->frecuencia_renovacion = $data->frecuencia_renovacion ?? 'anual';
    $proveedor->campos_personalizados = $data->campos_personalizados ?? [];
    $proveedor->activo = 1;
    
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
        "message" => "Datos incompletos. Razón social y CUIT son requeridos"
    ));
}
?>
