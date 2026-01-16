<?php
class Parametro {
    private $conn;
    private $table_name = "parametros";

    public $id;
    public $tipo;
    public $codigo;
    public $valor;
    public $descripcion;
    public $orden;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear parámetro
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (tipo, codigo, valor, descripcion, orden, activo) 
                  VALUES (:tipo, :codigo, :valor, :descripcion, :orden, :activo)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->sanitizarDatos();
        
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":valor", $this->valor);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":orden", $this->orden);
        $stmt->bindParam(":activo", $this->activo);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Leer un parámetro específico
    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->tipo = $row['tipo'];
            $this->codigo = $row['codigo'];
            $this->valor = $row['valor'];
            $this->descripcion = $row['descripcion'];
            $this->orden = $row['orden'];
            $this->activo = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // Actualizar parámetro
    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET tipo = :tipo, codigo = :codigo, valor = :valor, 
                      descripcion = :descripcion, orden = :orden, activo = :activo,
                      updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->sanitizarDatos();
        
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":valor", $this->valor);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":orden", $this->orden);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":id", $this->id);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar parámetro
    public function eliminar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Obtener parámetros por tipo
    public function obtenerPorTipo($tipo) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE tipo = ? AND activo = 1 
                  ORDER BY orden ASC, valor ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $tipo);
        $stmt->execute();
        return $stmt;
    }

    // Leer todos los parámetros
    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY tipo ASC, orden ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Obtener tipos de parámetros disponibles
    public function obtenerTipos() {
        $query = "SELECT DISTINCT tipo FROM " . $this->table_name . " ORDER BY tipo ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Verificar si un valor existe para un tipo específico
    public function existe($tipo, $valor) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE tipo = ? AND valor = ? AND activo = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $tipo);
        $stmt->bindParam(2, $valor);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    // Obtener sectores parametrizables
    public function obtenerSectores() {
        return $this->obtenerPorTipo('sector');
    }

    // Obtener tipos de vehículo
    public function obtenerTiposVehiculo() {
        return $this->obtenerPorTipo('tipo_vehiculo');
    }

    // Obtener estados de vehículo
    public function obtenerEstadosVehiculo() {
        return $this->obtenerPorTipo('estado_vehiculo');
    }

    // Obtener tipos de documento
    public function obtenerTiposDocumento() {
        return $this->obtenerPorTipo('tipo_documento');
    }

    // Función para sanitizar datos
    private function sanitizarDatos() {
        $this->tipo = htmlspecialchars(strip_tags($this->tipo));
        $this->codigo = htmlspecialchars(strip_tags($this->codigo));
        $this->valor = htmlspecialchars(strip_tags($this->valor));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->orden = $this->orden ? intval($this->orden) : 0;
        $this->activo = $this->activo ? 1 : 0;
        $this->id = $this->id ? intval($this->id) : null;
    }
}
?>