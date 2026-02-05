<?php
// BACKEND/api/flota/equipamientos.php - CORREGIDO para coincidir con BD y frontend

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
include_once $base_path . '/models/Equipamiento.php';

$database = new Database();
$db = $database->getConnection();
$equipamiento = new Equipamiento($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        $codigo = $_GET['codigo'] ?? null;
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;
        $search = $_GET['search'] ?? '';
        $tipo = $_GET['tipo'] ?? '';
        $estado = $_GET['estado'] ?? '';
        
        if ($id || $codigo) {
            // Obtener un equipamiento específico
            if ($id) {
                $equipamiento->id = $id;
            } else {
                // Buscar por código
                $query = "SELECT id FROM " . $equipamiento->table_name . " WHERE codigo = :codigo LIMIT 1";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":codigo", $codigo);
                $stmt->execute();
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $equipamiento->id = $row['id'];
                }
            }
            
            if ($equipamiento->leerUno()) {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id' => $equipamiento->id,
                        'codigo' => $equipamiento->codigo,
                        'nombre' => $equipamiento->nombre,
                        'tipo' => $equipamiento->tipo,
                        'marca' => $equipamiento->marca,
                        'modelo' => $equipamiento->modelo,
                        'serie' => $equipamiento->serie,
                        'ubicacion' => $equipamiento->ubicacion,
                        'estado' => $equipamiento->estado,
                        'fecha_adquisicion' => $equipamiento->fecha_adquisicion,
                        'ultimo_mantenimiento' => $equipamiento->ultimo_mantenimiento,
                        'proximo_mantenimiento' => $equipamiento->proximo_mantenimiento,
                        'responsable' => $equipamiento->responsable,
                        'observaciones' => $equipamiento->observaciones,
                        'activo' => $equipamiento->activo
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Equipamiento no encontrado']);
            }
        } else {
            // Obtener todos con filtros y paginación
            $offset = ($page - 1) * $limit;
            $stmt = $equipamiento->leerConFiltros($search, $tipo, $estado, $limit, $offset);
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $equipamientos_arr = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $equipamientos_arr[] = $row;
                }
                
                $total = $equipamiento->contarConFiltros($search, $tipo, $estado);
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'equipamientos' => $equipamientos_arr,
                        'pagination' => [
                            'current_page' => (int)$page,
                            'per_page' => (int)$limit,
                            'total' => (int)$total,
                            'total_pages' => ceil($total / $limit)
                        ]
                    ]
                ]);
            } else {
                // No hay equipamientos - devolver array vacío con paginación
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'equipamientos' => [],
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
        
        // El frontend envía: codigo, descripcion, tipo, ubicacion, estado, ultima_revision, proxima_revision, observaciones
        // BD espera: codigo, nombre, tipo, marca, modelo, serie, ubicacion, estado, fecha_adquisicion, ultimo_mantenimiento, proximo_mantenimiento, responsable, observaciones
        
        if(!empty($data['codigo'])) {
            $equipamiento->codigo = $data['codigo'];
            $equipamiento->nombre = $data['descripcion'] ?? $data['nombre'] ?? ''; // Mapear descripcion -> nombre
            $equipamiento->tipo = $data['tipo'] ?? 'Equipo';
            $equipamiento->marca = $data['marca'] ?? '';
            $equipamiento->modelo = $data['modelo'] ?? '';
            $equipamiento->serie = $data['serie'] ?? '';
            $equipamiento->ubicacion = $data['ubicacion'] ?? '';
            $equipamiento->estado = $data['estado'] ?? 'Operativo';
            $equipamiento->fecha_adquisicion = $data['fecha_adquisicion'] ?? null;
            $equipamiento->ultimo_mantenimiento = $data['ultima_revision'] ?? $data['ultimo_mantenimiento'] ?? null; // Mapear ultima_revision -> ultimo_mantenimiento
            $equipamiento->proximo_mantenimiento = $data['proxima_revision'] ?? $data['proximo_mantenimiento'] ?? null; // Mapear proxima_revision -> proximo_mantenimiento
            $equipamiento->responsable = $data['responsable'] ?? '';
            $equipamiento->observaciones = $data['observaciones'] ?? '';
            $equipamiento->activo = 1;
            
            try {
                if($equipamiento->crear()) {
                    http_response_code(201);
                    echo json_encode(['success' => true, 'message' => 'Equipamiento creado exitosamente', 'id' => $equipamiento->id]);
                } else {
                    http_response_code(503);
                    echo json_encode(['success' => false, 'message' => 'No se pudo crear el equipamiento']);
                }
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Código requerido']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requerido para actualizar']);
            break;
        }
        
        $equipamiento->id = $data['id'];
        
        // Verificar que existe
        if (!$equipamiento->leerUno()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Equipamiento no encontrado']);
            break;
        }
        
        // Mapear campos del frontend a la BD
        $equipamiento->codigo = $data['codigo'] ?? $equipamiento->codigo;
        $equipamiento->nombre = $data['descripcion'] ?? $data['nombre'] ?? $equipamiento->nombre;
        $equipamiento->tipo = $data['tipo'] ?? $equipamiento->tipo;
        $equipamiento->marca = $data['marca'] ?? $equipamiento->marca;
        $equipamiento->modelo = $data['modelo'] ?? $equipamiento->modelo;
        $equipamiento->serie = $data['serie'] ?? $equipamiento->serie;
        $equipamiento->ubicacion = $data['ubicacion'] ?? $equipamiento->ubicacion;
        $equipamiento->estado = $data['estado'] ?? $equipamiento->estado;
        $equipamiento->fecha_adquisicion = $data['fecha_adquisicion'] ?? $equipamiento->fecha_adquisicion;
        $equipamiento->ultimo_mantenimiento = $data['ultima_revision'] ?? $data['ultimo_mantenimiento'] ?? $equipamiento->ultimo_mantenimiento;
        $equipamiento->proximo_mantenimiento = $data['proxima_revision'] ?? $data['proximo_mantenimiento'] ?? $equipamiento->proximo_mantenimiento;
        $equipamiento->responsable = $data['responsable'] ?? $equipamiento->responsable;
        $equipamiento->observaciones = $data['observaciones'] ?? $equipamiento->observaciones;
        $equipamiento->activo = isset($data['activo']) ? $data['activo'] : 1;
        
        if($equipamiento->actualizar()) {
            echo json_encode(['success' => true, 'message' => 'Equipamiento actualizado exitosamente']);
        } else {
            http_response_code(503);
            echo json_encode(['success' => false, 'message' => 'No se pudo actualizar el equipamiento']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requerido para eliminar']);
            break;
        }
        
        if($equipamiento->eliminar($data['id'])) {
            echo json_encode(['success' => true, 'message' => 'Equipamiento eliminado exitosamente']);
        } else {
            http_response_code(503);
            echo json_encode(['success' => false, 'message' => 'No se pudo eliminar el equipamiento']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>
