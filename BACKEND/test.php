<?php
// BACKEND/test.php - SCRIPT DE DIAGNÓSTICO COMPLETO

// Forzar显示 errores para diagnóstico
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

echo "=== DIAGNÓSTICO DE API GESCOP ===\n\n";

// 1. Verificar PHP y extensiones
echo "1. VERSIÓN PHP: " . PHP_VERSION . "\n\n";

// 2. Verificar conexión a base de datos
echo "2. CONEXIÓN A BASE DE DATOS:\n";
try {
    $base_path = dirname(__FILE__) . '/config/database.php';
    if (!file_exists($base_path)) {
        echo "   ❌ ERROR: No se encontró config/database.php\n";
        exit;
    }
    
    require_once $base_path;
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "   ✅ Conexión exitosa a MySQL\n";
        
        // Verificar tablas
        echo "\n3. VERIFICANDO TABLAS:\n";
        $tables = ['personal', 'proveedores', 'sedes', 'vehiculos', 'vehiculos_vendidos', 'equipamientos'];
        
        foreach ($tables as $table) {
            try {
                $stmt = $conn->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    echo "   ✅ Tabla '$table' existe\n";
                    
                    // Contar registros
                    $countStmt = $conn->query("SELECT COUNT(*) FROM $table");
                    $count = $countStmt->fetchColumn();
                    echo "      - Registros: $count\n";
                } else {
                    echo "   ❌ Tabla '$table' NO existe\n";
                }
            } catch (PDOException $e) {
                echo "   ❌ Error verificando tabla '$table': " . $e->getMessage() . "\n";
            }
        }
    } else {
        echo "   ❌ ERROR: No se pudo conectar a MySQL\n";
    }
} catch (Exception $e) {
    echo "   ❌ ERROR GENERAL: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DEL DIAGNÓSTICO ===\n";
