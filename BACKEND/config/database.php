<?php
// BACKEND/config/database.php - VERSIÓN CORREGIDA
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = "localhost";
        $this->db_name = "gescopv1_gescopdb";
        $this->username = "gescopv1_gescopb";
        $this->password = "GESCOPC.o+-30640956336";
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
            
            error_log("✅ [DATABASE] Conexión exitosa a: " . $this->db_name);
            
        } catch(PDOException $e) {
            error_log("❌ [DATABASE ERROR] " . $e->getMessage());
            
            // Mensaje amigable para frontend
            throw new Exception("Error de conexión a la base de datos. Verifique la configuración.");
        }

        return $this->conn;
    }

    // Método para verificar tablas
    public function checkTables() {
        try {
            $required_tables = ['vehiculos', 'vehiculos_vendidos', 'equipamientos', 'personal'];
            $missing_tables = [];
            
            foreach ($required_tables as $table) {
                $stmt = $this->conn->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() == 0) {
                    $missing_tables[] = $table;
                }
            }
            
            if (!empty($missing_tables)) {
                error_log("⚠️ [DATABASE] Tablas faltantes: " . implode(', ', $missing_tables));
                return false;
            }
            
            return true;
            
        } catch (Exception $e) {
            error_log("❌ [DATABASE CHECK] Error: " . $e->getMessage());
            return false;
        }
    }
}
?>