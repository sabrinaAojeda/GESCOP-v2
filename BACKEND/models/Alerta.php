<?php
class Alerta {
    private $conn;
    private $table_name = "alertas";

    public $id;
    public $tipo;
    public $categoria;
    public $prioridad;
    public $titulo;
    public $descripcion;
    public $elemento_tipo;
    public $elemento_id;
    public $elemento_nombre;
    public $fecha_generacion;
    public $fecha_vencimiento;
    public $estado;
    public $observaciones;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (tipo, categoria, prioridad, titulo, descripcion, elemento_tipo, elemento_id, 
                   elemento_nombre, fecha_generacion, fecha_vencimiento, estado, observaciones) 
                  VALUES (:tipo, :categoria, :prioridad, :titulo, :descripcion, :elemento_tipo, 
                          :elemento_id, :elemento_nombre, :fecha_generacion, :fecha_vencimiento, 
                          :estado, :observaciones)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->tipo = htmlspecialchars(strip_tags($this->tipo));
        $this->categoria = htmlspecialchars(strip_tags($this->categoria));
        $this->prioridad = htmlspecialchars(strip_tags($this->prioridad));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = $this->descripcion ? htmlspecialchars(strip_tags($this->descripcion)) : '';
        $this->elemento_tipo = $this->elemento_tipo ? htmlspecialchars(strip_tags($this->elemento_tipo)) : '';
        $this->elemento_nombre = $this->elemento_nombre ? htmlspecialchars(strip_tags($this->elemento_nombre)) : '';
        $this->observaciones = $this->observaciones ? htmlspecialchars(strip_tags($this->observaciones)) : '';
        
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":categoria", $this->categoria);
        $stmt->bindParam(":prioridad", $this->prioridad);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":elemento_tipo", $this->elemento_tipo);
        $stmt->bindParam(":elemento_id", $this->elemento_id);
        $stmt->bindParam(":elemento_nombre", $this->elemento_nombre);
        $stmt->bindParam(":fecha_generacion", $this->fecha_generacion);
        $stmt->bindParam(":fecha_vencimiento", $this->fecha_vencimiento);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":observaciones", $this->observaciones);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY 
                  CASE prioridad 
                    WHEN 'critico' THEN 1 
                    WHEN 'alto' THEN 2 
                    WHEN 'medio' THEN 3 
                    WHEN 'bajo' THEN 4 
                  END, fecha_generacion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->tipo = $row['tipo'];
            $this->categoria = $row['categoria'];
            $this->prioridad = $row['prioridad'];
            $this->titulo = $row['titulo'];
            $this->descripcion = $row['descripcion'];
            $this->elemento_tipo = $row['elemento_tipo'];
            $this->elemento_id = $row['elemento_id'];
            $this->elemento_nombre = $row['elemento_nombre'];
            $this->fecha_generacion = $row['fecha_generacion'];
            $this->fecha_vencimiento = $row['fecha_vencimiento'];
            $this->estado = $row['estado'];
            $this->observaciones = $row['observaciones'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    public function leerPendientes() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE estado = 'pendiente' ORDER BY 
                  CASE prioridad 
                    WHEN 'critico' THEN 1 
                    WHEN 'alto' THEN 2 
                    WHEN 'medio' THEN 3 
                    WHEN 'bajo' THEN 4 
                  END, fecha_generacion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET tipo=:tipo, categoria=:categoria, prioridad=:prioridad, titulo=:titulo, 
                      descripcion=:descripcion, elemento_tipo=:elemento_tipo, elemento_id=:elemento_id,
                      elemento_nombre=:elemento_nombre, fecha_vencimiento=:fecha_vencimiento,
                      estado=:estado, observaciones=:observaciones
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->tipo = htmlspecialchars(strip_tags($this->tipo));
        $this->categoria = htmlspecialchars(strip_tags($this->categoria));
        $this->prioridad = htmlspecialchars(strip_tags($this->prioridad));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":categoria", $this->categoria);
        $stmt->bindParam(":prioridad", $this->prioridad);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":elemento_tipo", $this->elemento_tipo);
        $stmt->bindParam(":elemento_id", $this->elemento_id);
        $stmt->bindParam(":elemento_nombre", $this->elemento_nombre);
        $stmt->bindParam(":fecha_vencimiento", $this->fecha_vencimiento);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":observaciones", $this->observaciones);
        
        return $stmt->execute();
    }

    public function actualizarEstado() {
        $query = "UPDATE " . $this->table_name . " SET estado = :estado WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function eliminar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }

    // Métodos adicionales usados por el API
    public function obtenerEstadisticas() {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
                    SUM(CASE WHEN estado = 'resuelta' THEN 1 ELSE 0 END) as resueltas,
                    SUM(CASE WHEN prioridad = 'critico' AND estado = 'pendiente' THEN 1 ELSE 0 END) as criticos_pendientes,
                    SUM(CASE WHEN prioridad = 'alto' AND estado = 'pendiente' THEN 1 ELSE 0 END) as altos_pendientes
                  FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function obtenerProximasAVencer($dias = 7) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE estado = 'pendiente' 
                  AND fecha_vencimiento IS NOT NULL 
                  AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL :dias DAY)
                  ORDER BY fecha_vencimiento ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":dias", $dias, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function generarAlertasAutomaticas() {
        $alertasCreadas = 0;
        
        // Verificar vehículos con seguro por vencer
        $query = "SELECT interno, dominio, modelo, seguro_vencimiento FROM vehiculos 
                  WHERE activo = 1 AND seguro_vencimiento IS NOT NULL 
                  AND seguro_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
        $stmt = $this->conn->query($query);
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Verificar si ya existe una alerta pendiente para este vehículo
            $check = "SELECT id FROM " . $this->table_name . " 
                     WHERE elemento_tipo = 'vehiculo' AND elemento_id = ? 
                     AND tipo = 'seguro' AND estado = 'pendiente'";
            $checkStmt = $this->conn->prepare($check);
            $checkStmt->execute([$row['interno']]);
            
            if ($checkStmt->rowCount() == 0) {
                $this->tipo = 'seguro';
                $this->categoria = 'Documentación';
                $this->prioridad = 'medio';
                $this->titulo = 'Seguro de vehículo por vencer';
                $this->descripcion = 'El vehículo con dominio ' . $row['dominio'] . ' tiene el seguro por vencer el ' . $row['seguro_vencimiento'];
                $this->elemento_tipo = 'vehiculo';
                $this->elemento_id = $row['interno'];
                $this->elemento_nombre = $row['dominio'] . ' - ' . $row['modelo'];
                $this->fecha_generacion = date('Y-m-d');
                $this->fecha_vencimiento = $row['seguro_vencimiento'];
                $this->estado = 'pendiente';
                
                if ($this->crear()) {
                    $alertasCreadas++;
                }
            }
        }
        
        // Verificar vehículos con VTV por vencer
        $query = "SELECT interno, dominio, modelo, vtv_vencimiento FROM vehiculos 
                  WHERE activo = 1 AND vtv_vencimiento IS NOT NULL 
                  AND vtv_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
        $stmt = $this->conn->query($query);
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $check = "SELECT id FROM " . $this->table_name . " 
                     WHERE elemento_tipo = 'vehiculo' AND elemento_id = ? 
                     AND tipo = 'vtv' AND estado = 'pendiente'";
            $checkStmt = $this->conn->prepare($check);
            $checkStmt->execute([$row['interno']]);
            
            if ($checkStmt->rowCount() == 0) {
                $this->tipo = 'vtv';
                $this->categoria = 'Documentación';
                $this->prioridad = 'medio';
                $this->titulo = 'VTV de vehículo por vencer';
                $this->descripcion = 'El vehículo con dominio ' . $row['dominio'] . ' tiene la VTV por vencer el ' . $row['vtv_vencimiento'];
                $this->elemento_tipo = 'vehiculo';
                $this->elemento_id = $row['interno'];
                $this->elemento_nombre = $row['dominio'] . ' - ' . $row['modelo'];
                $this->fecha_generacion = date('Y-m-d');
                $this->fecha_vencimiento = $row['vtv_vencimiento'];
                $this->estado = 'pendiente';
                
                if ($this->crear()) {
                    $alertasCreadas++;
                }
            }
        }
        
        return $alertasCreadas;
    }

    public function resolver($resueltaPor, $notas = '') {
        $this->estado = 'resuelta';
        return $this->actualizarEstado();
    }

    public function posponer($nuevaFecha, $pospuestaPor, $notas = '') {
        $this->fecha_vencimiento = $nuevaFecha;
        $this->estado = 'pendiente';
        if ($this->observaciones) {
            $this->observaciones .= "\n[Pospuesta el " . date('Y-m-d') . "]: " . $notas;
        } else {
            $this->observaciones = $notas;
        }
        return $this->actualizar();
    }

    public function leerConFiltros($filtros = []) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        
        if (!empty($filtros['tipo'])) {
            $query .= " AND tipo = :tipo";
        }
        if (!empty($filtros['categoria'])) {
            $query .= " AND categoria = :categoria";
        }
        if (!empty($filtros['prioridad'])) {
            $query .= " AND prioridad = :prioridad";
        }
        if (!empty($filtros['estado'])) {
            $query .= " AND estado = :estado";
        }
        if (!empty($filtros['search'])) {
            $query .= " AND (titulo LIKE :search OR descripcion LIKE :search)";
        }
        
        $query .= " ORDER BY 
                    CASE prioridad 
                        WHEN 'critico' THEN 1 
                        WHEN 'alto' THEN 2 
                        WHEN 'medio' THEN 3 
                        WHEN 'bajo' THEN 4 
                    END, fecha_generacion DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($filtros['tipo'])) {
            $stmt->bindParam(":tipo", $filtros['tipo']);
        }
        if (!empty($filtros['categoria'])) {
            $stmt->bindParam(":categoria", $filtros['categoria']);
        }
        if (!empty($filtros['prioridad'])) {
            $stmt->bindParam(":prioridad", $filtros['prioridad']);
        }
        if (!empty($filtros['estado'])) {
            $stmt->bindParam(":estado", $filtros['estado']);
        }
        if (!empty($filtros['search'])) {
            $search = "%" . $filtros['search'] . "%";
            $stmt->bindParam(":search", $search);
        }
        
        $stmt->execute();
        return $stmt;
    }
}
?>
