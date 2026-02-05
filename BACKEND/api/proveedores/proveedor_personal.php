<?php
// BACKEND/api/proveedores/proveedor_personal.php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener personal de un proveedor
        if (isset($_GET['proveedor_id'])) {
            $proveedor_id = $_GET['proveedor_id'];
            $query = "SELECT * FROM proveedor_personal WHERE proveedor_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$proveedor_id]);
            $personal = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "data" => $personal
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID de proveedor requerido"]);
        }
        break;
        
    case 'POST':
        // Crear nuevo personal
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->proveedor_id) && !empty($data->nombre) && !empty($data->dni)) {
            // Verificar que el proveedor existe
            $query_check = "SELECT id FROM proveedores WHERE id = ?";
            $stmt_check = $db->prepare($query_check);
            $stmt_check->execute([$data->proveedor_id]);
            
            if ($stmt_check->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Proveedor no encontrado"]);
                break;
            }
            
            // Insertar nuevo personal
            $query = "INSERT INTO proveedor_personal 
                      (proveedor_id, nombre, dni, cargo, fecha_nacimiento, 
                       fecha_ingreso, seguro_vida, poliza_vida, observaciones) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            
            $result = $stmt->execute([
                $data->proveedor_id,
                $data->nombre,
                $data->dni,
                $data->cargo ?? '',
                $data->fecha_nacimiento ?? null,
                $data->fecha_ingreso ?? null,
                $data->seguro_vida ?? false,
                $data->poliza_vida ?? '',
                $data->observaciones ?? ''
            ]);
            
            if ($result) {
                $id = $db->lastInsertId();
                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Personal creado exitosamente",
                    "id" => $id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error al crear personal"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
        }
        break;
        
    case 'PUT':
        // Actualizar personal
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $query = "UPDATE proveedor_personal SET 
                      nombre = ?, dni = ?, cargo = ?, fecha_nacimiento = ?, 
                      fecha_ingreso = ?, seguro_vida = ?, poliza_vida = ?, 
                      observaciones = ?, updated_at = CURRENT_TIMESTAMP 
                      WHERE id = ?";
            $stmt = $db->prepare($query);
            
            $result = $stmt->execute([
                $data->nombre ?? '',
                $data->dni ?? '',
                $data->cargo ?? '',
                $data->fecha_nacimiento ?? null,
                $data->fecha_ingreso ?? null,
                $data->seguro_vida ?? false,
                $data->poliza_vida ?? '',
                $data->observaciones ?? '',
                $data->id
            ]);
            
            if ($result) {
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Personal actualizado"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error al actualizar"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID requerido"]);
        }
        break;
        
    case 'DELETE':
        // Eliminar personal (eliminación lógica)
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $query = "UPDATE proveedor_personal SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $db->prepare($query);
            $result = $stmt->execute([$data->id]);
            
            if ($result) {
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Personal eliminado"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error al eliminar"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID requerido"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
        break;
}
?>