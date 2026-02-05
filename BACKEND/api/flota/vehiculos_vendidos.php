<?php
// BACKEND/api/flota/vehiculos_vendidos.php - CORREGIDO para coincidir con BD

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
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/VehiculoVendido.php';

$database = new Database();
$db = $database->getConnection();
$vehiculoVendido = new VehiculoVendido($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;
        $search = $_GET['search'] ?? '';
        $estado = $_GET['estado'] ?? '';
        
        if ($id) {
            // Obtener un vehículo vendido específico
            if ($vehiculoVendido->leerUno($id)) {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id' => $vehiculoVendido->id,
                        'interno_original' => $vehiculoVendido->interno_original,
                        'nuevo_propietario' => $vehiculoVendido->nuevo_propietario,
                        'dni_propietario' => $vehiculoVendido->dni_propietario,
                        'fecha_venta' => $vehiculoVendido->fecha_venta,
                        'precio' => $vehiculoVendido->precio,
                        'forma_pago' => $vehiculoVendido->forma_pago,
                        'estado_documentacion' => $vehiculoVendido->estado_documentacion,
                        'observaciones' => $vehiculoVendido->observaciones
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Vehículo vendido no encontrado']);
            }
        } else {
            // Obtener todos con filtros y paginación
            $offset = ($page - 1) * $limit;
            $stmt = $vehiculoVendido->leerConFiltros($search, $estado, $limit, $offset);
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $vehiculos_arr = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $vehiculos_arr[] = $row;
                }
                
                $total = $vehiculoVendido->contarConFiltros($search, $estado);
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'vehiculos_vendidos' => $vehiculos_arr,
                        'pagination' => [
                            'current_page' => (int)$page,
                            'per_page' => (int)$limit,
                            'total' => (int)$total,
                            'total_pages' => ceil($total / $limit)
                        ]
                    ]
                ]);
            } else {
                // No hay vehículos vendidos - devolver array vacío con paginación
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'vehiculos_vendidos' => [],
                        'pagination' => [
                            'current_page' => (int)$page,
                            'per_page' => (int)$limit,
                            'total' => 0,
                            'total_pages' => 1
                        ]
                    ]
                ]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // El frontend envía: interno, dominio, marca_modelo, año, fecha_venta, comprador, dni_cuit_comprador, precio, precio_moneda, estado_documentacion, observaciones
        // BD espera: interno_original, nuevo_propietario, dni_propietario, fecha_venta, precio, forma_pago, estado_documentacion, observaciones
        
        if(!empty($data['interno'])) {
            $vehiculoVendido->interno_original = $data['interno']; // interno -> interno_original
            $vehiculoVendido->nuevo_propietario = $data['comprador'] ?? ''; // comprador -> nuevo_propietario
            $vehiculoVendido->dni_propietario = $data['dni_cuit_comprador'] ?? ''; // dni_cuit_comprador -> dni_propietario
            $vehiculoVendido->fecha_venta = $data['fecha_venta'] ?? null;
            $vehiculoVendido->precio = $data['precio'] ?? 0;
            $vehiculoVendido->forma_pago = $data['forma_pago'] ?? $data['precio_moneda'] ?? 'ARS'; // Mapear forma_pago
            $vehiculoVendido->estado_documentacion = $data['estado_documentacion'] ?? 'Pendiente';
            $vehiculoVendido->observaciones = $data['observaciones'] ?? '';
            
            if($vehiculoVendido->crear()) {
                http_response_code(201);
                echo json_encode(['success' => true, 'message' => 'Vehículo vendido registrado exitosamente', 'id' => $vehiculoVendido->id]);
            } else {
                http_response_code(503);
                echo json_encode(['success' => false, 'message' => 'No se pudo registrar el vehículo vendido']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Interno requerido']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requerido para actualizar']);
            break;
        }
        
        $vehiculoVendido->id = $data['id'];
        
        // Verificar que existe
        if (!$vehiculoVendido->leerUno()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Vehículo vendido no encontrado']);
            break;
        }
        
        // Mapear campos del frontend a la BD
        $vehiculoVendido->interno_original = $data['interno'] ?? $vehiculoVendido->interno_original;
        $vehiculoVendido->nuevo_propietario = $data['comprador'] ?? $vehiculoVendido->nuevo_propietario;
        $vehiculoVendido->dni_propietario = $data['dni_cuit_comprador'] ?? $vehiculoVendido->dni_propietario;
        $vehiculoVendido->fecha_venta = $data['fecha_venta'] ?? $vehiculoVendido->fecha_venta;
        $vehiculoVendido->precio = $data['precio'] ?? $vehiculoVendido->precio;
        $vehiculoVendido->forma_pago = $data['forma_pago'] ?? $data['precio_moneda'] ?? $vehiculoVendido->forma_pago;
        $vehiculoVendido->estado_documentacion = $data['estado_documentacion'] ?? $vehiculoVendido->estado_documentacion;
        $vehiculoVendido->observaciones = $data['observaciones'] ?? $vehiculoVendido->observaciones;
        
        if($vehiculoVendido->actualizar()) {
            echo json_encode(['success' => true, 'message' => 'Vehículo vendido actualizado exitosamente']);
        } else {
            http_response_code(503);
            echo json_encode(['success' => false, 'message' => 'No se pudo actualizar el vehículo vendido']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requerido para eliminar']);
            break;
        }
        
        if($vehiculoVendido->eliminar($data['id'])) {
            echo json_encode(['success' => true, 'message' => 'Vehículo vendido eliminado exitosamente']);
        } else {
            http_response_code(503);
            echo json_encode(['success' => false, 'message' => 'No se pudo eliminar el vehículo vendido']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>
