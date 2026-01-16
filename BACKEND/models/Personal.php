<?php
class Personal {
    private $conn;
    private $table_name = "personal";

    public $id;
    public $nombre;
    public $apellido;
    public $dni;
    public $telefono;
    public $email;
    public $puesto;
    public $sector;
    public $fecha_ingreso;
    public $activo;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (nombre, apellido, dni, telefono, email, puesto, sector, fecha_ingreso, activo) 
                  VALUES (:nombre, :apellido, :dni, :telefono, :email, :puesto, :sector, :fecha_ingreso, :activo)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellido = htmlspecialchars(strip_tags($this->apellido));
        $this->dni = htmlspecialchars(strip_tags($this->dni));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->puesto = htmlspecialchars(strip_tags($this->puesto));
        $this->sector = htmlspecialchars(strip_tags($this->sector));
        
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellido", $this->apellido);
        $stmt->bindParam(":dni", $this->dni);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":puesto", $this->puesto);
        $stmt->bindParam(":sector", $this->sector);
        $stmt->bindParam(":fecha_ingreso", $this->fecha_ingreso);
        $stmt->bindParam(":activo", $this->activo);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1 ORDER BY nombre, apellido";
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
            $this->nombre = $row['nombre'];
            $this->apellido = $row['apellido'];
            $this->dni = $row['dni'];
            $this->telefono = $row['telefono'];
            $this->email = $row['email'];
            $this->puesto = $row['puesto'];
            $this->sector = $row['sector'];
            $this->fecha_ingreso = $row['fecha_ingreso'];
            $this->activo = $row['activo'];
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET nombre = :nombre, apellido = :apellido, dni = :dni, 
                      telefono = :telefono, email = :email, puesto = :puesto, 
                      sector = :sector, fecha_ingreso = :fecha_ingreso, 
                      activo = :activo
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellido = htmlspecialchars(strip_tags($this->apellido));
        $this->dni = htmlspecialchars(strip_tags($this->dni));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->puesto = htmlspecialchars(strip_tags($this->puesto));
        $this->sector = htmlspecialchars(strip_tags($this->sector));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellido", $this->apellido);
        $stmt->bindParam(":dni", $this->dni);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":puesto", $this->puesto);
        $stmt->bindParam(":sector", $this->sector);
        $stmt->bindParam(":fecha_ingreso", $this->fecha_ingreso);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    public function eliminar() {
        $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    // Nuevos métodos para filtros y paginación
    public function leerConFiltros($search = '', $sector = '', $estado = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        
        if (!empty($search)) {
            $query .= " AND (nombre LIKE :search OR apellido LIKE :search OR dni LIKE :search)";
        }
        
        if (!empty($sector) && $sector !== 'Todos los sectores') {
            $query .= " AND sector = :sector";
        }
        
        if ($estado !== '' && $estado !== 'Todos los estados') {
            $activo = $estado === 'Activo' ? 1 : 0;
            $query .= " AND activo = :activo";
        }
        
        $query .= " ORDER BY nombre, apellido LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        
        if (!empty($sector) && $sector !== 'Todos los sectores') {
            $stmt->bindParam(":sector", $sector);
        }
        
        if ($estado !== '' && $estado !== 'Todos los estados') {
            $stmt->bindParam(":activo", $activo);
        }
        
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        return $stmt;
    }

    public function contarConFiltros($search = '', $sector = '', $estado = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE 1=1";
        
        if (!empty($search)) {
            $query .= " AND (nombre LIKE :search OR apellido LIKE :search OR dni LIKE :search)";
        }
        
        if (!empty($sector) && $sector !== 'Todos los sectores') {
            $query .= " AND sector = :sector";
        }
        
        if ($estado !== '' && $estado !== 'Todos los estados') {
            $activo = $estado === 'Activo' ? 1 : 0;
            $query .= " AND activo = :activo";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        
        if (!empty($sector) && $sector !== 'Todos los sectores') {
            $stmt->bindParam(":sector", $sector);
        }
        
        if ($estado !== '' && $estado !== 'Todos los estados') {
            $stmt->bindParam(":activo", $activo);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    public function buscar($search, $limit = 10) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE (nombre LIKE :search OR apellido LIKE :search OR dni LIKE :search)
                  AND activo = 1 
                  ORDER BY nombre, apellido 
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $search_term = "%$search%";
        $stmt->bindParam(":search", $search_term);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }
}
?>