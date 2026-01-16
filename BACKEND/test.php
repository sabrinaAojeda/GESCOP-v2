<?php
// BACKEND/api/test.php - Archivo para probar conexión
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    'success' => true,
    'message' => '✅ API funcionando correctamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'],
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'request_uri' => $_SERVER['REQUEST_URI']
    ],
    'api_endpoints' => [
        'personal' => [
            'GET /api/personal/get_personal.php' => 'Obtener personal',
            'POST /api/personal/create_personal.php' => 'Crear personal',
            'PUT /api/personal/update_personal.php' => 'Actualizar personal',
            'DELETE /api/personal/delete_personal.php' => 'Eliminar personal'
        ]
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>