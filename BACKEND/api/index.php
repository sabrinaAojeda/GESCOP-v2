<?php
// BACKEND/api/index.php - VERSIÓN DEFINITIVA

// ✅ CORS HEADERS - Enviar ANTES de cualquier cosa
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Max-Age: 3600');

// Responder a OPTIONS inmediatamente
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');

// ERROR REPORTING
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Log del request
error_log("🌐 [API_REQUEST] " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

// Cargar configuración de base de datos
$config_file = dirname(__FILE__) . '/../config/database.php';
if (!file_exists($config_file)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Configuración de base de datos no encontrada',
        'timestamp' => date('c')
    ]);
    exit();
}

require_once $config_file;

// Función para respuestas JSON estandarizadas
function sendResponse($success = true, $message = '', $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// Función para manejar errores
function handleError($message, $code = 500, $exception = null) {
    error_log("💥 [API_ERROR] $message" . ($exception ? " - " . $exception->getMessage() : ""));
    sendResponse(false, $message, ['error' => $exception ? $exception->getMessage() : null], $code);
}

// Parsing de ruta CORREGIDO
$request_uri = $_SERVER['REQUEST_URI'];
error_log("📍 [ROUTER] URI original: " . $request_uri);

// Remover base path si existe (/api o /BACKEND/api)
$base_paths = ['/api', '/BACKEND/api'];
foreach ($base_paths as $base_path) {
    if (strpos($request_uri, $base_path) === 0) {
        $request_uri = substr($request_uri, strlen($base_path));
        break;
    }
}

// Remover query string
$request_uri = parse_url($request_uri, PHP_URL_PATH);

// Obtener partes de la ruta
$path_parts = array_filter(explode('/', trim($request_uri, '/')));
$path_parts = array_values($path_parts);

error_log("📍 [ROUTER] Partes: " . json_encode($path_parts));

// Variables para routing
$category = $path_parts[0] ?? null;
$subcategory = $path_parts[1] ?? null;
$action = $path_parts[2] ?? null;
$id = $path_parts[3] ?? null;

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

error_log("📍 [ROUTER] Método: $method, Categoría: $category, Subcategoría: $subcategory");

try {
    // Si no hay categoría, mostrar ayuda
    if (!$category) {
        sendResponse(true, 'API GESCOP v2.0', [
            'endpoints' => [
                '/flota/vehiculos' => 'Gestión de vehículos (GET, POST, PUT, DELETE)',
                '/flota/vehiculos_vendidos' => 'Vehículos vendidos (GET, POST)',
                '/flota/equipamientos' => 'Equipamiento (GET, POST)',
                '/personal' => 'Gestión de personal',
                '/personal/search' => 'Buscar personal',
                '/personal/create' => 'Crear personal',
                '/personal/update' => 'Actualizar personal',
                '/personal/delete' => 'Eliminar personal',
                '/proveedores' => 'Gestión de proveedores',
                '/dashboard/estadisticas' => 'Estadísticas del dashboard',
                '/dashboard/resumen' => 'Resumen del dashboard',
                '/dashboard/alertas_dashboard' => 'Alertas del dashboard',
                '/dashboard/vencimientos' => 'Vencimientos próximos',
                '/empresas/sedes' => 'Gestión de sedes',
                '/empresas/habilitaciones' => 'Gestión de habilitaciones',
                '/empresas/bases_operativas' => 'Bases operativas',
                '/herramientas/configuracion' => 'Configuración del sistema',
                '/herramientas/reportes' => 'Reportes',
                '/herramientas/alertas' => 'Alertas del sistema',
                '/auth' => 'Autenticación',
                '/test' => 'Prueba de conexión'
            ],
            'parameters' => [
                'vehiculos' => '?search=&sector=&estado=&tipo=&page=1&limit=50',
                'personal' => '?search=&sector=&estado=&page=1&limit=10'
            ]
        ]);
    }

    // ROUTER PRINCIPAL
    switch ($category) {
        case 'dashboard':
            error_log("[ROUTER] Enrutando a dashboard: $subcategory");
            
            if ($subcategory === 'estadisticas') {
                require_once dirname(__FILE__) . '/dashboard/estadisticas.php';
            } elseif ($subcategory === 'resumen') {
                require_once dirname(__FILE__) . '/dashboard/resumen.php';
            } elseif ($subcategory === 'alertas_dashboard') {
                require_once dirname(__FILE__) . '/dashboard/alertas_dashboard.php';
            } elseif ($subcategory === 'vencimientos') {
                require_once dirname(__FILE__) . '/dashboard/vencimientos.php';
            } else {
                handleError('Endpoint de dashboard no encontrado: ' . $subcategory, 404);
            }
            break;
            
        case 'empresas':
            error_log("[ROUTER] Enrutando a empresas: $subcategory");
            
            if ($subcategory === 'sedes') {
                require_once dirname(__FILE__) . '/empresas/sedes.php';
            } elseif ($subcategory === 'habilitaciones') {
                require_once dirname(__FILE__) . '/empresas/habilitaciones.php';
            } elseif ($subcategory === 'bases_operativas') {
                require_once dirname(__FILE__) . '/empresas/bases_operativas.php';
            } elseif ($subcategory === 'carga_masiva_sedes') {
                require_once dirname(__FILE__) . '/empresas/carga_masiva_sedes.php';
            } else {
                handleError('Endpoint de empresas no encontrado: ' . $subcategory, 404);
            }
            break;
            
        case 'herramientas':
            error_log("[ROUTER] Enrutando a herramientas: $subcategory");
            
            if ($subcategory === 'configuracion') {
                require_once dirname(__FILE__) . '/herramientas/configuracion.php';
            } elseif ($subcategory === 'reportes') {
                require_once dirname(__FILE__) . '/herramientas/reportes.php';
            } elseif ($subcategory === 'alertas') {
                require_once dirname(__FILE__) . '/herramientas/alertas.php';
            } else {
                handleError('Endpoint de herramientas no encontrado: ' . $subcategory, 404);
            }
            break;
            
        case 'flota':
            error_log("📍 [ROUTER] Enrutando a flota: $subcategory");
            
            if ($subcategory === 'vehiculos') {
                require_once dirname(__FILE__) . '/flota/vehiculos.php';
            } elseif ($subcategory === 'vehiculos_vendidos') {
                require_once dirname(__FILE__) . '/flota/vehiculos_vendidos.php';
            } elseif ($subcategory === 'equipamientos') {
                require_once dirname(__FILE__) . '/flota/equipamientos.php';
            } elseif ($subcategory === 'carga_masiva_vehiculos') {
                require_once dirname(__FILE__) . '/flota/carga_masiva_vehiculos.php';
            } elseif ($subcategory === 'carga_masiva_vehiculos_vendidos') {
                require_once dirname(__FILE__) . '/flota/carga_masiva_vehiculos_vendidos.php';
            } elseif ($subcategory === 'carga_masiva_equipamientos') {
                require_once dirname(__FILE__) . '/flota/carga_masiva_equipamientos.php';
            } else {
                handleError('Endpoint de flota no encontrado: ' . $subcategory, 404);
            }
            break;
            
        case 'personal':
            // Mantener estructura existente de personal
            if ($subcategory === 'search') {
                require_once dirname(__FILE__) . '/personal/search_personal.php';
            } elseif ($subcategory === 'create') {
                require_once dirname(__FILE__) . '/personal/create_personal.php';
            } elseif ($subcategory === 'update') {
                require_once dirname(__FILE__) . '/personal/update_personal.php';
            } elseif ($subcategory === 'delete') {
                require_once dirname(__FILE__) . '/personal/delete_personal.php';
            } elseif ($subcategory === 'carga_masiva_personal') {
                require_once dirname(__FILE__) . '/personal/carga_masiva_personal.php';
            } else {
                require_once dirname(__FILE__) . '/personal/get_personal.php';
            }
            break;
            
        case 'proveedores':
            // Manejar sub-rutas de proveedores
            if ($subcategory === 'create') {
                require_once dirname(__FILE__) . '/proveedores/create_proveedor.php';
            } elseif ($subcategory === 'update') {
                require_once dirname(__FILE__) . '/proveedores/update_proveedor.php';
            } elseif ($subcategory === 'delete') {
                require_once dirname(__FILE__) . '/proveedores/delete_proveedor.php';
            } elseif ($subcategory === 'search') {
                require_once dirname(__FILE__) . '/proveedores/search_proveedor.php';
            } elseif ($subcategory === 'documentos') {
                require_once dirname(__FILE__) . '/proveedores/documentos_proveedor.php';
            } elseif ($subcategory === 'personal') {
                require_once dirname(__FILE__) . '/proveedores/proveedor_personal.php';
            } elseif ($subcategory === 'servicios') {
                require_once dirname(__FILE__) . '/proveedores/servicios_proveedores.php';
            } elseif ($subcategory === 'carga_masiva_proveedores') {
                require_once dirname(__FILE__) . '/proveedores/carga_masiva_proveedores.php';
            } else {
                require_once dirname(__FILE__) . '/proveedores/proveedores.php';
            }
            break;
            
        case 'auth':
            require_once dirname(__FILE__) . '/auth.php';
            break;
            
        case 'test':
            // Endpoint de prueba
            sendResponse(true, 'API funcionando correctamente', [
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '2.0',
                'database' => 'Conectado'
            ]);
            break;
            
        default:
            handleError('Categoría no encontrada: ' . $category, 404);
            break;
    }
    
} catch (Exception $e) {
    handleError('Error en el routing del API', 500, $e);
}