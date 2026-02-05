<?php
// BACKEND/api/empresas/carga_masiva_sedes.php - ENDPOINT PARA CARGA MASIVA DE SEDES

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
include_once $base_path . '/models/Sede.php';

$database = new Database();
$db = $database->getConnection();
$sede = new Sede($db);

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
        // Validar campos requeridos según la base de datos real
        // La tabla sedes tiene: nombre, tipo_predio (como tipo), servicio_principal son requeridos
        if (empty($item['nombre'])) {
            $errores[] = "Registro " . ($index + 1) . ": Falta el campo nombre";
            continue;
        }
        
        // Generar código si no existe
        $codigo = $item['codigo'] ?? 'SEDE-' . date('Ymd') . '-' . str_pad(($index + 1), 4, '0', STR_PAD_LEFT);
        
        // Asignar campos - mapeando correctamente
        $sede->codigo = $codigo;
        $sede->nombre = $item['nombre'];
        // Mapeo: tipo_predio -> tipo (campo de la BD)
        $sede->tipo = $item['tipo_predio'] ?? $item['tipo'] ?? 'Sede';
        $sede->tipo_predio = $item['tipo_predio'] ?? '';
        $sede->servicio_principal = $item['servicio_principal'] ?? '';
        $sede->direccion = $item['direccion'] ?? '';
        $sede->localidad = $item['localidad'] ?? '';
        $sede->provincia = $item['provincia'] ?? 'Buenos Aires';
        $sede->telefono = $item['telefono'] ?? '';
        $sede->email = $item['email'] ?? '';
        $sede->responsable = $item['responsable'] ?? '';
        $sede->empresa_id = $item['empresa_id'] ?? null;
        $sede->tipo_habilitacion = $item['tipo_habilitacion'] ?? '';
        $sede->habilitacion_numero = $item['habilitacion_numero'] ?? '';
        $sede->vencimiento_habilitacion = !empty($item['vencimiento_habilitacion']) ? $item['vencimiento_habilitacion'] : null;
        $sede->certificaciones = $item['certificaciones'] ?? '';
        $sede->seguridad_higiene = $item['seguridad_higiene'] ?? '';
        $sede->procesos_quimicos = $item['procesos_quimicos'] ?? '';
        $sede->vencimiento_procesos = !empty($item['vencimiento_procesos']) ? $item['vencimiento_procesos'] : null;
        $sede->base_madre_copesa = $item['base_madre_copesa'] ?? 'No';
        $sede->base_operativa = $item['base_operativa'] ?? '';
        $sede->habilitada = $item['habilitada'] ?? 'Si';
        $sede->estado = $item['estado'] ?? 'Activa';
        $sede->observaciones = $item['observaciones'] ?? '';
        $sede->vehiculos_asignados = $item['vehiculos_asignados'] ?? 0;
        $sede->permisos_por_vencer = $item['permisos_por_vencer'] ?? 0;
        // Para nuevos registros, activo siempre es 1
        $sede->activo = 1;
        
        // Intentar crear
        if ($sede->crear()) {
            $creados++;
        } else {
            $errores[] = "Registro " . ($index + 1) . ": No se pudo crear (código duplicado o error未知)";
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
