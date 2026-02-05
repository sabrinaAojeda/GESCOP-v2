<?php
// BACKEND/models/VehiculoVendido.php - CORREGIDO según estructura real de BD
class VehiculoVendido {
    private $conn;
    private $table_name = "vehiculos_vendidos";

    // Propiedades según la estructura real de la tabla
    public $id;
    public $interno_original;
    public $nuevo_propietario;
    public $dni_propietario;
    public $fecha_venta;
    public $precio;
    public $forma_pago;
    public $estado_documentacion;
    public $observaciones;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (interno_original, nuevo_propietario, dni_propietario, fecha_venta, 
                   precio, forma_pago, estado_documentacion, observaciones) 
                  VALUES (:interno_original, :nuevo_propietario, :dni_propietario, :fecha_venta,
                          :precio, :forma_pago, :estado_documentacion, :observaciones)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->interno_original = htmlspecialchars(strip_tags($this->interno_original ?? ''));
        $this->nuevo_propietario = htmlspecialchars(strip_tags($this->nuevo_propietario ?? ''));
        $this->dni_propietario = htmlspecialchars(strip_tags($this->dni_propietario ?? ''));
        $this->forma_pago = htmlspecialchars(strip_tags($this->forma_pago ?? ''));
        $this->estado_documentacion = htmlspecialchars(strip_tags($this->estado_documentacion ?? 'Pendiente'));
        $this->observaciones = htmlspecialchars(strip_tags($this->observaciones ?? ''));
        
        $stmt->bindParam(":interno_original", $this->interno_original);
        $stmt->bindParam(":nuevo_propietario", $this->nuevo_propietario);
        $stmt->bindParam(":dni_propietario", $this->dni_propietario);
        $stmt->bindParam(":fecha_venta", $this->fecha_venta);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":forma_pago", $this->forma_pago);
        $stmt->bindParam(":estado_documentacion", $this->estado_documentacion);
        $stmt->bindParam(":observaciones", $this->observaciones);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY fecha_venta DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function leerConFiltros($search = '', $estado = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (interno_original LIKE :search OR nuevo_propietario LIKE :search OR dni_propietario LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($estado) && $estado !== 'Todos') {
            $query .= " AND estado_documentacion = :estado";
            $params[':estado'] = $estado;
        }
        
        $query .= " ORDER BY fecha_venta DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }

    public function leerUno($id = null) {
        $id = $id ?? $this->id;
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->id = $row['id'];
            $this->interno_original = $row['interno_original'] ?? '';
            $this->nuevo_propietario = $row['nuevo_propietario'] ?? '';
            $this->dni_propietario = $row['dni_propietario'] ?? '';
            $this->fecha_venta = $row['fecha_venta'] ?? '';
            $this->precio = $row['precio'] ?? '';
            $this->forma_pago = $row['forma_pago'] ?? '';
            $this->estado_documentacion = $row['estado_documentacion'] ?? 'Pendiente';
            $this->observaciones = $row['observaciones'] ?? '';
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET interno_original=:interno_original, nuevo_propietario=:nuevo_propietario, 
                      dni_propietario=:dni_propietario, fecha_venta=:fecha_venta,
                      precio=:precio, forma_pago=:forma_pago, 
                      estado_documentacion=:estado_documentacion, observaciones=:observaciones,
                      updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->interno_original = htmlspecialchars(strip_tags($this->interno_original ?? ''));
        $this->nuevo_propietario = htmlspecialchars(strip_tags($this->nuevo_propietario ?? ''));
        $this->dni_propietario = htmlspecialchars(strip_tags($this->dni_propietario ?? ''));
        $this->forma_pago = htmlspecialchars(strip_tags($this->forma_pago ?? ''));
        $this->estado_documentacion = htmlspecialchars(strip_tags($this->estado_documentacion ?? 'Pendiente'));
        $this->observaciones = htmlspecialchars(strip_tags($this->observaciones ?? ''));
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":interno_original", $this->interno_original);
        $stmt->bindParam(":nuevo_propietario", $this->nuevo_propietario);
        $stmt->bindParam(":dni_propietario", $this->dni_propietario);
        $stmt->bindParam(":fecha_venta", $this->fecha_venta);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":forma_pago", $this->forma_pago);
        $stmt->bindParam(":estado_documentacion", $this->estado_documentacion);
        $stmt->bindParam(":observaciones", $this->observaciones);
        
        return $stmt->execute();
    }

    public function eliminar($id = null) {
        $id = $id ?? $this->id;
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
    
    public function contarConFiltros($search = '', $estado = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE 1=1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (interno_original LIKE :search OR nuevo_propietario LIKE :search OR dni_propietario LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($estado) && $estado !== 'Todos') {
            $query .= " AND estado_documentacion = :estado";
            $params[':estado'] = $estado;
        }
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
}
?>
