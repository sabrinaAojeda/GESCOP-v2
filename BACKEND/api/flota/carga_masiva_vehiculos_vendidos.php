<?php
// BACKEND/api/flota/carga_masiva_vehiculos_vendidos.php - ENDPOINT PARA CARGA MASIVA DE VEHÍCULOS VENDIDOS

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
include_once $base_path . '/models/VehiculoVendido.php';

$database = new Database();
$db = $database->getConnection();
$vehiculoVendido = new VehiculoVendido($db);

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
        if (empty($item['interno_original'])) {
            $errores[] = "Registro " . ($index + 1) . ": Falta el campo interno_original";
            continue;
        }
        
        if (empty($item['nuevo_propietario'])) {
            $errores[] = "Registro " . ($index + 1) . ": Falta el campo nuevo_propietario";
            continue;
        }
        
        if (empty($item['fecha_venta'])) {
            $errores[] = "Registro " . ($index + 1) . ": Falta el campo fecha_venta";
            continue;
        }
        
        // Asignar campos
        $vehiculoVendido->interno_original = trim($item['interno_original']);
        $vehiculoVendido->nuevo_propietario = trim($item['nuevo_propietario']);
        $vehiculoVendido->dni_propietario = trim($item['dni_propietario'] ?? '');
        $vehiculoVendido->fecha_venta = $item['fecha_venta'];
        $vehiculoVendido->precio = !empty($item['precio']) ? floatval($item['precio']) : null;
        $vehiculoVendido->forma_pago = $item['forma_pago'] ?? '';
        $vehiculoVendido->estado_documentacion = $item['estado_documentacion'] ?? 'Pendiente';
        $vehiculoVendido->observaciones = $item['observaciones'] ?? '';
        
        // Intentar crear
        if ($vehiculoVendido->crear()) {
            $creados++;
        } else {
            $errores[] = "Registro " . ($index + 1) . ": No se pudo crear";
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
