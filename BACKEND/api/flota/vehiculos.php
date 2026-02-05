<?php
// BACKEND/api/flota/vehiculos.php - CORREGIDO COMPLETO

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Vehiculo.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $vehiculo = new Vehiculo($db);
    $method = $_SERVER['REQUEST_METHOD'];

    // Función helper para respuestas
    function jsonResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        $response = ['success' => $success, 'message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }
        echo json_encode($response);
        exit;
    }

    switch($method) {
        case 'GET':
            $search = $_GET['search'] ?? '';
            $sector = $_GET['sector'] ?? '';
            $estado = $_GET['estado'] ?? '';
            $tipo = $_GET['tipo'] ?? '';
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $interno = $_GET['interno'] ?? null;

            if($interno) {
                $vehiculo->interno = $interno;
                if($vehiculo->leerUno()) {
                    jsonResponse(true, 'Vehículo encontrado', [
                        'interno' => $vehiculo->interno,
                        'año' => $vehiculo->año,
                        'dominio' => $vehiculo->dominio,
                        'modelo' => $vehiculo->modelo,
                        'eq_incorporado' => $vehiculo->eq_incorporado,
                        'sector' => $vehiculo->sector,
                        'chofer' => $vehiculo->chofer,
                        'estado' => $vehiculo->estado,
                        'observaciones' => $vehiculo->observaciones,
                        'vtv_vencimiento' => $vehiculo->vtv_vencimiento,
                        'vtv_estado' => $vehiculo->vtv_estado,
                        'hab_vencimiento' => $vehiculo->hab_vencimiento,
                        'hab_estado' => $vehiculo->hab_estado,
                        'seguro_vencimiento' => $vehiculo->seguro_vencimiento,
                        'seguro_estado' => $vehiculo->seguro_estado,
                        'tipo' => $vehiculo->tipo,
                        'sede_id' => $vehiculo->sede_id,
                        'activo' => $vehiculo->activo
                    ]);
                } else {
                    jsonResponse(false, 'Vehículo no encontrado', null, 404);
                }
            } else {
                $stmt = $vehiculo->leerConFiltros($search, $sector, $estado, $tipo, $limit, ($page - 1) * $limit);
                $vehiculos_data = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $vehiculos_data[] = $row;
                }
                $total = $vehiculo->contarConFiltros($search, $sector, $estado, $tipo);
                jsonResponse(true, 'Vehículos obtenidos exitosamente', [
                    'vehiculos' => $vehiculos_data,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $limit,
                        'total' => $total,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]);
            }
            break;

        case 'POST':
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if(!$data || !is_array($data)) {
                jsonResponse(false, 'Datos JSON inválidos', null, 400);
            }
            
            // Validar campos requeridos
            $required = ['interno', 'dominio', 'modelo', 'estado'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    jsonResponse(false, "Campo requerido faltante: $field", null, 400);
                }
            }
            
            // Asignar propiedades según estructura real de BD
            $vehiculo->interno = trim($data['interno']);
            $vehiculo->dominio = trim($data['dominio']);
            $vehiculo->modelo = trim($data['modelo']);
            $vehiculo->estado = trim($data['estado']);
            $vehiculo->año = $data['año'] ?? null;
            $vehiculo->eq_incorporado = $data['eq_incorporado'] ?? '';
            $vehiculo->sector = $data['sector'] ?? '';
            $vehiculo->chofer = $data['chofer'] ?? '';
            $vehiculo->observaciones = $data['observaciones'] ?? '';
            $vehiculo->vtv_vencimiento = $data['vtv_vencimiento'] ?? null;
            $vehiculo->vtv_estado = $data['vtv_estado'] ?? 'Vigente';
            $vehiculo->hab_vencimiento = $data['hab_vencimiento'] ?? null;
            $vehiculo->hab_estado = $data['hab_estado'] ?? 'Vigente';
            $vehiculo->seguro_vencimiento = $data['seguro_vencimiento'] ?? null;
            $vehiculo->seguro_estado = $data['seguro_estado'] ?? 'Vigente';
            $vehiculo->tipo = $data['tipo'] ?? 'Rodado';
            $vehiculo->sede_id = $data['sede_id'] ?? null;
            $vehiculo->activo = $data['activo'] ?? 1;
            
            if($vehiculo->crear()) {
                jsonResponse(true, 'Vehículo creado exitosamente', [
                    'interno' => $vehiculo->interno
                ], 201);
            } else {
                jsonResponse(false, 'No se pudo crear el vehículo. El interno ya existe.', null, 400);
            }
            break;

        case 'PUT':
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if(!$data || empty($data['interno'])) {
                jsonResponse(false, 'Interno requerido', null, 400);
            }
            
            $vehiculo->interno = $data['interno'];
            if (!$vehiculo->leerUno()) {
                jsonResponse(false, 'Vehículo no encontrado', null, 404);
            }
            
            $vehiculo->dominio = trim($data['dominio'] ?? '');
            $vehiculo->modelo = trim($data['modelo'] ?? '');
            $vehiculo->estado = trim($data['estado'] ?? '');
            $vehiculo->año = $data['año'] ?? null;
            $vehiculo->eq_incorporado = $data['eq_incorporado'] ?? '';
            $vehiculo->sector = $data['sector'] ?? '';
            $vehiculo->chofer = $data['chofer'] ?? '';
            $vehiculo->observaciones = $data['observaciones'] ?? '';
            $vehiculo->vtv_vencimiento = $data['vtv_vencimiento'] ?? null;
            $vehiculo->vtv_estado = $data['vtv_estado'] ?? 'Vigente';
            $vehiculo->hab_vencimiento = $data['hab_vencimiento'] ?? null;
            $vehiculo->hab_estado = $data['hab_estado'] ?? 'Vigente';
            $vehiculo->seguro_vencimiento = $data['seguro_vencimiento'] ?? null;
            $vehiculo->seguro_estado = $data['seguro_estado'] ?? 'Vigente';
            $vehiculo->tipo = $data['tipo'] ?? 'Rodado';
            $vehiculo->sede_id = $data['sede_id'] ?? null;
            $vehiculo->activo = $data['activo'] ?? 1;
            
            if($vehiculo->actualizar()) {
                jsonResponse(true, 'Vehículo actualizado exitosamente', [
                    'interno' => $vehiculo->interno
                ]);
            } else {
                jsonResponse(false, 'Error al actualizar el vehículo', null, 400);
            }
            break;

        case 'DELETE':
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            $interno = $data['interno'] ?? null;
            if(!$interno) {
                jsonResponse(false, 'Interno requerido', null, 400);
            }
            
            $vehiculo->interno = $interno;
            if (!$vehiculo->leerUno()) {
                jsonResponse(false, 'Vehículo no encontrado', null, 404);
            }
            
            $vehiculo->activo = 0;
            $vehiculo->estado = 'Vendido';
            
            if($vehiculo->actualizar()) {
                jsonResponse(true, 'Vehículo eliminado exitosamente');
            } else {
                jsonResponse(false, 'Error al eliminar el vehículo', null, 400);
            }
            break;

        default:
            jsonResponse(false, 'Método no permitido', null, 405);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => $e->getMessage()
    ]);
}
