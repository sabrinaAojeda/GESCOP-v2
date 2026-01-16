<?php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "🔍 VERIFICACIÓN COMPLETA DE BASE DE DATOS\n";
echo "=========================================\n\n";

// Probamos diferentes combinaciones
$configs = [
    [
        'host' => 'localhost',
        'dbname' => 'gescopve_gescopdb',
        'username' => 'gescopve_gescopbd',
        'password' => 'GESCOPcontrasenia1234'
    ],
    [
        'host' => 'localhost',
        'dbname' => 'gescopve_gescopdb',
        'username' => 'gescopve_flota',
        'password' => 'GESCOPcontrasenia1234'
    ],
    [
        'host' => '127.0.0.1',
        'dbname' => 'gescopve_gescopdb',
        'username' => 'gescopve_gescopbd',
        'password' => 'GESCOPcontrasenia1234'
    ]
];

foreach ($configs as $i => $config) {
    echo "\n🧪 Prueba #" . ($i + 1) . ":\n";
    echo "   Host: " . $config['host'] . "\n";
    echo "   BD: " . $config['dbname'] . "\n";
    echo "   Usuario: " . $config['username'] . "\n";
    
    try {
        $pdo = new PDO(
            "mysql:host=" . $config['host'] . ";dbname=" . $config['dbname'] . ";charset=utf8mb4",
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        echo "   ✅ CONEXIÓN EXITOSA\n";
        
        // Verificar tablas
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "   📊 Tablas encontradas: " . count($tables) . "\n";
        
        // Verificar tablas específicas
        $required_tables = ['vehiculos', 'personal'];
        foreach ($required_tables as $table) {
            if (in_array($table, $tables)) {
                echo "   ✅ Tabla '$table' existe\n";
            } else {
                echo "   ❌ Tabla '$table' NO existe\n";
            }
        }
        
        // Esta es la configuración correcta
        echo "\n🎉 CONFIGURACIÓN CORRECTA ENCONTRADA!\n";
        echo "Usa estos valores en database.php:\n";
        echo "Host: " . $config['host'] . "\n";
        echo "DB: " . $config['dbname'] . "\n"; 
        echo "User: " . $config['username'] . "\n";
        
        break;
        
    } catch (PDOException $e) {
        echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\n\n🔧 RECOMENDACIONES:\n";
echo "1. Ve a cPanel → MySQL Databases\n";
echo "2. Verifica el usuario EXACTO y su contraseña\n";
echo "3. Asegúrate que el usuario esté asignado a la BD\n";
echo "4. Los privilegios deben incluir: SELECT, INSERT, UPDATE, DELETE\n";
?>