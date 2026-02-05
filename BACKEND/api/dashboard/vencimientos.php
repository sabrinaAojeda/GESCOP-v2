<?php
// BACKEND/api/dashboard/vencimientos.php
header('Content-Type: application/json; charset=UTF-8');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Vehiculo.php';
require_once $base_path . '/models/Personal.php';
require_once $base_path . '/models/Proveedor.php';
require_once $base_path . '/models/Documento.php';
require_once $base_path . '/models/Habilitacion.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$database = new Database();
$db = $database->getConnection();

try {
    $vencimientos = [];
    $today = date('Y-m-d');
    $limit = 50; // Límite de resultados

    // Obtener filtros
    $tipo = $_GET['tipo'] ?? '';
    $estado = $_GET['estado'] ?? '';
    $fecha = $_GET['fecha'] ?? '';

    // 1. Vencimientos de vehículos
    $vehiculo = new Vehiculo($db);
    $queryVehiculos = "SELECT 
        interno as item,
        modelo as detalle,
        CASE 
            WHEN vtv_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'VTV'
            WHEN seguro_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Seguro'
            WHEN hab_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Habilitación'
        END as tipo,
        CASE 
            WHEN vtv_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN vtv_vencimiento
            WHEN seguro_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN seguro_vencimiento
            WHEN hab_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN hab_vencimiento
        END as fecha_vencimiento,
        CASE 
            WHEN vtv_vencimiento < CURDATE() THEN 'Vencido'
            WHEN vtv_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Por vencer'
            WHEN seguro_vencimiento < CURDATE() THEN 'Vencido'
            WHEN seguro_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Por vencer'
            WHEN hab_vencimiento < CURDATE() THEN 'Vencido'
            WHEN hab_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Por vencer'
            ELSE 'Vigente'
        END as estado,
        1 as documentos,
        DATEDIFF(
            CASE 
                WHEN vtv_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN vtv_vencimiento
                WHEN seguro_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN seguro_vencimiento
                WHEN hab_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN hab_vencimiento
            END,
            CURDATE()
        ) as dias_restantes
    FROM vehiculos 
    WHERE (vtv_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
        OR seguro_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        OR hab_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
    AND (vtv_vencimiento >= CURDATE() 
        OR seguro_vencimiento >= CURDATE() 
        OR hab_vencimiento >= CURDATE()
        OR vtv_vencimiento < CURDATE() 
        OR seguro_vencimiento < CURDATE() 
        OR hab_vencimiento < CURDATE())";
    
    if ($tipo && $tipo !== 'Todos los tipos') {
        $queryVehiculos .= " AND (
            (tipo = 'VTV' AND :tipo = 'VTV') OR
            (tipo = 'Seguro' AND :tipo = 'Seguro') OR
            (tipo = 'Habilitación' AND :tipo = 'Habilitación')
        )";
    }
    
    $stmt = $db->prepare($queryVehiculos);
    if ($tipo && $tipo !== 'Todos los tipos') {
        $stmt->bindParam(':tipo', $tipo);
    }
    $stmt->execute();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $vencimientos[] = [
            'id' => 'VEH-' . $row['item'],
            'item' => $row['item'],
            'detalle' => $row['detalle'],
            'tipo' => $row['tipo'],
            'vencimiento' => date('d/m/Y', strtotime($row['fecha_vencimiento'])),
            'estado' => $row['estado'],
            'documentos' => $row['documentos'],
            'dias_restantes' => $row['dias_restantes'],
            'entidad_tipo' => 'vehiculo',
            'entidad_id' => $row['item']
        ];
    }

    // 2. Vencimientos de personal
    $personal = new Personal($db);
    $queryPersonal = "SELECT 
        dni as item,
        CONCAT(nombre, ' ', apellido) as detalle,
        'Certificado' as tipo,
        vencimiento_licencia as fecha_vencimiento,
        CASE 
            WHEN vencimiento_licencia < CURDATE() THEN 'Vencido'
            WHEN vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Por vencer'
            ELSE 'Vigente'
        END as estado,
        1 as documentos,
        DATEDIFF(vencimiento_licencia, CURDATE()) as dias_restantes
    FROM personal 
    WHERE vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND vencimiento_licencia IS NOT NULL";
    
    if ($tipo && $tipo !== 'Todos los tipos' && $tipo === 'Certificado') {
        $queryPersonal .= " AND :tipo = 'Certificado'";
    }
    
    $stmt = $db->prepare($queryPersonal);
    if ($tipo && $tipo !== 'Todos los tipos' && $tipo === 'Certificado') {
        $stmt->bindParam(':tipo', $tipo);
    }
    $stmt->execute();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $vencimientos[] = [
            'id' => 'PERS-' . $row['item'],
            'item' => $row['item'],
            'detalle' => $row['detalle'],
            'tipo' => $row['tipo'],
            'vencimiento' => date('d/m/Y', strtotime($row['fecha_vencimiento'])),
            'estado' => $row['estado'],
            'documentos' => $row['documentos'],
            'dias_restantes' => $row['dias_restantes'],
            'entidad_tipo' => 'personal',
            'entidad_id' => $row['item']
        ];
    }

    // 3. Vencimientos de proveedores
    $proveedor = new Proveedor($db);
    $queryProveedores = "SELECT 
        codigo as item,
        razon_social as detalle,
        'Contrato' as tipo,
        proximo_vencimiento as fecha_vencimiento,
        CASE 
            WHEN proximo_vencimiento < CURDATE() THEN 'Vencido'
            WHEN proximo_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Por vencer'
            ELSE 'Vigente'
        END as estado,
        1 as documentos,
        DATEDIFF(proximo_vencimiento, CURDATE()) as dias_restantes
    FROM proveedores 
    WHERE proximo_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND proximo_vencimiento IS NOT NULL";
    
    if ($tipo && $tipo !== 'Todos los tipos' && $tipo === 'Contrato') {
        $queryProveedores .= " AND :tipo = 'Contrato'";
    }
    
    $stmt = $db->prepare($queryProveedores);
    if ($tipo && $tipo !== 'Todos los tipos' && $tipo === 'Contrato') {
        $stmt->bindParam(':tipo', $tipo);
    }
    $stmt->execute();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $vencimientos[] = [
            'id' => 'PROV-' . $row['item'],
            'item' => $row['item'],
            'detalle' => $row['detalle'],
            'tipo' => $row['tipo'],
            'vencimiento' => date('d/m/Y', strtotime($row['fecha_vencimiento'])),
            'estado' => $row['estado'],
            'documentos' => $row['documentos'],
            'dias_restantes' => $row['dias_restantes'],
            'entidad_tipo' => 'proveedor',
            'entidad_id' => $row['item']
        ];
    }

    // Aplicar filtros adicionales
    $vencimientosFiltrados = array_filter($vencimientos, function($v) use ($estado, $fecha) {
        $match = true;
        
        if ($estado && $estado !== 'Todos los estados') {
            if ($estado === 'Vencido' && $v['estado'] !== 'Vencido') $match = false;
            if ($estado === 'Por vencer' && $v['estado'] !== 'Por vencer') $match = false;
            if ($estado === 'Vigente' && $v['estado'] !== 'Vigente') $match = false;
        }
        
        if ($fecha) {
            $fechaVencimiento = DateTime::createFromFormat('d/m/Y', $v['vencimiento']);
            $fechaFiltro = DateTime::createFromFormat('Y-m-d', $fecha);
            if ($fechaVencimiento->format('Y-m-d') != $fechaFiltro->format('Y-m-d')) {
                $match = false;
            }
        }
        
        return $match;
    });

    // Ordenar por fecha de vencimiento (más próximos primero)
    usort($vencimientosFiltrados, function($a, $b) {
        return strtotime($a['vencimiento']) - strtotime($b['vencimiento']);
    });

    // Limitar resultados
    $vencimientosFiltrados = array_slice($vencimientosFiltrados, 0, $limit);

    echo json_encode([
        'success' => true,
        'data' => $vencimientosFiltrados,
        'total' => count($vencimientosFiltrados),
        'filtros_aplicados' => [
            'tipo' => $tipo,
            'estado' => $estado,
            'fecha' => $fecha
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener vencimientos',
        'error' => $e->getMessage()
    ]);
}
?>