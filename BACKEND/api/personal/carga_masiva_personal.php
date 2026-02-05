<?php
// BACKEND/api/personal/carga_masiva_personal.php - ENDPOINT PARA CARGA MASIVA DE PERSONAL

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

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validar que se recibieron datos
if (!$data || !is_array($data) || count($data) === 0) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "No se recibieron datos para procesar"
    ));
    exit;
}

$creados = 0;
$errores = array();

foreach ($data as $index => $item) {
    try {
        // Validar campos requeridos mínimos
        if (empty($item['nombre']) || empty($item['apellido']) || empty($item['dni'])) {
            $errores[] = "Registro " . ($index + 1) . ": Faltan campos requeridos (nombre, apellido, DNI)";
            continue;
        }
        
        // Asignar campos
        $personal->legajo = $item['legajo'] ?? '';
        $personal->nombre = $item['nombre'];
        $personal->apellido = $item['apellido'];
        $personal->dni = $item['dni'];
        $personal->cuil = $item['cuil'] ?? '';
        $personal->telefono = $item['telefono'] ?? '';
        $personal->email = $item['email'] ?? '';
        $personal->correo_corporativo = $item['correo_corporativo'] ?? $item['email_corporativo'] ?? '';
        $personal->puesto = $item['puesto'] ?? $item['cargo'] ?? '';
        $personal->sector = $item['sector'] ?? '';
        $personal->rol_sistema = $item['rol_sistema'] ?? $item['rol'] ?? 'usuario';
        $personal->fecha_ingreso = $item['fecha_ingreso'] ?? date('Y-m-d');
        $personal->fecha_nacimiento = $item['fecha_nacimiento'] ?? '';
        $personal->direccion = $item['direccion'] ?? '';
        $personal->tipo_contrato = $item['tipo_contrato'] ?? 'Planta Permanente';
        $personal->estado_licencia = $item['estado_licencia'] ?? '';
        $personal->clase_licencia = $item['clase_licencia'] ?? $item['categoria_licencia'] ?? '';
        $personal->vencimiento_licencia = $item['vencimiento_licencia'] ?? '';
        $personal->certificados = $item['certificados'] ?? $item['certificados_capacitacion'] ?? '';
        $personal->carnet_cargas_peligrosas = $item['carnet_cargas_peligrosas'] ?? '';
        $personal->vencimiento_carnet = $item['vencimiento_carnet'] ?? '';
        $personal->capacitaciones = $item['capacitaciones'] ?? '';
        $personal->observaciones = $item['observaciones'] ?? '';
        $personal->activo = $item['activo'] ?? 1;
        
        // Intentar crear
        if ($personal->crear()) {
            $creados++;
        } else {
            $errores[] = "Registro " . ($index + 1) . ": No se pudo crear (posiblemente DNI duplicado)";
        }
    } catch (Exception $e) {
        $errores[] = "Registro " . ($index + 1) . ": " . $e->getMessage();
    }
}

if ($creados > 0) {
    http_response_code(201);
    echo json_encode(array(
        "success" => true,
        "message" => "Carga masiva completada",
        "resumen" => array(
            "creados" => $creados,
            "errores" => count($errores),
            "total_procesados" => count($data)
        ),
        "detalle_errores" => $errores
    ));
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "No se pudo crear ningún registro",
        "errores" => $errores
    ));
}
?>
