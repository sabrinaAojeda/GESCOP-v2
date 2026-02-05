<?php
// BACKEND/controller/documentosController.php
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/Documento.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($method == 'POST') {
        // Verificar si es upload de archivo
        if (isset($_FILES['archivo']) && isset($_POST['entidad_tipo']) && isset($_POST['entidad_id'])) {
            $entidad_tipo = $_POST['entidad_tipo'];
            $entidad_id = $_POST['entidad_id'];
            $descripcion = $_POST['descripcion'] ?? '';
            
            // Directorio de uploads
            $uploadDir = '../uploads/documentos/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $file = $_FILES['archivo'];
            $fileName = time() . '_' . basename($file['name']);
            $filePath = $uploadDir . $fileName;
            
            // Validar tipo de archivo
            $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG.');
            }
            
            // Validar tamaño (máx 10MB)
            if ($file['size'] > 10 * 1024 * 1024) {
                throw new Exception('El archivo es demasiado grande. Máximo 10MB.');
            }
            
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $documento = new Documento($db);
                $documento->entidad_tipo = $entidad_tipo;
                $documento->entidad_id = $entidad_id;
                $documento->nombre = $file['name'];
                $documento->ruta = $fileName;
                $documento->tipo = $file['type'];
                $documento->tamaño = $file['size'];
                $documento->descripcion = $descripcion;
                
                if ($documento->crear()) {
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Documento subido exitosamente',
                        'data' => [
                            'id' => $documento->id,
                            'nombre' => $documento->nombre,
                            'ruta' => $documento->ruta
                        ]
                    ]);
                } else {
                    throw new Exception('Error al guardar el documento en la base de datos');
                }
            } else {
                throw new Exception('Error al subir el archivo');
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Faltan datos: archivo, entidad_tipo, entidad_id'
            ]);
        }
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Método no permitido'
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