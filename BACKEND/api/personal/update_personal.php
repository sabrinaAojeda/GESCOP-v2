<?php
// BACKEND/api/personal/update_personal.php - CORREGIDO PARA COINCIDIR CON MODELO

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

if (!empty($data->id) && !empty($data->nombre) && !empty($data->apellido)) {
    $personal->id = $data->id;
    $personal->legajo = $data->legajo ?? '';
    $personal->nombre = $data->nombre;
    $personal->apellido = $data->apellido;
    $personal->dni = $data->dni;
    $personal->cuil = $data->cuil ?? '';
    $personal->telefono = $data->telefono ?? '';
    $personal->email = $data->email ?? '';
    $personal->correo_corporativo = $data->correo_corporativo ?? $data->email_corporativo ?? '';
    $personal->puesto = $data->puesto ?? $data->cargo ?? '';
    $personal->sector = $data->sector ?? '';
    $personal->rol_sistema = $data->rol_sistema ?? $data->rol ?? 'usuario';
    $personal->fecha_ingreso = $data->fecha_ingreso ?? '';
    $personal->fecha_nacimiento = $data->fecha_nacimiento ?? '';
    $personal->direccion = $data->direccion ?? '';
    $personal->tipo_contrato = $data->tipo_contrato ?? 'Planta Permanente';
    $personal->estado_licencia = $data->estado_licencia ?? $data->estado ?? '';
    $personal->clase_licencia = $data->clase_licencia ?? $data->categoria_licencia ?? '';
    $personal->vencimiento_licencia = $data->vencimiento_licencia ?? '';
    $personal->certificados = $data->certificados ?? $data->certificados_capacitacion ?? '';
    $personal->carnet_cargas_peligrosas = $data->carnet_cargas_peligrosas ?? '';
    $personal->vencimiento_carnet = $data->vencimiento_carnet ?? '';
    $personal->capacitaciones = $data->capacitaciones ?? '';
    $personal->observaciones = $data->observaciones ?? '';
    $personal->activo = $data->estado === 'Activo' ? 1 : ($data->activo ?? 1);

    try {
        if ($personal->actualizar()) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Personal actualizado exitosamente"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "No se pudo actualizar el personal"
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
        "message" => "Datos incompletos. ID, nombre y apellido son requeridos"
    ));
}
