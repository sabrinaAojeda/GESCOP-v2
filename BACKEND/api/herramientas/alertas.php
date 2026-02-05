<?php
// BACKEND/api/herramientas/alertas.php - API para gestión de alertas
header('Content-Type: application/json; charset=UTF-8');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Alerta.php';

// Función de respuesta local
function sendResponse($success = true, $message = '', $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c')
    ]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$alerta = new Alerta($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $filtros = [
                'categoria' => $_GET['categoria'] ?? '',
                'prioridad' => $_GET['prioridad'] ?? '',
                'estado' => $_GET['estado'] ?? '',
                'tipo' => $_GET['tipo'] ?? '',
                'search' => $_GET['search'] ?? ''
            ];
            
            if ($id) {
                // Obtener una alerta específica
                $alerta->id = $id;
                if ($alerta->leerUno()) {
                    sendResponse(true, 'Alerta encontrada', [
                        'id' => $alerta->id,
                        'tipo' => $alerta->tipo,
                        'titulo' => $alerta->titulo,
                        'descripcion' => $alerta->descripcion,
                        'prioridad' => $alerta->prioridad,
                        'estado' => $alerta->estado,
                        'categoria' => $alerta->categoria,
                        'fecha_generacion' => $alerta->fecha_generacion,
                        'fecha_vencimiento' => $alerta->fecha_vencimiento,
                        'elemento_tipo' => $alerta->elemento_tipo,
                        'elemento_id' => $alerta->elemento_id,
                        'elemento_nombre' => $alerta->elemento_nombre,
                        'observaciones' => $alerta->observaciones
                    ]);
                } else {
                    sendResponse(false, 'Alerta no encontrada', null, 404);
                }
            } elseif (isset($_GET['pendientes']) && $_GET['pendientes'] == '1') {
                // Obtener alertas pendientes
                $stmt = $alerta->leerPendientes();
                $alertas = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $alertas[] = $row;
                }
                sendResponse(true, 'Alertas pendientes obtenidas', $alertas);
            } elseif (isset($_GET['estadisticas']) && $_GET['estadisticas'] == '1') {
                // Obtener estadísticas
                $estadisticas = $alerta->obtenerEstadisticas();
                sendResponse(true, 'Estadísticas obtenidas', $estadisticas);
            } elseif (isset($_GET['proximas']) && $_GET['proximas'] == '1') {
                // Obtener alertas próximas a vencer
                $dias = $_GET['dias'] ?? 7;
                $stmt = $alerta->obtenerProximasAVencer($dias);
                $alertas = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $alertas[] = $row;
                }
                sendResponse(true, 'Alertas próximas obtenidas', $alertas);
            } else {
                // Obtener alertas con filtros
                $stmt = $alerta->leer($filtros);
                $alertas = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $alertas[] = $row;
                }
                sendResponse(true, 'Alertas obtenidas', $alertas);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            // Verificar si es para generar alertas automáticas
            if (isset($_GET['generar_automaticas']) && $_GET['generar_automaticas'] == '1') {
                $alertasCreadas = $alerta->generarAlertasAutomaticas();
                sendResponse(true, 'Alertas automáticas generadas', ['alertas_creadas' => $alertasCreadas]);
            }
            
            if (!$data || empty($data->tipo) || empty($data->titulo)) {
                sendResponse(false, 'Datos incompletos. Tipo y título son requeridos.', null, 400);
            }
            
            // Normalizar prioridad y estado
            $prioridad = strtolower($data->prioridad ?? 'medio');
            $prioridadMap = [
                'critico' => 'critico', 'crítico' => 'critico',
                'alto' => 'alto',
                'medio' => 'medio',
                'bajo' => 'bajo'
            ];
            $prioridad = $prioridadMap[$prioridad] ?? 'medio';
            
            $estado = strtolower($data->estado ?? 'pendiente');
            $estadoMap = [
                'pendiente' => 'pendiente',
                'en_proceso' => 'en_proceso',
                'resuelta' => 'resuelta',
                'archivada' => 'archivada'
            ];
            $estado = $estadoMap[$estado] ?? 'pendiente';
            
            $alerta->tipo = $data->tipo;
            $alerta->titulo = $data->titulo;
            $alerta->descripcion = $data->descripcion ?? '';
            $alerta->prioridad = $prioridad;
            $alerta->estado = $estado;
            $alerta->categoria = $data->categoria ?? 'Otros';
            $alerta->fecha_vencimiento = $data->fecha_vencimiento ?? null;
            $alerta->elemento_tipo = $data->elemento_tipo ?? '';
            $alerta->elemento_id = $data->elemento_id ?? null;
            $alerta->elemento_nombre = $data->elemento_nombre ?? '';
            $alerta->observaciones = $data->observaciones ?? '';
            
            if ($alerta->crear()) {
                sendResponse(true, 'Alerta creada exitosamente', ['id' => $alerta->id], 201);
            } else {
                sendResponse(false, 'No se pudo crear la alerta', null, 500);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            $id = $_GET['id'] ?? $data->id ?? null;
            
            if (!$id) {
                sendResponse(false, 'ID de alerta requerido', null, 400);
            }
            
            // Verificar si es para resolver o posponer
            if (isset($_GET['accion'])) {
                $accion = $_GET['accion'];
                $alerta->id = $id;
                
                if (!$alerta->leerUno()) {
                    sendResponse(false, 'Alerta no encontrada', null, 404);
                }
                
                if ($accion == 'resolver') {
                    $notas = $data->notas ?? '';
                    if ($alerta->resolver('Sistema', $notas)) {
                        sendResponse(true, 'Alerta marcada como resuelta');
                    } else {
                        sendResponse(false, 'No se pudo resolver la alerta', null, 500);
                    }
                } elseif ($accion == 'posponer') {
                    $nueva_fecha = $data->nueva_fecha ?? null;
                    if (!$nueva_fecha) {
                        sendResponse(false, 'Nueva fecha requerida', null, 400);
                    }
                    $notas = $data->notas ?? '';
                    if ($alerta->posponer($nueva_fecha, 'Sistema', $notas)) {
                        sendResponse(true, 'Alerta pospuesta');
                    } else {
                        sendResponse(false, 'No se pudo posponer la alerta', null, 500);
                    }
                } else {
                    sendResponse(false, 'Acción no válida', null, 400);
                }
                break;
            }
            
            if (!$data) {
                sendResponse(false, 'Datos requeridos', null, 400);
            }
            
            $alerta->id = $id;
            
            if (!$alerta->leerUno()) {
                sendResponse(false, 'Alerta no encontrada', null, 404);
            }
            
            if (isset($data->tipo)) $alerta->tipo = $data->tipo;
            if (isset($data->titulo)) $alerta->titulo = $data->titulo;
            if (isset($data->descripcion)) $alerta->descripcion = $data->descripcion;
            if (isset($data->prioridad)) {
                $prioridad = strtolower($data->prioridad);
                $prioridadMap = [
                    'critico' => 'critico', 'crítico' => 'critico',
                    'alto' => 'alto',
                    'medio' => 'medio',
                    'bajo' => 'bajo'
                ];
                $alerta->prioridad = $prioridadMap[$prioridad] ?? $data->prioridad;
            }
            if (isset($data->estado)) {
                $estado = strtolower($data->estado);
                $estadoMap = [
                    'pendiente' => 'pendiente',
                    'en_proceso' => 'en_proceso',
                    'resuelta' => 'resuelta',
                    'archivada' => 'archivada'
                ];
                $alerta->estado = $estadoMap[$estado] ?? $data->estado;
            }
            if (isset($data->categoria)) $alerta->categoria = $data->categoria;
            if (isset($data->fecha_vencimiento)) $alerta->fecha_vencimiento = $data->fecha_vencimiento;
            if (isset($data->observaciones)) $alerta->observaciones = $data->observaciones;
            
            if ($alerta->actualizar()) {
                sendResponse(true, 'Alerta actualizada exitosamente');
            } else {
                sendResponse(false, 'No se pudo actualizar la alerta', null, 500);
            }
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"));
            $id = $_GET['id'] ?? $data->id ?? null;
            
            if (!$id) {
                sendResponse(false, 'ID de alerta requerido', null, 400);
            }
            
            $alerta->id = $id;
            
            if ($alerta->eliminar()) {
                sendResponse(true, 'Alerta eliminada exitosamente');
            } else {
                sendResponse(false, 'No se pudo eliminar la alerta', null, 500);
            }
            break;

        default:
            sendResponse(false, 'Método no permitido', null, 405);
            break;
    }
} catch (Exception $e) {
    error_log("Error en alertas.php: " . $e->getMessage());
    sendResponse(false, 'Error interno del servidor: ' . $e->getMessage(), null, 500);
}
