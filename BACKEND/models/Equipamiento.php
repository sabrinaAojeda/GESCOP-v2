<?php
// BACKEND/models/Equipamiento.php - CORREGIDO para coincidir con frontend y BD
class Equipamiento {
    private $conn;
    private $table_name = "equipamientos";

    public $id;
    public $codigo;
    public $nombre;
    public $tipo;
    public $marca;
    public $modelo;
    public $serie;
    public $ubicacion;
    public $estado;
    public $fecha_adquisicion;
    public $ultimo_mantenimiento;
    public $proximo_mantenimiento;
    public $responsable;
    public $observaciones;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crear() {
        // Verificar si código ya existe
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE codigo = :codigo";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":codigo", $this->codigo);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            throw new Exception("El código de equipamiento ya existe");
        }

        $query = "INSERT INTO " . $this->table_name . " 
                  (codigo, nombre, tipo, marca, modelo, serie, ubicacion, estado, 
                   fecha_adquisicion, ultimo_mantenimiento, proximo_mantenimiento, 
                   responsable, observaciones, activo) 
                  VALUES (:codigo, :nombre, :tipo, :marca, :modelo, :serie, :ubicacion, 
                          :estado, :fecha_adquisicion, :ultimo_mantenimiento, :proximo_mantenimiento,
                          :responsable, :observaciones, :activo)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar
        $this->codigo = htmlspecialchars(strip_tags($this->codigo));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre ?? ''));
        $this->tipo = htmlspecialchars(strip_tags($this->tipo ?? 'Equipo'));
        $this->marca = htmlspecialchars(strip_tags($this->marca ?? ''));
        $this->modelo = htmlspecialchars(strip_tags($this->modelo ?? ''));
        $this->serie = htmlspecialchars(strip_tags($this->serie ?? ''));
        $this->ubicacion = htmlspecialchars(strip_tags($this->ubicacion ?? ''));
        $this->estado = htmlspecialchars(strip_tags($this->estado ?? 'Operativo'));
        $this->responsable = htmlspecialchars(strip_tags($this->responsable ?? ''));
        $this->observaciones = htmlspecialchars(strip_tags($this->observaciones ?? ''));
        
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":marca", $this->marca);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":serie", $this->serie);
        $stmt->bindParam(":ubicacion", $this->ubicacion);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":fecha_adquisicion", $this->fecha_adquisicion);
        $stmt->bindParam(":ultimo_mantenimiento", $this->ultimo_mantenimiento);
        $stmt->bindParam(":proximo_mantenimiento", $this->proximo_mantenimiento);
        $stmt->bindParam(":responsable", $this->responsable);
        $stmt->bindParam(":observaciones", $this->observaciones);
        $stmt->bindParam(":activo", $this->activo);
        
        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $e) {
            // Manejar errores de duplicado de manera amigable
            if ($e->getCode() == 23000) {
                if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    throw new Exception("El código '" . $this->codigo . "' ya existe");
                }
            }
            throw $e;
        }
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1 ORDER BY codigo";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function leerConFiltros($search = '', $tipo = '', $estado = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (codigo LIKE :search OR nombre LIKE :search OR marca LIKE :search OR modelo LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($tipo) && $tipo !== 'Todos los tipos') {
            $query .= " AND tipo = :tipo";
            $params[':tipo'] = $tipo;
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $query .= " AND estado = :estado";
            $params[':estado'] = $estado;
        }
        
        $query .= " ORDER BY codigo LIMIT :limit OFFSET :offset";
        
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
            $this->codigo = $row['codigo'];
            $this->nombre = $row['nombre'];
            $this->tipo = $row['tipo'];
            $this->marca = $row['marca'] ?? '';
            $this->modelo = $row['modelo'] ?? '';
            $this->serie = $row['serie'] ?? '';
            $this->ubicacion = $row['ubicacion'] ?? '';
            $this->estado = $row['estado'] ?? 'Operativo';
            $this->fecha_adquisicion = $row['fecha_adquisicion'];
            $this->ultimo_mantenimiento = $row['ultimo_mantenimiento'];
            $this->proximo_mantenimiento = $row['proximo_mantenimiento'];
            $this->responsable = $row['responsable'] ?? '';
            $this->observaciones = $row['observaciones'] ?? '';
            $this->activo = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET codigo=:codigo, nombre=:nombre, tipo=:tipo, marca=:marca, 
                      modelo=:modelo, serie=:serie, ubicacion=:ubicacion, estado=:estado,
                      fecha_adquisicion=:fecha_adquisicion, ultimo_mantenimiento=:ultimo_mantenimiento,
                      proximo_mantenimiento=:proximo_mantenimiento, responsable=:responsable,
                      observaciones=:observaciones, activo=:activo,
                      updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->codigo = htmlspecialchars(strip_tags($this->codigo));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre ?? ''));
        $this->tipo = htmlspecialchars(strip_tags($this->tipo ?? 'Equipo'));
        $this->marca = htmlspecialchars(strip_tags($this->marca ?? ''));
        $this->modelo = htmlspecialchars(strip_tags($this->modelo ?? ''));
        $this->serie = htmlspecialchars(strip_tags($this->serie ?? ''));
        $this->ubicacion = htmlspecialchars(strip_tags($this->ubicacion ?? ''));
        $this->estado = htmlspecialchars(strip_tags($this->estado ?? 'Operativo'));
        $this->responsable = htmlspecialchars(strip_tags($this->responsable ?? ''));
        $this->observaciones = htmlspecialchars(strip_tags($this->observaciones ?? ''));
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":marca", $this->marca);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":serie", $this->serie);
        $stmt->bindParam(":ubicacion", $this->ubicacion);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":fecha_adquisicion", $this->fecha_adquisicion);
        $stmt->bindParam(":ultimo_mantenimiento", $this->ultimo_mantenimiento);
        $stmt->bindParam(":proximo_mantenimiento", $this->proximo_mantenimiento);
        $stmt->bindParam(":responsable", $this->responsable);
        $stmt->bindParam(":observaciones", $this->observaciones);
        $stmt->bindParam(":activo", $this->activo);
        
        return $stmt->execute();
    }

    public function eliminar($id = null) {
        $id = $id ?? $this->id;
        $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
    
    public function contarConFiltros($search = '', $tipo = '', $estado = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE activo = 1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (codigo LIKE :search OR nombre LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($tipo) && $tipo !== 'Todos los tipos') {
            $query .= " AND tipo = :tipo";
            $params[':tipo'] = $tipo;
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $query .= " AND estado = :estado";
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
