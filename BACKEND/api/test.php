<?php
// BACKEND/api/test.php - Diagnóstico simple
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");

// Responder OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    "status" => "ok",
    "timestamp" => date('Y-m-d H:i:s'),
    "php_version" => PHP_VERSION,
    "server" => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    "document_root" => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    "request_uri" => $_SERVER['REQUEST_URI'] ?? 'Unknown',
    "request_method" => $_SERVER['REQUEST_METHOD'],
    "test_database" => false,
    "test_database_error" => null
];

// Testear conexión a base de datos
try {
    $config_file = dirname(__FILE__) . '/../config/database.php';
    if (file_exists($config_file)) {
        require_once $config_file;
        $database = new Database();
        $db = $database->getConnection();
        
        if ($db) {
            $response["test_database"] = true;
            
            // Test simple de query
            $stmt = $db->query("SELECT 1 as test");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $response["database_query_test"] = $result;
        } else {
            $response["test_database_error"] = "No se pudo obtener conexión";
        }
    } else {
        $response["test_database_error"] = "Archivo database.php no encontrado en: " . $config_file;
    }
} catch (Exception $e) {
    $response["test_database_error"] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
