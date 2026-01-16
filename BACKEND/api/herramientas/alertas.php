<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../models/Alerta.php';

$database = new Database();
$db = $database->getConnection();
$alerta = new Alerta($db);

$method = $_SERVER['REQUEST_METHOD'];

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
    switch($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $filtros = [
                'categoria' => $_GET['categoria'] ?? '',
                'prioridad' => $_GET['prioridad'] ?? '',
                'estado' => $_GET['estado'] ?? '',
                'vehiculo_id' => $_GET['vehiculo_id'] ?? '',
                'fecha_desde' => $_GET['fecha_desde'] ?? '',
                'fecha_hasta' => $_GET['fecha_hasta'] ?? '',
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
                        'vehiculo_id' => $alerta->vehiculo_id,
                        'vehiculo_dominio' => $alerta->vehiculo_dominio,
                        'vehiculo_modelo' => $alerta->vehiculo_modelo,
                        'prioridad' => $alerta->prioridad,
                        'estado' => $alerta->estado,
                        'categoria' => $alerta->categoria,
                        'fecha_generada' => $alerta->fecha_generada,
                        'fecha_vencimiento' => $alerta->fecha_vencimiento,
                        'fecha_resuelta' => $alerta->fecha_resuelta,
                        'usuario_generador' => $alerta->usuario_generador,
                        'usuario_resolutor' => $alerta->usuario_resolutor,
                        'notas' => $alerta->notas,
                        'elemento' => $alerta->elemento
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
            
            $alerta->tipo = $data->tipo;
            $alerta->titulo = $data->titulo;
            $alerta->descripcion = $data->descripcion ?? '';
            $alerta->vehiculo_id = $data->vehiculo_id ?? '';
            $alerta->prioridad = $data->prioridad ?? 'medio';
            $alerta->estado = $data->estado ?? 'activa';
            $alerta->categoria = $data->categoria ?? 'Otros';
            $alerta->fecha_vencimiento = $data->fecha_vencimiento ?? null;
            $alerta->usuario_generador = $data->usuario_generador ?? 'Sistema';
            $alerta->notas = $data->notas ?? '';
            $alerta->elemento = $data->elemento ?? '';
            
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
                $usuario = $data->usuario ?? 'Sistema';
                
                $alerta->id = $id;
                
                if (!$alerta->leerUno()) {
                    sendResponse(false, 'Alerta no encontrada', null, 404);
                }
                
                if ($accion == 'resolver') {
                    $notas = $data->notas ?? '';
                    if ($alerta->resolver($usuario, $notas)) {
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
                    if ($alerta->posponer($nueva_fecha, $usuario, $notas)) {
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
            
            // Primero leer la alerta existente
            if (!$alerta->leerUno()) {
                sendResponse(false, 'Alerta no encontrada', null, 404);
            }
            
            // Actualizar solo los campos proporcionados
            if (isset($data->tipo)) $alerta->tipo = $data->tipo;
            if (isset($data->titulo)) $alerta->titulo = $data->titulo;
            if (isset($data->descripcion)) $alerta->descripcion = $data->descripcion;
            if (isset($data->vehiculo_id)) $alerta->vehiculo_id = $data->vehiculo_id;
            if (isset($data->prioridad)) $alerta->prioridad = $data->prioridad;
            if (isset($data->estado)) $alerta->estado = $data->estado;
            if (isset($data->categoria)) $alerta->categoria = $data->categoria;
            if (isset($data->fecha_vencimiento)) $alerta->fecha_vencimiento = $data->fecha_vencimiento;
            if (isset($data->usuario_generador)) $alerta->usuario_generador = $data->usuario_generador;
            if (isset($data->notas)) $alerta->notas = $data->notas;
            if (isset($data->elemento)) $alerta->elemento = $data->elemento;
            
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
?>