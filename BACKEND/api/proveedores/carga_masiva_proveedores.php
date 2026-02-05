<?php
// BACKEND/api/proveedores/carga_masiva_proveedores.php - ENDPOINT PARA CARGA MASIVA DE PROVEEDORES

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
include_once $base_path . '/models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();
$proveedor = new Proveedor($db);

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
        if (empty($item['razon_social']) || empty($item['cuit'])) {
            $errores[] = "Registro " . ($index + 1) . ": Faltan campos requeridos (razon_social, cuit)";
            continue;
        }
        
        // Generar código si no existe
        $codigo = $item['codigo'] ?? 'PROV-' . date('Ymd') . '-' . str_pad(($index + 1), 4, '0', STR_PAD_LEFT);
        
        // Asignar campos
        $proveedor->codigo = $codigo;
        $proveedor->razon_social = $item['razon_social'];
        $proveedor->cuit = $item['cuit'];
        $proveedor->rubro = $item['rubro'] ?? '';
        $proveedor->tipo_proveedor = $item['tipo_proveedor'] ?? 'terciarizado';
        $proveedor->sector_servicio = $item['sector_servicio'] ?? $item['sector'] ?? '';
        $proveedor->servicio_especifico = $item['servicio_especifico'] ?? $item['servicio'] ?? '';
        $proveedor->direccion = $item['direccion'] ?? '';
        $proveedor->localidad = $item['localidad'] ?? '';
        $proveedor->provincia = $item['provincia'] ?? 'Buenos Aires';
        $proveedor->telefono = $item['telefono'] ?? '';
        $proveedor->email = $item['email'] ?? '';
        $proveedor->contacto_nombre = $item['contacto_nombre'] ?? $item['contacto'] ?? '';
        $proveedor->contacto_cargo = $item['contacto_cargo'] ?? '';
        $proveedor->estado = $item['estado'] ?? 'Activo';
        $proveedor->seguro_RT = isset($item['seguro_RT']) ? (bool)$item['seguro_RT'] : false;
        $proveedor->seguro_vida_personal = isset($item['seguro_vida']) ? (bool)$item['seguro_vida'] : false;
        $proveedor->poliza_RT = $item['poliza_RT'] ?? '';
        $proveedor->vencimiento_poliza_RT = $item['vencimiento_poliza_RT'] ?? '';
        $proveedor->habilitacion_personal = $item['habilitacion_personal'] ?? '';
        $proveedor->vencimiento_habilitacion_personal = $item['vencimiento_habilitacion_personal'] ?? '';
        $proveedor->habilitacion_vehiculo = $item['habilitacion_vehiculo'] ?? '';
        $proveedor->vencimiento_habilitacion_vehiculo = $item['vencimiento_habilitacion_vehiculo'] ?? '';
        $proveedor->documentos_cantidad = $item['documentos_cantidad'] ?? 0;
        $proveedor->proximo_vencimiento = !empty($item['proximo_vencimiento']) ? $item['proximo_vencimiento'] : null;
        $proveedor->frecuencia_renovacion = $item['frecuencia_renovacion'] ?? 'anual';
        $proveedor->campos_personalizados = $item['campos_personalizados'] ?? [];
        $proveedor->activo = 1;
        
        // Intentar crear
        if ($proveedor->crear()) {
            $creados++;
        } else {
            $errores[] = "Registro " . ($index + 1) . ": No se pudo crear (posiblemente CUIT duplicado)";
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
