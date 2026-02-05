<?php
// BACKEND/controller/basesOperativasController.php - CONTROLADOR COMPLETO
header('Content-Type: application/json');

require_once '../config/database.php';

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
    $path = parse_url($request_uri, PHP_URL_PATH);
    
    if ($method == 'GET') {
        // Obtener bases operativas de una sede específica
        if (preg_match('/\/api\/sedes\/(\d+)\/bases-operativas/', $path, $matches)) {
            $sede_id = $matches[1];
            
            $query = "SELECT * FROM bases_operativas WHERE sede_id = :sede_id AND estado = 'Activa' ORDER BY nombre";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':sede_id', $sede_id);
            $stmt->execute();
            
            $bases = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $bases,
                'count' => count($bases)
            ]);
            
        // Obtener una base operativa específica
        } elseif (preg_match('/\/api\/bases-operativas\/(\d+)/', $path, $matches)) {
            $base_id = $matches[1];
            
            $query = "SELECT bo.*, s.nombre as sede_nombre 
                     FROM bases_operativas bo 
                     LEFT JOIN sedes s ON bo.sede_id = s.id 
                     WHERE bo.id = :id AND bo.estado = 'Activa'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $base_id);
            $stmt->execute();
            
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
        }
        
    } elseif ($method == 'POST') {
        // Crear nueva base operativa
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['sede_id']) || empty($data['nombre']) || empty($data['tipo'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Faltan campos obligatorios: sede_id, nombre, tipo'
            ]);
            exit();
        }
        
        $query = "INSERT INTO bases_operativas 
                  (sede_id, nombre, tipo, responsable, habilitacion_especifica, 
                   vencimiento_habilitacion, observaciones, estado) 
                  VALUES (:sede_id, :nombre, :tipo, :responsable, :habilitacion_especifica, 
                          :vencimiento_habilitacion, :observaciones, :estado)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':sede_id', $data['sede_id']);
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':tipo', $data['tipo']);
        $stmt->bindParam(':responsable', $data['responsable'] ?? null);
        $stmt->bindParam(':habilitacion_especifica', $data['habilitacion_especifica'] ?? null);
        $stmt->bindParam(':vencimiento_habilitacion', $data['vencimiento_habilitacion'] ?? null);
        $stmt->bindParam(':observaciones', $data['observaciones'] ?? null);
        $stmt->bindParam(':estado', $data['estado'] ?? 'Activa');
        
        if ($stmt->execute()) {
            $id = $db->lastInsertId();
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
        
    } elseif ($method == 'PUT' && preg_match('/\/api\/bases-operativas\/(\d+)/', $path, $matches)) {
        // Actualizar base operativa
        $base_id = $matches[1];
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE bases_operativas 
                  SET nombre = :nombre, tipo = :tipo, responsable = :responsable,
                      habilitacion_especifica = :habilitacion_especifica,
                      vencimiento_habilitacion = :vencimiento_habilitacion,
                      observaciones = :observaciones, estado = :estado
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $base_id);
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':tipo', $data['tipo']);
        $stmt->bindParam(':responsable', $data['responsable'] ?? null);
        $stmt->bindParam(':habilitacion_especifica', $data['habilitacion_especifica'] ?? null);
        $stmt->bindParam(':vencimiento_habilitacion', $data['vencimiento_habilitacion'] ?? null);
        $stmt->bindParam(':observaciones', $data['observaciones'] ?? null);
        $stmt->bindParam(':estado', $data['estado'] ?? 'Activa');
        
        if ($stmt->execute()) {
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
        
    } elseif ($method == 'DELETE' && preg_match('/\/api\/bases-operativas\/(\d+)/', $path, $matches)) {
        // Eliminar base operativa (lógica)
        $base_id = $matches[1];
        
        $query = "UPDATE bases_operativas SET estado = 'Inactiva' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $base_id);
        
        if ($stmt->execute()) {
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