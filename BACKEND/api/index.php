<?php
// BACKEND/api/index.php - VERSIÓN CORREGIDA Y COMPLETA
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Max-Age: 3600');

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ERROR REPORTING EN DESARROLLO
if (isset($_SERVER['ENVIRONMENT']) && $_SERVER['ENVIRONMENT'] === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Registrar el request para debugging
error_log("🌐 [API_REQUEST] " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

// Cargar configuración de base de datos
$config_file = dirname(__FILE__) . '/../../config/database.php';
if (file_exists($config_file)) {
    require_once $config_file;
} else {
    error_log("⚠️ [API] No se encontró database.php en: $config_file");
}

// Función para manejar errores
function handleError($message, $code = 500, $exception = null) {
    error_log("💥 [API_ERROR] $message" . ($exception ? " - " . $exception->getMessage() : ""));
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'error' => $exception ? $exception->getMessage() : null,
        'timestamp' => date('c')
    ]);
    exit();
}

// Parsing de ruta mejorado
$request_uri = $_SERVER['REQUEST_URI'];
error_log("📍 [ROUTER] Raw URI: " . $request_uri);

// Remover query string
$request_uri = parse_url($request_uri, PHP_URL_PATH);
error_log("📍 [ROUTER] Path only: " . $request_uri);

// Remover /api del inicio si existe
$request_uri = preg_replace('|^/api|', '', $request_uri);
error_log("📍 [ROUTER] Without /api: " . $request_uri);

// Obtener partes de la ruta
$path_parts = array_filter(explode('/', trim($request_uri, '/')));
$path_parts = array_values($path_parts); // Reindexar array

error_log("📍 [ROUTER] Path parts: " . json_encode($path_parts));

// Variables para routing
$category = $path_parts[0] ?? null;
$subcategory = $path_parts[1] ?? null;
$action = $path_parts[2] ?? null;
$id = $path_parts[3] ?? null;

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];
error_log("📍 [ROUTER] Method: $method, Category: $category, Subcategory: $subcategory");

try {
    // Si no hay categoría, mostrar ayuda
    if (!$category) {
        echo json_encode([
            'success' => true,
            'message' => 'API GESCOP v1.0',
            'endpoints' => [
                '/personal' => 'Gestión de personal',
                '/flota/vehiculos' => 'Gestión de vehículos',
                '/empresas' => 'Gestión de empresas',
                '/proveedores' => 'Gestión de proveedores',
                '/auth' => 'Autenticación'
            ]
        ]);
        exit();
    }

    // ROUTER PRINCIPAL
    switch ($category) {
        case 'personal':
            error_log("📍 [ROUTER] Routing to personal endpoint");
            
            // Determinar qué archivo cargar
            if ($subcategory === 'search') {
                require_once dirname(__FILE__) . '/personal/search_personal.php';
            } elseif ($subcategory === 'get') {
                require_once dirname(__FILE__) . '/personal/get_personal.php';
            } elseif ($subcategory === 'create') {
                require_once dirname(__FILE__) . '/personal/create_personal.php';
            } elseif ($subcategory === 'update') {
                require_once dirname(__FILE__) . '/personal/update_personal.php';
            } elseif ($subcategory === 'delete') {
                require_once dirname(__FILE__) . '/personal/delete_personal.php';
            } else {
                // Si no hay subcategoría, usar get_personal.php como default
                require_once dirname(__FILE__) . '/personal/get_personal.php';
            }
            break;
            
        case 'flota':
            if ($subcategory === 'vehiculos') {
                require_once dirname(__FILE__) . '/flota/vehiculos.php';
            } else {
                handleError('Subcategoría de flota no válida', 404);
            }
            break;
            
        case 'empresas':
            if ($subcategory === 'habilitaciones') {
                require_once dirname(__FILE__) . '/empresas/habilitaciones.php';
            } elseif ($subcategory === 'sedes') {
                require_once dirname(__FILE__) . '/empresas/sedes_empresas.php';
            } else {
                handleError('Subcategoría de empresas no válida', 404);
            }
            break;
            
        case 'proveedores':
            if ($subcategory === 'servicios') {
                require_once dirname(__FILE__) . '/proveedores/servicios_proveedores.php';
            } else {
                require_once dirname(__FILE__) . '/proveedores/proveedores.php';
            }
            break;
            
        case 'auth':
            require_once dirname(__FILE__) . '/auth.php';
            break;
            
        case 'documentos':
            require_once dirname(__FILE__) . '/documentos.php';
            break;
            
        default:
            handleError('Categoría no encontrada: ' . $category, 404);
            break;
    }
    
} catch (Exception $e) {
    handleError('Error en el routing', 500, $e);
}
?>