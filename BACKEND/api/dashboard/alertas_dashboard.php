<?php
// BACKEND/api/dashboard/alertas_dashboard.php
header('Content-Type: application/json; charset=UTF-8');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $alertas = [];
    $hoy = date('Y-m-d');
    
    // 1. Vehículos con VTV próxima a vencer (7 días)
    $stmt = $db->query("SELECT interno, modelo, vtv_vencimiento FROM vehiculos 
                        WHERE vtv_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alertas[] = [
            'tipo' => 'vehiculo',
            'severidad' => 'alta',
            'titulo' => 'VTV próxima a vencer',
            'mensaje' => "Vehículo #{$row['interno']} - {$row['modelo']}",
            'fecha' => $row['vtv_vencimiento'],
            'dias_restantes' => floor((strtotime($row['vtv_vencimiento']) - strtotime($hoy)) / 86400)
        ];
    }
    
    // 2. Vehículos con seguro próxima a vencer (7 días)
    $stmt = $db->query("SELECT interno, modelo, seguro_vencimiento FROM vehiculos 
                        WHERE seguro_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alertas[] = [
            'tipo' => 'vehiculo',
            'severidad' => 'alta',
            'titulo' => 'Seguro próximo a vencer',
            'mensaje' => "Vehículo #{$row['interno']} - {$row['modelo']}",
            'fecha' => $row['seguro_vencimiento'],
            'dias_restantes' => floor((strtotime($row['seguro_vencimiento']) - strtotime($hoy)) / 86400)
        ];
    }
    
    // 3. Personal con licencia próxima a vencer (30 días)
    $stmt = $db->query("SELECT dni, nombre, apellido, vencimiento_licencia FROM personal 
                        WHERE vencimiento_licencia BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                        AND vencimiento_licencia IS NOT NULL");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alertas[] = [
            'tipo' => 'personal',
            'severidad' => 'media',
            'titulo' => 'Licencia próxima a vencer',
            'mensaje' => "{$row['nombre']} {$row['apellido']} (DNI: {$row['dni']})",
            'fecha' => $row['vencimiento_licencia'],
            'dias_restantes' => floor((strtotime($row['vencimiento_licencia']) - strtotime($hoy)) / 86400)
        ];
    }
    
    // 4. Proveedores con contrato próximo a vencer (30 días)
    $stmt = $db->query("SELECT codigo, razon_social, proximo_vencimiento FROM proveedores 
                        WHERE proximo_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                        AND proximo_vencimiento IS NOT NULL");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alertas[] = [
            'tipo' => 'proveedor',
            'severidad' => 'baja',
            'titulo' => 'Contrato próximo a renovar',
            'mensaje' => "{$row['razon_social']} (Código: {$row['codigo']})",
            'fecha' => $row['proximo_vencimiento'],
            'dias_restantes' => floor((strtotime($row['proximo_vencimiento']) - strtotime($hoy)) / 86400)
        ];
    }
    
    // Ordenar por días restantes (más urgentes primero)
    usort($alertas, function($a, $b) {
        return $a['dias_restantes'] - $b['dias_restantes'];
    });
    
    echo json_encode([
        'success' => true,
        'data' => $alertas,
        'total' => count($alertas),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener alertas',
        'error' => $e->getMessage()
    ]);
}
?>
