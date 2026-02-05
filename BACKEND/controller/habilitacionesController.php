<?php
// BACKEND/controllers/habilitacionesController.php
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/Habilitacion.php';

$database = new Database();
$db = $database->getConnection();

$habilitacion = new Habilitacion($db);
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        if (isset($_GET['entidad_tipo']) && isset($_GET['entidad_id'])) {
            // Obtener habilitaciones de una entidad específica
            $entidad_tipo = $_GET['entidad_tipo'];
            $entidad_id = $_GET['entidad_id'];
            
            $stmt = $habilitacion->obtenerPorEntidad($entidad_tipo, $entidad_id);
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $habilitaciones
            ]);
        } elseif (isset($_GET['proximas'])) {
            // Obtener habilitaciones próximas a vencer
            $dias = $_GET['dias'] ?? 30;
            $stmt = $habilitacion->obtenerProximasAVencer($dias);
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $habilitaciones
            ]);
        } elseif (isset($_GET['id'])) {
            // Obtener una habilitación específica
            $habilitacion->id = $_GET['id'];
            if ($habilitacion->leerUno()) {
                echo json_encode([
                    'success' => true,
                    'data' => $habilitacion
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Habilitación no encontrada']);
            }
        } else {
            // Listar todas las habilitaciones
            $stmt = $habilitacion->leer();
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $habilitaciones
            ]);
        }
        break;
        
    case 'POST':
        // Crear nueva habilitación
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->entidad_tipo) && !empty($data->entidad_id) && !empty($data->tipo)) {
            $habilitacion->entidad_tipo = $data->entidad_tipo;
            $habilitacion->entidad_id = $data->entidad_id;
            $habilitacion->tipo = $data->tipo;
            $habilitacion->archivo = $data->archivo ?? '';
            $habilitacion->fecha_emision = $data->fecha_emision ?? null;
            $habilitacion->fecha_vencimiento = $data->fecha_vencimiento ?? null;
            $habilitacion->estado = $data->estado ?? 'activo';
            
            if ($habilitacion->crear()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Habilitación creada exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Error al crear la habilitación']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        }
        break;
        
    case 'PUT':
        // Actualizar habilitación
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $habilitacion->id = $data->id;
            
            if ($habilitacion->leerUno()) {
                $habilitacion->entidad_tipo = $data->entidad_tipo ?? $habilitacion->entidad_tipo;
                $habilitacion->entidad_id = $data->entidad_id ?? $habilitacion->entidad_id;
                $habilitacion->tipo = $data->tipo ?? $habilitacion->tipo;
                $habilitacion->archivo = $data->archivo ?? $habilitacion->archivo;
                $habilitacion->fecha_emision = $data->fecha_emision ?? $habilitacion->fecha_emision;
                $habilitacion->fecha_vencimiento = $data->fecha_vencimiento ?? $habilitacion->fecha_vencimiento;
                $habilitacion->estado = $data->estado ?? $habilitacion->estado;
                
                if ($habilitacion->actualizar()) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Habilitación actualizada exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al actualizar la habilitación']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Habilitación no encontrada']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID no especificado']);
        }
        break;
        
    case 'DELETE':
        // Eliminar habilitación
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $habilitacion->id = $data->id;
            
            if ($habilitacion->leerUno()) {
                if ($habilitacion->eliminar()) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Habilitación eliminada exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al eliminar la habilitación']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Habilitación no encontrada']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID no especificado']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        break;
}
?>