<?php
// BACKEND/api/empresas/sedes.php - ENDPOINT COMPLETO PARA SEDES
header('Content-Type: application/json; charset=UTF-8');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

// Manejar preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Sede.php';
require_once $base_path . '/models/Habilitacion.php';
require_once $base_path . '/models/Documento.php';

// Crear conexión
$database = new Database();
$db = $database->getConnection();

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener ruta y parámetros
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remover /api/empresas/sedes del path
$path = preg_replace('|^/api/empresas/sedes|', '', $path);
$path_parts = array_filter(explode('/', trim($path, '/')));
$path_parts = array_values($path_parts);

$sede_id = $path_parts[0] ?? null;
$action = $path_parts[1] ?? null;
$action_id = $path_parts[2] ?? null;

try {
    switch ($method) {
        case 'GET':
            if ($sede_id) {
                // Obtener una sede específica
                if ($action === 'habilitaciones') {
                    // GET /api/empresas/sedes/{id}/habilitaciones
                    $habilitacion = new Habilitacion($db);
                    $stmt = $habilitacion->obtenerPorEntidad('sede', $sede_id);
                    $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $habilitaciones,
                        'count' => count($habilitaciones)
                    ]);
                    
                } elseif ($action === 'documentos') {
                    // GET /api/empresas/sedes/{id}/documentos
                    $documento = new Documento($db);
                    $stmt = $documento->obtenerPorEntidad('sede', $sede_id);
                    $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $documentos,
                        'count' => count($documentos)
                    ]);
                    
                } elseif ($action === 'bases') {
                    // GET /api/empresas/sedes/{id}/bases
                    $query = "SELECT * FROM bases_operativas WHERE sede_id = ? AND estado = 'Activa' ORDER BY nombre";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$sede_id]);
                    $bases = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $bases,
                        'count' => count($bases)
                    ]);
                    
                } else {
                    // GET /api/empresas/sedes/{id}
                    $sede = new Sede($db);
                    $sede->id = $sede_id;
                    
                    if ($sede->leerUno()) {
                        $sede_data = [
                            'id' => $sede->id,
                            'codigo' => $sede->codigo,
                            'nombre' => $sede->nombre,
                            'tipo' => $sede->tipo,
                            'direccion' => $sede->direccion,
                            'localidad' => $sede->localidad,
                            'provincia' => $sede->provincia,
                            'telefono' => $sede->telefono,
                            'email' => $sede->email,
                            'responsable' => $sede->responsable,
                            'tipo_habilitacion' => $sede->tipo_habilitacion,
                            'habilitacion_numero' => $sede->habilitacion_numero,
                            'vencimiento_habilitacion' => $sede->vencimiento_habilitacion,
                            'certificaciones' => $sede->certificaciones,
                            'seguridad_higiene' => $sede->seguridad_higiene,
                            'procesos_quimicos' => $sede->procesos_quimicos,
                            'vencimiento_procesos' => $sede->vencimiento_procesos,
                            'base_madre_copesa' => $sede->base_madre_copesa,
                            'base_operativa' => $sede->base_operativa,
                            'habilitada' => $sede->habilitada,
                            'estado' => $sede->estado,
                            'vehiculos_asignados' => $sede->vehiculos_asignados,
                            'permisos_por_vencer' => $sede->permisos_por_vencer,
                            'tipo_predio' => $sede->tipo_predio,
                            'servicio_principal' => $sede->servicio_principal,
                            'created_at' => $sede->created_at,
                            'updated_at' => $sede->updated_at
                        ];
                        
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
                }
            } else {
                // GET /api/empresas/sedes - Listar todas las sedes
                $sede = new Sede($db);
                
                // Obtener parámetros de filtro
                $search = $_GET['search'] ?? '';
                $provincia = $_GET['provincia'] ?? '';
                $estado = $_GET['estado'] ?? '';
                $tipo = $_GET['tipo'] ?? '';
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = ($page - 1) * $limit;
                
                // Obtener sedes con filtros
                $stmt = $sede->leerConFiltros($search, $provincia, $estado, $tipo, $limit, $offset);
                $sedes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Obtener total para paginación
                $total = $sede->contarConFiltros($search, $provincia, $estado, $tipo);
                
                // Obtener opciones para filtros
                $opciones = $sede->obtenerOpcionesFiltros();
                
                echo json_encode([
                    'success' => true,
                    'data' => $sedes,
                    'filters' => $opciones,
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
            // POST /api/empresas/sedes - Crear nueva sede
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['codigo']) || empty($data['nombre']) || empty($data['tipo_predio']) || empty($data['servicio_principal'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Faltan campos obligatorios: código, nombre, tipo_predio, servicio_principal'
                ]);
                exit();
            }
            
            $sede = new Sede($db);
            $sede->codigo = $data['codigo'];
            $sede->nombre = $data['nombre'];
            $sede->tipo = $data['tipo_predio'] ?? 'Sede'; // Mapeo correcto: tipo_predio -> tipo
            $sede->tipo_predio = $data['tipo_predio'] ?? '';
            $sede->servicio_principal = $data['servicio_principal'] ?? '';
            $sede->direccion = $data['direccion'] ?? '';
            $sede->localidad = $data['localidad'] ?? '';
            $sede->provincia = $data['provincia'] ?? '';
            $sede->telefono = $data['telefono'] ?? '';
            $sede->email = $data['email'] ?? '';
            $sede->responsable = $data['responsable'] ?? '';
            $sede->empresa_id = $data['empresa_id'] ?? null;
            $sede->tipo_habilitacion = $data['tipo_habilitacion'] ?? '';
            $sede->habilitacion_numero = $data['habilitacion_numero'] ?? '';
            $sede->vencimiento_habilitacion = $data['vencimiento_habilitacion'] ?? null;
            $sede->certificaciones = $data['certificaciones'] ?? '';
            $sede->seguridad_higiene = $data['seguridad_higiene'] ?? '';
            $sede->procesos_quimicos = $data['procesos_quimicos'] ?? '';
            $sede->vencimiento_procesos = $data['vencimiento_procesos'] ?? null;
            $sede->base_madre_copesa = $data['base_madre_copesa'] ?? 'No';
            $sede->base_operativa = $data['base_operativa'] ?? '';
            $sede->habilitada = $data['habilitada'] ?? 'Si';
            $sede->estado = $data['estado'] ?? 'Activa';
            $sede->vehiculos_asignados = $data['vehiculos_asignados'] ?? 0;
            $sede->permisos_por_vencer = $data['permisos_por_vencer'] ?? 0;
            $sede->tipo_predio = $data['tipo_predio'];
            $sede->servicio_principal = $data['servicio_principal'];
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
            break;
            
        case 'PUT':
            // PUT /api/empresas/sedes/{id} - Actualizar sede
            if ($sede_id) {
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
                if (isset($data['codigo'])) $sede->codigo = $data['codigo'];
                if (isset($data['nombre'])) $sede->nombre = $data['nombre'];
                if (isset($data['tipo'])) $sede->tipo = $data['tipo'];
                if (isset($data['direccion'])) $sede->direccion = $data['direccion'];
                if (isset($data['localidad'])) $sede->localidad = $data['localidad'];
                if (isset($data['provincia'])) $sede->provincia = $data['provincia'];
                if (isset($data['telefono'])) $sede->telefono = $data['telefono'];
                if (isset($data['email'])) $sede->email = $data['email'];
                if (isset($data['responsable'])) $sede->responsable = $data['responsable'];
                if (isset($data['empresa_id'])) $sede->empresa_id = $data['empresa_id'];
                if (isset($data['tipo_habilitacion'])) $sede->tipo_habilitacion = $data['tipo_habilitacion'];
                if (isset($data['habilitacion_numero'])) $sede->habilitacion_numero = $data['habilitacion_numero'];
                if (isset($data['vencimiento_habilitacion'])) $sede->vencimiento_habilitacion = $data['vencimiento_habilitacion'];
                if (isset($data['certificaciones'])) $sede->certificaciones = $data['certificaciones'];
                if (isset($data['seguridad_higiene'])) $sede->seguridad_higiene = $data['seguridad_higiene'];
                if (isset($data['procesos_quimicos'])) $sede->procesos_quimicos = $data['procesos_quimicos'];
                if (isset($data['vencimiento_procesos'])) $sede->vencimiento_procesos = $data['vencimiento_procesos'];
                if (isset($data['base_madre_copesa'])) $sede->base_madre_copesa = $data['base_madre_copesa'];
                if (isset($data['base_operativa'])) $sede->base_operativa = $data['base_operativa'];
                if (isset($data['estado'])) $sede->estado = $data['estado'];
                if (isset($data['vehiculos_asignados'])) $sede->vehiculos_asignados = $data['vehiculos_asignados'];
                if (isset($data['permisos_por_vencer'])) $sede->permisos_por_vencer = $data['permisos_por_vencer'];
                if (isset($data['vencimiento_procesos'])) $sede->vencimiento_procesos = $data['vencimiento_procesos'];
                if (isset($data['base_madre_copesa'])) $sede->base_madre_copesa = $data['base_madre_copesa'];
                if (isset($data['base_operativa'])) $sede->base_operativa = $data['base_operativa'];
                if (isset($data['estado'])) $sede->estado = $data['estado'];
                if (isset($data['activo'])) $sede->activo = $data['activo'];
                if (isset($data['vehiculos_asignados'])) $sede->vehiculos_asignados = $data['vehiculos_asignados'];
                if (isset($data['permisos_por_vencer'])) $sede->permisos_por_vencer = $data['permisos_por_vencer'];
                
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
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'ID de sede no especificado'
                ]);
            }
            break;
            
        case 'DELETE':
            // DELETE /api/empresas/sedes/{id} - Eliminar sede (lógica)
            if ($sede_id) {
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
                $sede->estado = 'Inactiva';
                
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
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'ID de sede no especificado'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Método no permitido'
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor: ' . $e->getMessage()
    ]);
}
?>