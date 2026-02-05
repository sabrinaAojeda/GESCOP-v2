<?php
// BACKEND/controllers/alertasController.php
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/Habilitacion.php';
require_once '../models/Documento.php';
require_once '../models/Personal.php';
require_once '../models/Sede.php';
require_once '../models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        // Obtener todas las alertas activas
        $categoria = $_GET['categoria'] ?? '';
        $nivel = $_GET['nivel'] ?? '';
        $estado = $_GET['estado'] ?? '';
        $tipo = $_GET['tipo'] ?? '';
        $search = $_GET['buscar'] ?? '';
        
        // Obtener habilitaciones próximas a vencer
        $habilitacion = new Habilitacion($db);
        $stmt_hab = $habilitacion->obtenerProximasAVencer(90); // 90 días
        $habilitaciones = $stmt_hab->fetchAll(PDO::FETCH_ASSOC);
        
        // Obtener documentos próximos a vencer
        $documento = new Documento($db);
        $stmt_doc = $documento->obtenerProximosAVencer(90);
        $documentos = $stmt_doc->fetchAll(PDO::FETCH_ASSOC);
        
        // Combinar y formatear alertas
        $alertas = [];
        
        // Alertas de habilitaciones
        foreach ($habilitaciones as $hab) {
            $dias_restantes = floor((strtotime($hab['fecha_vencimiento']) - time()) / (60 * 60 * 24));
            
            if ($dias_restantes <= 0) {
                $nivel_alerta = 'Crítico';
                $prioridad = 'critico';
                $icono = '🚨';
            } elseif ($dias_restantes <= 7) {
                $nivel_alerta = 'Alto';
                $prioridad = 'alto';
                $icono = '⚠️';
            } elseif ($dias_restantes <= 30) {
                $nivel_alerta = 'Medio';
                $prioridad = 'medio';
                $icono = '📅';
            } else {
                $nivel_alerta = 'Bajo';
                $prioridad = 'bajo';
                $icono = '📌';
            }
            
            $alertas[] = [
                'id' => 'HAB-' . $hab['id'],
                'categoria' => 'Habilitaciones',
                'descripcion' => 'Habilitación próxima a vencer: ' . $hab['tipo'],
                'elemento' => $hab['entidad_nombre'] ?? 'Sin nombre',
                'fechaGeneracion' => date('d/m/Y'),
                'vencimiento' => date('d/m/Y', strtotime($hab['fecha_vencimiento'])),
                'nivel' => $nivel_alerta,
                'estado' => 'Pendiente',
                'tipo' => $hab['tipo'],
                'prioridad' => $prioridad,
                'icono' => $icono,
                'dias_restantes' => $dias_restantes,
                'entidad_tipo' => $hab['entidad_tipo'],
                'entidad_id' => $hab['entidad_id']
            ];
        }
        
        // Alertas de documentos
        foreach ($documentos as $doc) {
            $dias_restantes = floor((strtotime($doc['vencimiento']) - time()) / (60 * 60 * 24));
            
            if ($dias_restantes <= 0) {
                $nivel_alerta = 'Crítico';
                $prioridad = 'critico';
                $icono = '🚨';
            } elseif ($dias_restantes <= 7) {
                $nivel_alerta = 'Alto';
                $prioridad = 'alto';
                $icono = '📄';
            } elseif ($dias_restantes <= 30) {
                $nivel_alerta = 'Medio';
                $prioridad = 'medio';
                $icono = '📋';
            } else {
                $nivel_alerta = 'Bajo';
                $prioridad = 'bajo';
                $icono = '📌';
            }
            
            $alertas[] = [
                'id' => 'DOC-' . $doc['id'],
                'categoria' => 'Documentación',
                'descripcion' => 'Documento próximo a vencer: ' . $doc['tipo_documento'],
                'elemento' => $doc['entidad_nombre'] ?? 'Sin nombre',
                'fechaGeneracion' => date('d/m/Y', strtotime($doc['created_at'])),
                'vencimiento' => date('d/m/Y', strtotime($doc['vencimiento'])),
                'nivel' => $nivel_alerta,
                'estado' => 'Pendiente',
                'tipo' => $doc['tipo_documento'],
                'prioridad' => $prioridad,
                'icono' => $icono,
                'dias_restantes' => $dias_restantes,
                'entidad_tipo' => $doc['entidad_tipo'],
                'entidad_id' => $doc['entidad_id']
            ];
        }
        
        // Aplicar filtros
        $alertas_filtradas = array_filter($alertas, function($alerta) use ($categoria, $nivel, $estado, $tipo, $search) {
            $match = true;
            
            if ($categoria && $alerta['categoria'] !== $categoria) {
                $match = false;
            }
            
            if ($nivel && $alerta['nivel'] !== $nivel) {
                $match = false;
            }
            
            if ($estado && $alerta['estado'] !== $estado) {
                $match = false;
            }
            
            if ($tipo && $alerta['tipo'] !== $tipo) {
                $match = false;
            }
            
            if ($search) {
                $termino = strtolower($search);
                if (strpos(strtolower($alerta['descripcion']), $termino) === false &&
                    strpos(strtolower($alerta['elemento']), $termino) === false &&
                    strpos(strtolower($alerta['id']), $termino) === false) {
                    $match = false;
                }
            }
            
            return $match;
        });
        
        // Reindexar array
        $alertas_filtradas = array_values($alertas_filtradas);
        
        echo json_encode([
            'success' => true,
            'data' => $alertas_filtradas,
            'estadisticas' => [
                'total' => count($alertas_filtradas),
                'criticas' => count(array_filter($alertas_filtradas, fn($a) => $a['prioridad'] === 'critico')),
                'altas' => count(array_filter($alertas_filtradas, fn($a) => $a['prioridad'] === 'alto')),
                'resueltas' => count(array_filter($alertas_filtradas, fn($a) => $a['estado'] === 'Resuelto'))
            ]
        ]);
        break;
        
    case 'PUT':
        // Resolver alerta
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id) && !empty($data->accion)) {
            $id_parts = explode('-', $data->id);
            $tipo = $id_parts[0];
            $id = $id_parts[1];
            
            if ($data->accion === 'resolver') {
                // Marcar como resuelto (en una implementación real, actualizaría la base de datos)
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Alerta marcada como resuelta'
                ]);
            } elseif ($data->accion === 'posponer' && !empty($data->nueva_fecha)) {
                // Posponer alerta (en una implementación real, actualizaría la fecha de vencimiento)
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Alerta pospuesta hasta ' . $data->nueva_fecha
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Acción no válida']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        break;
}
?>