<?php
// BACKEND/controller/sedesController.php - CONTROLADOR COMPLETO Y FUNCIONAL
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/Sede.php';
require_once '../models/Habilitacion.php';
require_once '../models/Documento.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Manejar preflight requests
if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Extraer el path del endpoint
    $path = parse_url($request_uri, PHP_URL_PATH);
    
    // Endpoints GET
    if ($method == 'GET') {
        // Obtener todas las sedes
        if (strpos($path, '/api/sedes') === 0 && !preg_match('/\/api\/sedes\/\d+/', $path)) {
            $sede = new Sede($db);
            
            // Obtener parámetros de filtro
            $search = $_GET['search'] ?? '';
            $provincia = $_GET['provincia'] ?? '';
            $estado = $_GET['estado'] ?? '';
            $tipo = $_GET['tipo'] ?? '';
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Usar el método leer() del modelo Sede
            $stmt = $sede->leer();
            $sedes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Aplicar filtros manualmente (por ahora)
            $sedesFiltradas = array_filter($sedes, function($sede) use ($search, $provincia, $estado, $tipo) {
                if ($search && stripos($sede['nombre'], $search) === false && stripos($sede['codigo'], $search) === false) {
                    return false;
                }
                if ($provincia && $provincia !== 'Todas las provincias' && $sede['provincia'] !== $provincia) {
                    return false;
                }
                if ($estado && $estado !== 'Todos los estados' && $sede['estado'] !== $estado) {
                    return false;
                }
                if ($tipo && $tipo !== 'Todos los tipos' && $sede['tipo'] !== $tipo) {
                    return false;
                }
                return true;
            });
            
            // Paginación
            $total = count($sedesFiltradas);
            $sedesPaginadas = array_slice($sedesFiltradas, $offset, $limit);
            
            echo json_encode([
                'success' => true,
                'data' => $sedesPaginadas,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
            
        // Obtener una sede específica
        } elseif (preg_match('/\/api\/sedes\/(\d+)$/', $path, $matches)) {
            $sede_id = $matches[1];
            $sede = new Sede($db);
            $sede->id = $sede_id;
            
            if ($sede->leerUno()) {
                $sede_data = [
                    'id' => $sede->id,
                    'codigo' => $sede->codigo ?? '',
                    'nombre' => $sede->nombre,
                    'tipo' => $sede->tipo ?? 'Sede',
                    'direccion' => $sede->direccion,
                    'localidad' => $sede->localidad,
                    'provincia' => $sede->provincia,
                    'telefono' => $sede->telefono,
                    'email' => $sede->email,
                    'responsable' => $sede->responsable ?? '',
                    'empresa_id' => $sede->empresa_id,
                    'tipo_predio' => $sede->tipo_predio ?? '',
                    'servicio_principal' => $sede->servicio_principal ?? '',
                    'habilitada' => $sede->habilitada,
                    'estado' => $sede->activo ? 'Activa' : 'Inactiva',
                    'created_at' => $sede->created_at,
                    'updated_at' => $sede->updated_at
                ];
                
                // Obtener habilitaciones de esta sede
                $habilitacion = new Habilitacion($db);
                $stmtHab = $habilitacion->obtenerPorEntidad('sede', $sede_id);
                $sede_data['habilitaciones'] = $stmtHab->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => $sede_data
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Sede no encontrada'
                ]);
            }
            
        // Obtener habilitaciones de una sede
        } elseif (preg_match('/\/api\/sedes\/(\d+)\/habilitaciones/', $path, $matches)) {
            $sede_id = $matches[1];
            $habilitacion = new Habilitacion($db);
            $stmt = $habilitacion->obtenerPorEntidad('sede', $sede_id);
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $habilitaciones,
                'count' => count($habilitaciones)
            ]);
            
        // Obtener documentos de una sede
        } elseif (preg_match('/\/api\/sedes\/(\d+)\/documentos/', $path, $matches)) {
            $sede_id = $matches[1];
            $documento = new Documento($db);
            $stmt = $documento->obtenerPorEntidad('sede', $sede_id);
            $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $documentos,
                'count' => count($documentos)
            ]);
        }
        
    // Endpoint POST - Crear sede
    } elseif ($method == 'POST' && strpos($path, '/api/sedes') === 0) {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['nombre']) || empty($data['codigo'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Faltan campos obligatorios: nombre, código'
            ]);
            exit();
        }
        
        $sede = new Sede($db);
        $sede->codigo = $data['codigo'];
        $sede->nombre = $data['nombre'];
        $sede->direccion = $data['direccion'] ?? '';
        $sede->localidad = $data['localidad'] ?? '';
        $sede->provincia = $data['provincia'] ?? '';
        $sede->telefono = $data['telefono'] ?? '';
        $sede->email = $data['email'] ?? '';
        $sede->responsable = $data['responsable'] ?? '';
        $sede->empresa_id = $data['empresa_id'] ?? null;
        $sede->tipo_predio = $data['tipo'] ?? 'Sede';
        $sede->servicio_principal = $data['base_operativa'] ?? '';
        $sede->habilitada = ($data['estado'] ?? 'Activa') === 'Activa' ? 1 : 0;
        $sede->activo = 1;
        
        if ($sede->crear()) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Sede creada exitosamente',
                'data' => [
                    'id' => $sede->id,
                    'codigo' => $sede->codigo,
                    'nombre' => $sede->nombre
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al crear la sede'
            ]);
        }
        
    // Endpoint PUT - Actualizar sede
    } elseif ($method == 'PUT' && preg_match('/\/api\/sedes\/(\d+)/', $path, $matches)) {
        $sede_id = $matches[1];
        $data = json_decode(file_get_contents("php://input"), true);
        
        $sede = new Sede($db);
        $sede->id = $sede_id;
        
        if (!$sede->leerUno()) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Sede no encontrada'
            ]);
            exit();
        }
        
        // Actualizar solo los campos que vienen en la data
        if (isset($data['nombre'])) $sede->nombre = $data['nombre'];
        if (isset($data['direccion'])) $sede->direccion = $data['direccion'];
        if (isset($data['localidad'])) $sede->localidad = $data['localidad'];
        if (isset($data['provincia'])) $sede->provincia = $data['provincia'];
        if (isset($data['telefono'])) $sede->telefono = $data['telefono'];
        if (isset($data['email'])) $sede->email = $data['email'];
        if (isset($data['responsable'])) $sede->responsable = $data['responsable'];
        if (isset($data['tipo'])) $sede->tipo_predio = $data['tipo'];
        if (isset($data['base_operativa'])) $sede->servicio_principal = $data['base_operativa'];
        if (isset($data['estado'])) $sede->habilitada = ($data['estado'] === 'Activa') ? 1 : 0;
        
        if ($sede->actualizar()) {
            echo json_encode([
                'success' => true,
                'message' => 'Sede actualizada exitosamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al actualizar la sede'
            ]);
        }
        
    // Endpoint DELETE - Eliminar sede
    } elseif ($method == 'DELETE' && preg_match('/\/api\/sedes\/(\d+)/', $path, $matches)) {
        $sede_id = $matches[1];
        
        $sede = new Sede($db);
        $sede->id = $sede_id;
        
        if (!$sede->leerUno()) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Sede no encontrada'
            ]);
            exit();
        }
        
        $sede->activo = 0;
        if ($sede->actualizar()) {
            echo json_encode([
                'success' => true,
                'message' => 'Sede eliminada exitosamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al eliminar la sede'
            ]);
        }
        
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Endpoint no encontrado'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor: ' . $e->getMessage()
    ]);
}
?>