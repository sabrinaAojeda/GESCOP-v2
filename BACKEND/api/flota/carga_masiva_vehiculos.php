<?php
// BACKEND/api/flota/carga_masiva_vehiculos.php - ENDPOINT PARA CARGA MASIVA DE VEHÍCULOS

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos
$base_path = dirname(__FILE__, 3);
include_once $base_path . '/config/database.php';
include_once $base_path . '/models/Vehiculo.php';

$database = new Database();
$db = $database->getConnection();
$vehiculo = new Vehiculo($db);

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
        if (empty($item['interno']) || empty($item['dominio']) || empty($item['modelo'])) {
            $errores[] = "Registro " . ($index + 1) . ": Faltan campos requeridos (interno, dominio, modelo)";
            continue;
        }
        
        // Asignar campos
        $vehiculo->interno = trim($item['interno']);
        $vehiculo->dominio = trim($item['dominio']);
        $vehiculo->modelo = trim($item['modelo']);
        $vehiculo->año = isset($item['año']) ? (int)$item['año'] : null;
        $vehiculo->eq_incorporado = $item['eq_incorporado'] ?? '';
        $vehiculo->sector = $item['sector'] ?? '';
        $vehiculo->chofer = $item['chofer'] ?? '';
        $vehiculo->estado = $item['estado'] ?? 'Activo';
        $vehiculo->observaciones = $item['observaciones'] ?? '';
        $vehiculo->vtv_vencimiento = $item['vtv_vencimiento'] ?? null;
        $vehiculo->vtv_estado = $item['vtv_estado'] ?? 'Vigente';
        $vehiculo->hab_vencimiento = $item['hab_vencimiento'] ?? null;
        $vehiculo->hab_estado = $item['hab_estado'] ?? 'Vigente';
        $vehiculo->seguro_vencimiento = $item['seguro_vencimiento'] ?? null;
        $vehiculo->seguro_estado = $item['seguro_estado'] ?? 'Vigente';
        $vehiculo->tipo = $item['tipo'] ?? 'Rodado';
        $vehiculo->sede_id = $item['sede_id'] ?? null;
        $vehiculo->activo = 1;
        
        // Intentar crear
        if ($vehiculo->crear()) {
            $creados++;
        } else {
            $errores[] = "Registro " . ($index + 1) . ": No se pudo crear (posiblemente interno o dominio duplicado)";
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
