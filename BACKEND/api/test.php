<?php
// TEST API - Verifica que los headers CORS se envíen correctamente
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

echo json_encode([
    'success' => true,
    'message' => 'API TEST - FUNCIONANDO',
    'time' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'php_version' => phpversion()
]);
?>
