<?php
// ERROR REPORTING COMPLETO AL INICIO
if ($_ENV['ENVIRONMENT'] !== 'production') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
ini_set('log_errors', 1);

// HEADERS - YA CONFIGURADOS EN index.php, pero se repiten por seguridad
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// LOG PARA DEBUG
error_log("🚀 vehiculos.php ejecutándose. Método: " . $_SERVER['REQUEST_METHOD']);

// INCLUSIÓN DE ARCHIVOS CON RUTAS RELATIVAS - MÁS CONFIABLES
// Usar dirname para obtener rutas relativas
$base_path = dirname(__DIR__) . '/';
require_once $base_path . '../config/database.php';
require_once $base_path . '../models/Vehiculo.php';

function sendResponse($success, $message = '', $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

try {
    // INICIALIZAR DATABASE Y MODELO
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("No se pudo conectar a la base de datos");
    }
    
    $vehiculo = new Vehiculo($db);
    $method = $_SERVER['REQUEST_METHOD'];

    error_log("📝 Método HTTP: $method");

    switch($method) {
        case 'GET':
            $search = $_GET['search'] ?? '';
            $sector = $_GET['sector'] ?? '';
            $estado = $_GET['estado'] ?? '';
            $tipo = $_GET['tipo'] ?? '';
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $interno = $_GET['interno'] ?? null;

            error_log("🔍 Parámetros GET: search=$search, sector=$sector, estado=$estado, tipo=$tipo, page=$page, limit=$limit");

            if($interno) {
                error_log("🔎 Buscando vehículo específico: $interno");
                $vehiculo->interno = $interno;
                if($vehiculo->leerUno()) {
                    sendResponse(true, 'Vehículo encontrado', [
                        "interno" => $vehiculo->interno,
                        "año" => $vehiculo->año,
                        "dominio" => $vehiculo->dominio,
                        "modelo" => $vehiculo->modelo,
                        "eq_incorporado" => $vehiculo->eq_incorporado,
                        "sector" => $vehiculo->sector,
                        "chofer" => $vehiculo->chofer,
                        "estado" => $vehiculo->estado,
                        "observaciones" => $vehiculo->observaciones,
                        "vtv_vencimiento" => $vehiculo->vtv_vencimiento,
                        "vtv_estado" => $vehiculo->vtv_estado,
                        "hab_vencimiento" => $vehiculo->hab_vencimiento,
                        "hab_estado" => $vehiculo->hab_estado,
                        "seguro_vencimiento" => $vehiculo->seguro_vencimiento,
                        "tipo" => $vehiculo->tipo
                    ]);
                } else {
                    sendResponse(false, 'Vehículo no encontrado', null, 404);
                }
            } else {
                error_log("📋 Obteniendo listado de vehículos");
                $stmt = $vehiculo->leerConFiltros($search, $sector, $estado, $tipo, $limit, ($page - 1) * $limit);
                
                $vehiculos_data = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $vehiculos_data[] = $row;
                }
                
                $total = $vehiculo->contarConFiltros($search, $sector, $estado, $tipo);
                
                error_log("✅ Vehículos encontrados: " . count($vehiculos_data) . " de $total totales");
                
                sendResponse(true, 'Vehículos obtenidos exitosamente', [
                    'vehiculos' => $vehiculos_data,
                    'pagination' => [
                        "current_page" => $page,
                        "per_page" => $limit,
                        "total" => $total,
                        "total_pages" => ceil($total / $limit)
                    ]
                ]);
            }
            break;

        case 'POST':
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            error_log("➕ Creando vehículo. Input: " . $input);
            
            if(!$data) {
                error_log("❌ JSON inválido recibido");
                sendResponse(false, 'Datos JSON inválidos', null, 400);
            }
            
            if(empty($data->interno) || empty($data->dominio) || empty($data->modelo) || empty($data->estado)) {
                error_log("❌ Datos incompletos recibidos");
                sendResponse(false, 'Datos incompletos. Interno, dominio, modelo y estado son requeridos.', null, 400);
            }
            
            // Asignar propiedades
            $vehiculo->interno = trim($data->interno);
            $vehiculo->dominio = trim($data->dominio);
            $vehiculo->modelo = trim($data->modelo);
            $vehiculo->estado = trim($data->estado);
            $vehiculo->año = $data->año ?? null;
            $vehiculo->eq_incorporado = $data->eq_incorporado ?? '';
            $vehiculo->sector = $data->sector ?? '';
            $vehiculo->chofer = $data->chofer ?? '';
            $vehiculo->observaciones = $data->observaciones ?? '';
            $vehiculo->vtv_vencimiento = $data->vtv_vencimiento ?? null;
            $vehiculo->vtv_estado = $data->vtv_estado ?? '';
            $vehiculo->hab_vencimiento = $data->hab_vencimiento ?? null;
            $vehiculo->hab_estado = $data->hab_estado ?? '';
            $vehiculo->seguro_vencimiento = $data->seguro_vencimiento ?? null;
            $vehiculo->tipo = $data->tipo ?? 'Rodado';
            
            if($vehiculo->crear()) {
                error_log("✅ Vehículo creado exitosamente: " . $vehiculo->interno);
                sendResponse(true, 'Vehículo creado exitosamente', null, 201);
            } else {
                error_log("❌ Error al crear vehículo: " . $vehiculo->interno);
                sendResponse(false, 'No se pudo crear el vehículo. El interno ya existe.', null, 400);
            }
            break;

        case 'PUT':
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            error_log("✏️ Actualizando vehículo. Input: " . $input);
            
            if(!$data || empty($data->interno)) {
                sendResponse(false, 'Interno requerido', null, 400);
            }
            
            // Asignar propiedades
            $vehiculo->interno = trim($data->interno);
            $vehiculo->dominio = trim($data->dominio);
            $vehiculo->modelo = trim($data->modelo);
            $vehiculo->estado = trim($data->estado);
            $vehiculo->año = $data->año ?? null;
            $vehiculo->eq_incorporado = $data->eq_incorporado ?? '';
            $vehiculo->sector = $data->sector ?? '';
            $vehiculo->chofer = $data->chofer ?? '';
            $vehiculo->observaciones = $data->observaciones ?? '';
            $vehiculo->vtv_vencimiento = $data->vtv_vencimiento ?? null;
            $vehiculo->vtv_estado = $data->vtv_estado ?? '';
            $vehiculo->hab_vencimiento = $data->hab_vencimiento ?? null;
            $vehiculo->hab_estado = $data->hab_estado ?? '';
            $vehiculo->seguro_vencimiento = $data->seguro_vencimiento ?? null;
            $vehiculo->tipo = $data->tipo ?? 'Rodado';
            
            if($vehiculo->actualizar()) {
                error_log("✅ Vehículo actualizado exitosamente: " . $vehiculo->interno);
                sendResponse(true, 'Vehículo actualizado exitosamente');
            } else {
                error_log("❌ Error al actualizar vehículo: " . $vehiculo->interno);
                sendResponse(false, 'No se pudo actualizar el vehículo', null, 400);
            }
            break;

        case 'DELETE':
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            error_log("🗑️ Eliminando vehículo. Input: " . $input);
            
            if(!$data || empty($data->interno)) {
                sendResponse(false, 'Interno requerido', null, 400);
            }
            
            $vehiculo->interno = $data->interno;
            
            if($vehiculo->eliminar()) {
                error_log("✅ Vehículo eliminado exitosamente: " . $vehiculo->interno);
                sendResponse(true, 'Vehículo eliminado exitosamente');
            } else {
                error_log("❌ Error al eliminar vehículo: " . $vehiculo->interno);
                sendResponse(false, 'No se pudo eliminar el vehículo', null, 400);
            }
            break;

        default:
            sendResponse(false, 'Método no permitido', null, 405);
            break;
    }
} catch (Exception $e) {
    error_log("💥 EXCEPCIÓN CRÍTICA en vehiculos.php: " . $e->getMessage());
    error_log("💥 Stack trace: " . $e->getTraceAsString());
    sendResponse(false, 'Error interno del servidor: ' . $e->getMessage(), null, 500);
}
?>