<?php
class Vehiculo {
    private $conn;
    private $table_name = "vehiculos";

    // Propiedades según Rodado y Maquinaria + Lista de Vehículos
    public $interno;
    public $año;
    public $dominio;
    public $modelo;
    public $eq_incorporado;
    public $sector;
    public $chofer;
    public $estado;
    public $observaciones;
    public $vtv_vencimiento;
    public $vtv_estado;
    public $hab_vencimiento;
    public $hab_estado;
    public $seguro_vencimiento;
    public $tipo; // Rodado, Maquinaria

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear vehículo
    public function crear() {
        // Verificar si el interno ya existe
        $check_query = "SELECT interno FROM " . $this->table_name . " WHERE interno = :interno";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":interno", $this->interno);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() > 0) {
            return false; // Interno ya existe
        }

        $query = "INSERT INTO " . $this->table_name . " 
                SET interno=:interno, año=:año, dominio=:dominio, modelo=:modelo, 
                    eq_incorporado=:eq_incorporado, sector=:sector, chofer=:chofer, 
                    estado=:estado, observaciones=:observaciones, vtv_vencimiento=:vtv_vencimiento, 
                    vtv_estado=:vtv_estado, hab_vencimiento=:hab_vencimiento, 
                    hab_estado=:hab_estado, seguro_vencimiento=:seguro_vencimiento, tipo=:tipo";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar y bind parameters
        $this->interno = htmlspecialchars(strip_tags($this->interno));
        $this->dominio = htmlspecialchars(strip_tags($this->dominio));
        $this->modelo = htmlspecialchars(strip_tags($this->modelo));
        $this->eq_incorporado = $this->eq_incorporado ? htmlspecialchars(strip_tags($this->eq_incorporado)) : '';
        $this->sector = $this->sector ? htmlspecialchars(strip_tags($this->sector)) : '';
        $this->chofer = $this->chofer ? htmlspecialchars(strip_tags($this->chofer)) : '';
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->observaciones = $this->observaciones ? htmlspecialchars(strip_tags($this->observaciones)) : '';
        $this->vtv_estado = $this->vtv_estado ? htmlspecialchars(strip_tags($this->vtv_estado)) : '';
        $this->hab_estado = $this->hab_estado ? htmlspecialchars(strip_tags($this->hab_estado)) : '';
        $this->tipo = $this->tipo ? htmlspecialchars(strip_tags($this->tipo)) : 'Rodado';
        
        // Bind parameters
        $stmt->bindParam(":interno", $this->interno);
        $stmt->bindParam(":año", $this->año);
        $stmt->bindParam(":dominio", $this->dominio);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":eq_incorporado", $this->eq_incorporado);
        $stmt->bindParam(":sector", $this->sector);
        $stmt->bindParam(":chofer", $this->chofer);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":observaciones", $this->observaciones);
        $stmt->bindParam(":vtv_vencimiento", $this->vtv_vencimiento);
        $stmt->bindParam(":vtv_estado", $this->vtv_estado);
        $stmt->bindParam(":hab_vencimiento", $this->hab_vencimiento);
        $stmt->bindParam(":hab_estado", $this->hab_estado);
        $stmt->bindParam(":seguro_vencimiento", $this->seguro_vencimiento);
        $stmt->bindParam(":tipo", $this->tipo);
        
        if ($stmt->execute()) {
            return true;
        }
        
        // Mostrar error detallado para debugging
        error_log("Error al crear vehículo: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // Leer todos los vehículos
    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY interno";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Leer un solo vehículo
    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE interno = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->interno);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->interno = $row['interno'];
            $this->año = $row['año'];
            $this->dominio = $row['dominio'];
            $this->modelo = $row['modelo'];
            $this->eq_incorporado = $row['eq_incorporado'];
            $this->sector = $row['sector'];
            $this->chofer = $row['chofer'];
            $this->estado = $row['estado'];
            $this->observaciones = $row['observaciones'];
            $this->vtv_vencimiento = $row['vtv_vencimiento'];
            $this->vtv_estado = $row['vtv_estado'];
            $this->hab_vencimiento = $row['hab_vencimiento'];
            $this->hab_estado = $row['hab_estado'];
            $this->seguro_vencimiento = $row['seguro_vencimiento'];
            $this->tipo = $row['tipo'];
            return true;
        }
        return false;
    }

    // Actualizar vehículo
    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                SET año=:año, dominio=:dominio, modelo=:modelo, eq_incorporado=:eq_incorporado, 
                    sector=:sector, chofer=:chofer, estado=:estado, observaciones=:observaciones, 
                    vtv_vencimiento=:vtv_vencimiento, vtv_estado=:vtv_estado, 
                    hab_vencimiento=:hab_vencimiento, hab_estado=:hab_estado, 
                    seguro_vencimiento=:seguro_vencimiento, tipo=:tipo
                WHERE interno = :interno";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar datos
        $this->interno = htmlspecialchars(strip_tags($this->interno));
        $this->dominio = htmlspecialchars(strip_tags($this->dominio));
        $this->modelo = htmlspecialchars(strip_tags($this->modelo));
        $this->eq_incorporado = $this->eq_incorporado ? htmlspecialchars(strip_tags($this->eq_incorporado)) : '';
        $this->sector = $this->sector ? htmlspecialchars(strip_tags($this->sector)) : '';
        $this->chofer = $this->chofer ? htmlspecialchars(strip_tags($this->chofer)) : '';
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->observaciones = $this->observaciones ? htmlspecialchars(strip_tags($this->observaciones)) : '';
        $this->vtv_estado = $this->vtv_estado ? htmlspecialchars(strip_tags($this->vtv_estado)) : '';
        $this->hab_estado = $this->hab_estado ? htmlspecialchars(strip_tags($this->hab_estado)) : '';
        $this->tipo = $this->tipo ? htmlspecialchars(strip_tags($this->tipo)) : 'Rodado';
        
        $stmt->bindParam(":interno", $this->interno);
        $stmt->bindParam(":año", $this->año);
        $stmt->bindParam(":dominio", $this->dominio);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":eq_incorporado", $this->eq_incorporado);
        $stmt->bindParam(":sector", $this->sector);
        $stmt->bindParam(":chofer", $this->chofer);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":observaciones", $this->observaciones);
        $stmt->bindParam(":vtv_vencimiento", $this->vtv_vencimiento);
        $stmt->bindParam(":vtv_estado", $this->vtv_estado);
        $stmt->bindParam(":hab_vencimiento", $this->hab_vencimiento);
        $stmt->bindParam(":hab_estado", $this->hab_estado);
        $stmt->bindParam(":seguro_vencimiento", $this->seguro_vencimiento);
        $stmt->bindParam(":tipo", $this->tipo);
        
        if ($stmt->execute()) {
            return true;
        }
        
        error_log("Error al actualizar vehículo: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // Eliminar vehículo
    public function eliminar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE interno = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->interno);
        
        if ($stmt->execute()) {
            return true;
        }
        
        error_log("Error al eliminar vehículo: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // ✅ MÉTODOS NUEVOS QUE FALTAN - PARA FILTROS Y PAGINACIÓN
    public function leerConFiltros($search = '', $sector = '', $estado = '', $tipo = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        
        if (!empty($search)) {
            $query .= " AND (interno LIKE :search OR dominio LIKE :search OR modelo LIKE :search OR chofer LIKE :search)";
        }
        
        if (!empty($sector)) {
            $query .= " AND sector = :sector";
        }
        
        if (!empty($estado)) {
            $query .= " AND estado = :estado";
        }

        if (!empty($tipo)) {
            $query .= " AND tipo = :tipo";
        }
        
        $query .= " ORDER BY interno LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        
        if (!empty($sector)) {
            $stmt->bindParam(":sector", $sector);
        }
        
        if (!empty($estado)) {
            $stmt->bindParam(":estado", $estado);
        }

        if (!empty($tipo)) {
            $stmt->bindParam(":tipo", $tipo);
        }
        
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        return $stmt;
    }

    public function contarConFiltros($search = '', $sector = '', $estado = '', $tipo = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE 1=1";
        
        if (!empty($search)) {
            $query .= " AND (interno LIKE :search OR dominio LIKE :search OR modelo LIKE :search OR chofer LIKE :search)";
        }
        
        if (!empty($sector)) {
            $query .= " AND sector = :sector";
        }
        
        if (!empty($estado)) {
            $query .= " AND estado = :estado";
        }

        if (!empty($tipo)) {
            $query .= " AND tipo = :tipo";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        
        if (!empty($sector)) {
            $stmt->bindParam(":sector", $sector);
        }
        
        if (!empty($estado)) {
            $stmt->bindParam(":estado", $estado);
        }

        if (!empty($tipo)) {
            $stmt->bindParam(":tipo", $tipo);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
}
?>