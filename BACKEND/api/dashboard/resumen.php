<?php
// BACKEND/api/dashboard/resumen.php
header('Content-Type: application/json; charset=UTF-8');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Obtener contadores de cada módulo
    $totalVehiculos = 0;
    $totalPersonal = 0;
    $totalProveedores = 0;
    $totalSedes = 0;
    
    // Contar vehículos
    $stmt = $db->query("SELECT COUNT(*) as total FROM vehiculos");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalVehiculos = $row['total'];
    
    // Contar personal
    $stmt = $db->query("SELECT COUNT(*) as total FROM personal");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalPersonal = $row['total'];
    
    // Contar proveedores
    $stmt = $db->query("SELECT COUNT(*) as total FROM proveedores");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalProveedores = $row['total'];
    
    // Contar sedes
    $stmt = $db->query("SELECT COUNT(*) as total FROM sedes");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalSedes = $row['total'];
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_vehiculos' => $totalVehiculos,
            'total_personal' => $totalPersonal,
            'total_proveedores' => $totalProveedores,
            'total_sedes' => $totalSedes,
            'total_general' => $totalVehiculos + $totalPersonal + $totalProveedores + $totalSedes,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener resumen',
        'error' => $e->getMessage()
    ]);
}
?>
