<?php
// BACKEND/api/dashboard/estadisticas.php
header('Content-Type: application/json; charset=UTF-8');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Vehiculo.php';
require_once $base_path . '/models/Personal.php';
require_once $base_path . '/models/Proveedor.php';
require_once $base_path . '/models/Sede.php';
require_once $base_path . '/models/Documento.php';
require_once $base_path . '/models/Habilitacion.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Estadísticas de flota
    $vehiculo = new Vehiculo($db);
    $stmtVehiculos = $vehiculo->leer();
    $totalVehiculos = $stmtVehiculos->rowCount();
    
    // Contar vehículos por tipo - CORREGIDO: sin columna 'activo'
    $query = "SELECT tipo, COUNT(*) as total FROM vehiculos GROUP BY tipo";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $vehiculosPorTipo = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Vencimientos próximos de flota (30 días)
    $queryVencimientos = "SELECT COUNT(*) as total FROM vehiculos 
                          WHERE (vtv_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND vtv_vencimiento >= CURDATE())
                          OR (seguro_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND seguro_vencimiento >= CURDATE())
                          OR (hab_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND hab_vencimiento >= CURDATE())";
    $stmt = $db->prepare($queryVencimientos);
    $stmt->execute();
    $vencimientosFlota = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. Estadísticas de personal
    $personal = new Personal($db);
    $totalPersonal = $personal->contarConFiltros();
    
    // Certificados por vencer (30 días)
    $query = "SELECT COUNT(*) as total FROM personal 
              WHERE (vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND vencimiento_licencia >= CURDATE())
              OR (vencimiento_carnet <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND vencimiento_carnet >= CURDATE())";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $vencimientosPersonal = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 3. Estadísticas de sedes/empresas - CORREGIDO: sin columna 'activo'
    // Necesitarías implementar el método contar en Sede.php
    $query = "SELECT COUNT(*) as total FROM sedes";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totalSedes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Permisos vencidos o por vencer
    $query = "SELECT COUNT(*) as total FROM habilitaciones 
              WHERE entidad_tipo = 'sede' 
              AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
              AND estado = 'activo'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $vencimientosSedes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 4. Estadísticas de proveedores - CORREGIDO: sin columna 'activo'
    $proveedor = new Proveedor($db);
    $totalProveedores = $proveedor->contarConFiltros();
    
    // Contratos por renovar (30 días)
    $query = "SELECT COUNT(*) as total FROM proveedores 
              WHERE proximo_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
              AND proximo_vencimiento >= CURDATE()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $contratosPorRenovar = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Respuesta consolidada
    $response = [
        'success' => true,
        'data' => [
            'flota' => [
                'total' => $totalVehiculos,
                'vencimientos' => $vencimientosFlota,
                'por_tipo' => $vehiculosPorTipo
            ],
            'personal' => [
                'total' => $totalPersonal,
                'vencimientos' => $vencimientosPersonal
            ],
            'sedes' => [
                'total' => $totalSedes,
                'vencimientos' => $vencimientosSedes
            ],
            'proveedores' => [
                'total' => $totalProveedores,
                'contratos_por_renovar' => $contratosPorRenovar
            ],
            'general' => [
                'total_activos' => $totalVehiculos + $totalPersonal + $totalSedes + $totalProveedores,
                'total_vencimientos' => $vencimientosFlota + $vencimientosPersonal + $vencimientosSedes + $contratosPorRenovar,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener estadísticas',
        'error' => $e->getMessage()
    ]);
}
?>