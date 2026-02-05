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

// BACKEND/api/proveedores/update_proveedor.php - CORREGIDO PARA COINCIDIR CON MODELO

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();
$proveedor = new Proveedor($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $proveedor->id = $data->id;
    
    if (!$proveedor->leerUno()) {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Proveedor no encontrado"
        ));
        exit();
    }
    
    // Actualizar todos los campos según el modelo Proveedor.php
    $proveedor->codigo = $data->codigo ?? $proveedor->codigo;
    $proveedor->razon_social = $data->razon_social ?? $proveedor->razon_social;
    $proveedor->cuit = $data->cuit ?? $proveedor->cuit;
    $proveedor->rubro = $data->rubro ?? $proveedor->rubro;
    $proveedor->tipo_proveedor = $data->tipo_proveedor ?? $proveedor->tipo_proveedor;
    $proveedor->sector_servicio = $data->sector_servicio ?? $proveedor->sector_servicio;
    $proveedor->servicio_especifico = $data->servicio_especifico ?? $data->servicio ?? $proveedor->servicio_especifico;
    $proveedor->direccion = $data->direccion ?? $proveedor->direccion;
    $proveedor->localidad = $data->localidad ?? $proveedor->localidad;
    $proveedor->provincia = $data->provincia ?? $proveedor->provincia;
    $proveedor->telefono = $data->telefono ?? $proveedor->telefono;
    $proveedor->email = $data->email ?? $proveedor->email;
    $proveedor->contacto_nombre = $data->contacto_nombre ?? $proveedor->contacto_nombre;
    $proveedor->contacto_cargo = $data->contacto_cargo ?? $proveedor->contacto_cargo;
    $proveedor->estado = $data->estado ?? $proveedor->estado;
    $proveedor->seguro_RT = $data->seguro_RT ?? $proveedor->seguro_RT;
    $proveedor->seguro_vida_personal = $data->seguro_vida_personal ?? $data->seguro_vida ?? $proveedor->seguro_vida_personal;
    $proveedor->poliza_RT = $data->poliza_RT ?? $proveedor->poliza_RT;
    $proveedor->vencimiento_poliza_RT = $data->vencimiento_poliza_RT ?? $proveedor->vencimiento_poliza_RT;
    $proveedor->habilitacion_personal = $data->habilitacion_personal ?? $proveedor->habilitacion_personal;
    $proveedor->vencimiento_habilitacion_personal = $data->vencimiento_habilitacion_personal ?? $proveedor->vencimiento_habilitacion_personal;
    $proveedor->habilitacion_vehiculo = $data->habilitacion_vehiculo ?? $proveedor->habilitacion_vehiculo;
    $proveedor->vencimiento_habilitacion_vehiculo = $data->vencimiento_habilitacion_vehiculo ?? $proveedor->vencimiento_habilitacion_vehiculo;
    $proveedor->documentos_cantidad = $data->documentos_cantidad ?? $proveedor->documentos_cantidad;
    $proveedor->proximo_vencimiento = $data->proximo_vencimiento ?? $proveedor->proximo_vencimiento;
    $proveedor->frecuencia_renovacion = $data->frecuencia_renovacion ?? $proveedor->frecuencia_renovacion;
    $proveedor->observaciones = $data->observaciones ?? $proveedor->observaciones;
    $proveedor->campos_personalizados = $data->campos_personalizados ?? $proveedor->campos_personalizados;
    $proveedor->activo = $data->estado === 'Activo' ? 1 : ($data->activo ?? $proveedor->activo);
    
    try {
        if ($proveedor->actualizar()) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Proveedor actualizado exitosamente"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "No se pudo actualizar el proveedor"
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
        "message" => "Datos incompletos. ID es requerido"
    ));
}
?>
