<?php
// BACKEND/api/flota/carga_masiva_equipamientos.php - ENDPOINT PARA CARGA MASIVA DE EQUIPAMIENTOS

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
include_once $base_path . '/models/Equipamiento.php';

$database = new Database();
$db = $database->getConnection();
$equipamiento = new Equipamiento($db);

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
        // Validar campos requeridos mínimos (código es único)
        if (empty($item['codigo'])) {
            $errores[] = "Registro " . ($index + 1) . ": Falta el campo código";
            continue;
        }
        
        if (empty($item['nombre'])) {
            $errores[] = "Registro " . ($index + 1) . ": Falta el campo nombre";
            continue;
        }
        
        // Asignar campos
        $equipamiento->codigo = trim($item['codigo']);
        $equipamiento->nombre = trim($item['nombre']);
        $equipamiento->tipo = $item['tipo'] ?? 'Equipo';
        $equipamiento->marca = $item['marca'] ?? '';
        $equipamiento->modelo = $item['modelo'] ?? '';
        $equipamiento->serie = $item['serie'] ?? '';
        $equipamiento->ubicacion = $item['ubicacion'] ?? '';
        $equipamiento->estado = $item['estado'] ?? 'Operativo';
        $equipamiento->fecha_adquisicion = !empty($item['fecha_adquisicion']) ? $item['fecha_adquisicion'] : null;
        $equipamiento->ultimo_mantenimiento = !empty($item['ultimo_mantenimiento']) ? $item['ultimo_mantenimiento'] : null;
        $equipamiento->proximo_mantenimiento = !empty($item['proximo_mantenimiento']) ? $item['proximo_mantenimiento'] : null;
        $equipamiento->responsable = $item['responsable'] ?? '';
        $equipamiento->observaciones = $item['observaciones'] ?? '';
        $equipamiento->activo = 1;
        
        // Intentar crear
        if ($equipamiento->crear()) {
            $creados++;
        } else {
            $errores[] = "Registro " . ($index + 1) . ": No se pudo crear (código duplicado)";
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
