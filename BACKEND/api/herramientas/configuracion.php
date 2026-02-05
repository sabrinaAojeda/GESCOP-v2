<?php
// BACKEND/api/herramientas/configuracion.php - ENDPOINT DE CONFIGURACIÓN

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Archivo para almacenar configuración
$configFile = dirname(__DIR__, 2) . '/config.json';

// Funciones helper
function loadConfig($file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function saveConfig($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function getDefaultConfig() {
    return [
        // Alertas
        'diasVTV' => 30,
        'diasSeguro' => 45,
        'diasLicencias' => 60,
        'diasMantenimiento' => 15,
        
        // Email
        'emailNotificaciones' => 'gestiondocumental@copesa-ar.com',
        
        // Seguridad
        'tiempoSesion' => 120,
        'intentosLogin' => 3,
        
        // Habilitaciones Copesa
        'tiposHabilitacion' => ['Generador', 'Operador', 'Transportista', 'Gestor'],
        'basesOperativas' => ['Incineración', 'Tratamiento', 'Almacenamiento', 'Logística'],
        
        // Reportes
        'reporteSemanalAutomatico' => false,
        'diaReporteSemanal' => 'Lunes',
        'mantenerReportesMeses' => 12,
        
        // Timestamps
        'updated_at' => date('Y-m-d H:i:s')
    ];
}

try {
    switch ($method) {
        case 'GET':
            // Obtener configuración
            $config = loadConfig($configFile);
            
            // Si no hay configuración guardada, usar valores por defecto
            if (empty($config)) {
                $config = getDefaultConfig();
            }
            
            echo json_encode([
                'success' => true,
                'data' => $config
            ]);
            break;
            
        case 'PUT':
            // Actualizar configuración
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !is_array($data)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Datos inválidos'
                ]);
                exit;
            }
            
            // Cargar configuración actual
            $config = loadConfig($configFile);
            
            // Actualizar solo los campos recibidos
            foreach ($data as $key => $value) {
                $config[$key] = $value;
            }
            $config['updated_at'] = date('Y-m-d H:i:s');
            
            // Guardar configuración
            if (saveConfig($configFile, $config)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Configuración guardada exitosamente',
                    'data' => $config
                ]);
            } else {
                throw new Exception('Error al guardar configuración');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Método no permitido'
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
