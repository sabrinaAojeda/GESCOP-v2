<?php
// BACKEND/api/proveedores/documentos_proveedor.php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener documentos de un proveedor específico
        if (isset($_GET['proveedor_id'])) {
            $proveedor_id = $_GET['proveedor_id'];
            $query = "SELECT * FROM proveedor_documentos WHERE proveedor_id = ? ORDER BY fecha_vencimiento ASC";
            $stmt = $db->prepare($query);
            $stmt->execute([$proveedor_id]);
            $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "data" => $documentos
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID de proveedor requerido"]);
        }
        break;
        
    case 'POST':
        // Subir documento
        if (isset($_POST['proveedor_id']) && isset($_FILES['archivo'])) {
            $proveedor_id = $_POST['proveedor_id'];
            $tipo_documento = $_POST['tipo_documento'] ?? 'otro';
            $nombre_documento = $_POST['nombre_documento'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $fecha_vencimiento = $_POST['fecha_vencimiento'] ?? null;
            
            // Validar que el proveedor existe
            $query_check = "SELECT id FROM proveedores WHERE id = ?";
            $stmt_check = $db->prepare($query_check);
            $stmt_check->execute([$proveedor_id]);
            
            if ($stmt_check->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Proveedor no encontrado"]);
                break;
            }
            
            // Usar paths absolutos para evitar problemas de include
            $base_path = dirname(__FILE__, 3); // public_html/
            
            // Subir archivo
            $upload_dir = $base_path . '/../../uploads/proveedores/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            $file_name = time() . '_' . basename($_FILES['archivo']['name']);
            $file_path = $upload_dir . $file_name;
            
            if (move_uploaded_file($_FILES['archivo']['tmp_name'], $file_path)) {
                // Insertar en base de datos
                $query = "INSERT INTO proveedor_documentos 
                          (proveedor_id, tipo_documento, nombre_documento, descripcion, 
                           archivo_path, fecha_vencimiento) 
                          VALUES (?, ?, ?, ?, ?, ?)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $proveedor_id,
                    $tipo_documento,
                    $nombre_documento,
                    $descripcion,
                    $file_name,
                    $fecha_vencimiento
                ]);
                
                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Documento subido exitosamente",
                    "file_path" => $file_name
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error al subir archivo"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
        }
        break;
        
    case 'DELETE':
        // Eliminar documento
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            // Primero obtener información del archivo
            $query_get = "SELECT archivo_path FROM proveedor_documentos WHERE id = ?";
            $stmt_get = $db->prepare($query_get);
            $stmt_get->execute([$data->id]);
            $documento = $stmt_get->fetch(PDO::FETCH_ASSOC);
            
            if ($documento) {
                // Eliminar de base de datos
                $query_delete = "DELETE FROM proveedor_documentos WHERE id = ?";
                $stmt_delete = $db->prepare($query_delete);
                $stmt_delete->execute([$data->id]);
                
                // Eliminar archivo físico
                $file_path = $base_path . '/../../uploads/proveedores/' . $documento['archivo_path'];
                if (file_exists($file_path)) {
                    unlink($file_path);
                }
                
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Documento eliminado"]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Documento no encontrado"]);
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