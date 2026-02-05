<?php
// BACKEND/api/empresas/bases_operativas.php - CRUD COMPLETO
header('Content-Type: application/json; charset=UTF-8');

// Manejar preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';

// Crear conexión
$database = new Database();
$db = $database->getConnection();

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener ruta y parámetros
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remover /api/bases_operativas del path
$path = preg_replace('|^/api/bases_operativas|', '', $path);
$path_parts = array_filter(explode('/', trim($path, '/')));
$path_parts = array_values($path_parts);

$id = $path_parts[0] ?? null;
$action = $path_parts[1] ?? null;

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                // GET /api/bases_operativas/{id} - Obtener una base específica
                $query = "SELECT bo.*, s.nombre as sede_nombre, s.codigo as sede_codigo 
                         FROM bases_operativas bo 
                         LEFT JOIN sedes s ON bo.sede_id = s.id 
                         WHERE bo.id = ? AND bo.estado = 'Activa'";
                $stmt = $db->prepare($query);
                $stmt->execute([$id]);
                
                $base = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($base) {
                    echo json_encode([
                        'success' => true,
                        'data' => $base
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Base operativa no encontrada'
                    ]);
                }
            } else {
                // GET /api/bases_operativas - Listar todas o filtradas por sede
                $sede_id = $_GET['sede_id'] ?? null;
                $search = $_GET['search'] ?? '';
                $tipo = $_GET['tipo'] ?? '';
                
                $query = "SELECT bo.*, s.nombre as sede_nombre, s.codigo as sede_codigo 
                         FROM bases_operativas bo 
                         LEFT JOIN sedes s ON bo.sede_id = s.id 
                         WHERE bo.estado = 'Activa'";
                
                $params = [];
                
                if ($sede_id) {
                    $query .= " AND bo.sede_id = ?";
                    $params[] = $sede_id;
                }
                
                if (!empty($search)) {
                    $query .= " AND (bo.nombre LIKE ? OR bo.responsable LIKE ?)";
                    $search_term = "%$search%";
                    $params[] = $search_term;
                    $params[] = $search_term;
                }
                
                if (!empty($tipo) && $tipo !== 'Todos los tipos') {
                    $query .= " AND bo.tipo = ?";
                    $params[] = $tipo;
                }
                
                $query .= " ORDER BY bo.nombre";
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                
                $bases = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Obtener tipos únicos para filtros
                $tipos_query = "SELECT DISTINCT tipo FROM bases_operativas WHERE estado = 'Activa' ORDER BY tipo";
                $tipos_stmt = $db->prepare($tipos_query);
                $tipos_stmt->execute();
                $tipos = $tipos_stmt->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode([
                    'success' => true,
                    'data' => $bases,
                    'filters' => [
                        'tipos' => $tipos
                    ],
                    'count' => count($bases)
                ]);
            }
            break;
            
        case 'POST':
            // POST /api/bases_operativas - Crear nueva base operativa
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['sede_id']) || empty($data['nombre']) || empty($data['tipo'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Faltan campos obligatorios: sede_id, nombre, tipo'
                ]);
                exit();
            }
            
            // Verificar que la sede exista
            $check_query = "SELECT id FROM sedes WHERE id = ?";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->execute([$data['sede_id']]);
            
            if ($check_stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Sede no encontrada o inactiva'
                ]);
                exit();
            }
            
            $query = "INSERT INTO bases_operativas 
                      (sede_id, nombre, tipo, responsable, habilitacion_especifica, 
                       vencimiento_habilitacion, observaciones, estado) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($query);
            
            $params = [
                $data['sede_id'],
                $data['nombre'],
                $data['tipo'],
                $data['responsable'] ?? null,
                $data['habilitacion_especifica'] ?? null,
                $data['vencimiento_habilitacion'] ?? null,
                $data['observaciones'] ?? null,
                $data['estado'] ?? 'Activa'
            ];
            
            if ($stmt->execute($params)) {
                $id = $db->lastInsertId();
                
                // Actualizar contador en sede
                $update_sede_query = "UPDATE sedes SET permisos_por_vencer = permisos_por_vencer + 1 WHERE id = ?";
                $update_stmt = $db->prepare($update_sede_query);
                $update_stmt->execute([$data['sede_id']]);
                
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Base operativa creada exitosamente',
                    'data' => ['id' => $id]
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Error al crear base operativa'
                ]);
            }
            break;
            
        case 'PUT':
            // PUT /api/bases_operativas/{id} - Actualizar base operativa
            if ($id) {
                $data = json_decode(file_get_contents("php://input"), true);
                
                // Verificar que exista
                $check_query = "SELECT id, sede_id FROM bases_operativas WHERE id = ?";
                $check_stmt = $db->prepare($check_query);
                $check_stmt->execute([$id]);
                
                if ($check_stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Base operativa no encontrada'
                    ]);
                    exit();
                }
                
                $old_base = $check_stmt->fetch(PDO::FETCH_ASSOC);
                $sede_id = $old_base['sede_id'];
                
                // Verificar que la nueva sede exista si se cambia
                if (isset($data['sede_id']) && $data['sede_id'] != $sede_id) {
                    $check_sede_query = "SELECT id FROM sedes WHERE id = ?";
                    $check_sede_stmt = $db->prepare($check_sede_query);
                    $check_sede_stmt->execute([$data['sede_id']]);
                    
                    if ($check_sede_stmt->rowCount() === 0) {
                        http_response_code(404);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Nueva sede no encontrada o inactiva'
                        ]);
                        exit();
                    }
                }
                
                $query = "UPDATE bases_operativas 
                          SET nombre = ?, tipo = ?, responsable = ?, 
                              habilitacion_especifica = ?, vencimiento_habilitacion = ?, 
                              observaciones = ?, estado = ?,
                              sede_id = COALESCE(?, sede_id)
                          WHERE id = ?";
                
                $stmt = $db->prepare($query);
                
                $params = [
                    $data['nombre'] ?? '',
                    $data['tipo'] ?? '',
                    $data['responsable'] ?? null,
                    $data['habilitacion_especifica'] ?? null,
                    $data['vencimiento_habilitacion'] ?? null,
                    $data['observaciones'] ?? null,
                    $data['estado'] ?? 'Activa',
                    $data['sede_id'] ?? null,
                    $id
                ];
                
                if ($stmt->execute($params)) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Base operativa actualizada exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al actualizar base operativa'
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'ID no especificado'
                ]);
            }
            break;
            
        case 'DELETE':
            // DELETE /api/bases_operativas/{id} - Eliminar base operativa (lógica)
            if ($id) {
                // Verificar que exista y obtener sede_id
                $check_query = "SELECT id, sede_id FROM bases_operativas WHERE id = ?";
                $check_stmt = $db->prepare($check_query);
                $check_stmt->execute([$id]);
                
                if ($check_stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Base operativa no encontrada'
                    ]);
                    exit();
                }
                
                $base = $check_stmt->fetch(PDO::FETCH_ASSOC);
                $sede_id = $base['sede_id'];
                
                $query = "UPDATE bases_operativas SET estado = 'Inactiva' WHERE id = ?";
                $stmt = $db->prepare($query);
                
                if ($stmt->execute([$id])) {
                    // Actualizar contador en sede
                    $update_sede_query = "UPDATE sedes SET permisos_por_vencer = GREATEST(permisos_por_vencer - 1, 0) WHERE id = ?";
                    $update_stmt = $db->prepare($update_sede_query);
                    $update_stmt->execute([$sede_id]);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Base operativa eliminada exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al eliminar base operativa'
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'ID no especificado'
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