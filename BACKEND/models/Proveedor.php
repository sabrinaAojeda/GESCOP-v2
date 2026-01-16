<?php
// BACKEND/models/Proveedor.php - VERSIÓN COMPLETA CON FILTROS Y PAGINACIÓN
class Proveedor {
    private $conn;
    private $table_name = "proveedores";

    public $id;
    public $codigo;
    public $razon_social;
    public $cuit;
    public $rubro;
    public $direccion;
    public $localidad;
    public $provincia;
    public $telefono;
    public $email;
    public $contacto_nombre;
    public $contacto_cargo;
    public $estado;
    public $seguro_RT;
    public $habilitacion_personal;
    public $habilitacion_vehiculo;
    public $campos_personalizados;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ==============================================
    // MÉTODO: Crear proveedor
    // ==============================================
    public function crear() {
        // Verificar si CUIT ya existe
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE cuit = :cuit AND activo = 1";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":cuit", $this->cuit);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            throw new Exception("El CUIT ya está registrado");
        }

        $query = "INSERT INTO " . $this->table_name . " 
                  (codigo, razon_social, cuit, rubro, direccion, localidad, provincia, 
                   telefono, email, contacto_nombre, contacto_cargo, estado, seguro_RT,
                   habilitacion_personal, habilitacion_vehiculo, campos_personalizados) 
                  VALUES 
                  (:codigo, :razon_social, :cuit, :rubro, :direccion, :localidad, :provincia,
                   :telefono, :email, :contacto_nombre, :contacto_cargo, :estado, :seguro_RT,
                   :habilitacion_personal, :habilitacion_vehiculo, :campos_personalizados)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar inputs
        $this->codigo = htmlspecialchars(strip_tags($this->codigo));
        $this->razon_social = htmlspecialchars(strip_tags($this->razon_social));
        $this->cuit = htmlspecialchars(strip_tags($this->cuit));
        $this->rubro = htmlspecialchars(strip_tags($this->rubro));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));
        $this->localidad = htmlspecialchars(strip_tags($this->localidad));
        $this->provincia = htmlspecialchars(strip_tags($this->provincia));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->contacto_nombre = htmlspecialchars(strip_tags($this->contacto_nombre));
        $this->contacto_cargo = htmlspecialchars(strip_tags($this->contacto_cargo));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->seguro_RT = (bool)$this->seguro_RT;
        $this->habilitacion_personal = $this->habilitacion_personal ? htmlspecialchars(strip_tags($this->habilitacion_personal)) : null;
        $this->habilitacion_vehiculo = $this->habilitacion_vehiculo ? htmlspecialchars(strip_tags($this->habilitacion_vehiculo)) : null;
        
        // Campos personalizados como JSON
        $campos_json = $this->campos_personalizados ? json_encode($this->campos_personalizados) : null;
        
        // Bind parameters
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":razon_social", $this->razon_social);
        $stmt->bindParam(":cuit", $this->cuit);
        $stmt->bindParam(":rubro", $this->rubro);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":localidad", $this->localidad);
        $stmt->bindParam(":provincia", $this->provincia);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":contacto_nombre", $this->contacto_nombre);
        $stmt->bindParam(":contacto_cargo", $this->contacto_cargo);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":seguro_RT", $this->seguro_RT, PDO::PARAM_BOOL);
        $stmt->bindParam(":habilitacion_personal", $this->habilitacion_personal);
        $stmt->bindParam(":habilitacion_vehiculo", $this->habilitacion_vehiculo);
        $stmt->bindParam(":campos_personalizados", $campos_json);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // ==============================================
    // MÉTODO: Leer con filtros y paginación (IGUAL QUE PERSONAL)
    // ==============================================
    public function leerConFiltros($search = '', $rubro = '', $estado = '', $localidad = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1";
        
        // Filtro de búsqueda
        if (!empty($search)) {
            $query .= " AND (razon_social LIKE :search OR cuit LIKE :search OR codigo LIKE :search OR contacto_nombre LIKE :search)";
        }
        
        // Filtro por rubro
        if (!empty($rubro) && $rubro !== 'Todos los rubros') {
            $query .= " AND rubro = :rubro";
        }
        
        // Filtro por estado
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $query .= " AND estado = :estado";
        }
        
        // Filtro por localidad
        if (!empty($localidad) && $localidad !== 'Todas las localidades') {
            $query .= " AND localidad = :localidad";
        }
        
        // Orden y paginación
        $query .= " ORDER BY razon_social ASC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        
        if (!empty($rubro) && $rubro !== 'Todos los rubros') {
            $stmt->bindParam(":rubro", $rubro);
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $stmt->bindParam(":estado", $estado);
        }
        
        if (!empty($localidad) && $localidad !== 'Todas las localidades') {
            $stmt->bindParam(":localidad", $localidad);
        }
        
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        return $stmt;
    }

    // ==============================================
    // MÉTODO: Contar total con filtros
    // ==============================================
    public function contarConFiltros($search = '', $rubro = '', $estado = '', $localidad = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE activo = 1";
        
        if (!empty($search)) {
            $query .= " AND (razon_social LIKE :search OR cuit LIKE :search OR codigo LIKE :search OR contacto_nombre LIKE :search)";
        }
        
        if (!empty($rubro) && $rubro !== 'Todos los rubros') {
            $query .= " AND rubro = :rubro";
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $query .= " AND estado = :estado";
        }
        
        if (!empty($localidad) && $localidad !== 'Todas las localidades') {
            $query .= " AND localidad = :localidad";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        
        if (!empty($rubro) && $rubro !== 'Todos los rubros') {
            $stmt->bindParam(":rubro", $rubro);
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $stmt->bindParam(":estado", $estado);
        }
        
        if (!empty($localidad) && $localidad !== 'Todas las localidades') {
            $stmt->bindParam(":localidad", $localidad);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    // ==============================================
    // MÉTODO: Leer uno por ID
    // ==============================================
    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? AND activo = 1 LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Mapear todos los campos
            $this->codigo = $row['codigo'];
            $this->razon_social = $row['razon_social'];
            $this->cuit = $row['cuit'];
            $this->rubro = $row['rubro'];
            $this->direccion = $row['direccion'];
            $this->localidad = $row['localidad'];
            $this->provincia = $row['provincia'];
            $this->telefono = $row['telefono'];
            $this->email = $row['email'];
            $this->contacto_nombre = $row['contacto_nombre'];
            $this->contacto_cargo = $row['contacto_cargo'];
            $this->estado = $row['estado'];
            $this->seguro_RT = (bool)$row['seguro_RT'];
            $this->habilitacion_personal = $row['habilitacion_personal'];
            $this->habilitacion_vehiculo = $row['habilitacion_vehiculo'];
            $this->campos_personalizados = $row['campos_personalizados'] ? json_decode($row['campos_personalizados'], true) : [];
            $this->activo = (bool)$row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // ==============================================
    // MÉTODO: Actualizar proveedor
    // ==============================================
    public function actualizar() {
        // Verificar si CUIT ya existe (excluyendo el actual)
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE cuit = :cuit AND id != :id AND activo = 1";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":cuit", $this->cuit);
        $check_stmt->bindParam(":id", $this->id);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            throw new Exception("El CUIT ya está registrado en otro proveedor");
        }

        $query = "UPDATE " . $this->table_name . " 
                  SET codigo = :codigo, razon_social = :razon_social, cuit = :cuit, 
                      rubro = :rubro, direccion = :direccion, localidad = :localidad,
                      provincia = :provincia, telefono = :telefono, email = :email,
                      contacto_nombre = :contacto_nombre, contacto_cargo = :contacto_cargo,
                      estado = :estado, seguro_RT = :seguro_RT,
                      habilitacion_personal = :habilitacion_personal,
                      habilitacion_vehiculo = :habilitacion_vehiculo,
                      campos_personalizados = :campos_personalizados,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id AND activo = 1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar
        $this->codigo = htmlspecialchars(strip_tags($this->codigo));
        $this->razon_social = htmlspecialchars(strip_tags($this->razon_social));
        $this->cuit = htmlspecialchars(strip_tags($this->cuit));
        $this->rubro = htmlspecialchars(strip_tags($this->rubro));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));
        $this->localidad = htmlspecialchars(strip_tags($this->localidad));
        $this->provincia = htmlspecialchars(strip_tags($this->provincia));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->contacto_nombre = htmlspecialchars(strip_tags($this->contacto_nombre));
        $this->contacto_cargo = htmlspecialchars(strip_tags($this->contacto_cargo));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->seguro_RT = (bool)$this->seguro_RT;
        $this->habilitacion_personal = $this->habilitacion_personal ? htmlspecialchars(strip_tags($this->habilitacion_personal)) : null;
        $this->habilitacion_vehiculo = $this->habilitacion_vehiculo ? htmlspecialchars(strip_tags($this->habilitacion_vehiculo)) : null;
        
        // Campos personalizados como JSON
        $campos_json = $this->campos_personalizados ? json_encode($this->campos_personalizados) : null;
        
        // Bind
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":razon_social", $this->razon_social);
        $stmt->bindParam(":cuit", $this->cuit);
        $stmt->bindParam(":rubro", $this->rubro);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":localidad", $this->localidad);
        $stmt->bindParam(":provincia", $this->provincia);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":contacto_nombre", $this->contacto_nombre);
        $stmt->bindParam(":contacto_cargo", $this->contacto_cargo);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":seguro_RT", $this->seguro_RT, PDO::PARAM_BOOL);
        $stmt->bindParam(":habilitacion_personal", $this->habilitacion_personal);
        $stmt->bindParam(":habilitacion_vehiculo", $this->habilitacion_vehiculo);
        $stmt->bindParam(":campos_personalizados", $campos_json);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    // ==============================================
    // MÉTODO: Eliminar (eliminación lógica)
    // ==============================================
    public function eliminar() {
        $query = "UPDATE " . $this->table_name . " SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    // ==============================================
    // MÉTODO: Buscar para autocomplete
    // ==============================================
    public function buscar($search, $limit = 10) {
        $query = "SELECT id, codigo, razon_social, cuit, rubro, estado 
                  FROM " . $this->table_name . " 
                  WHERE (razon_social LIKE :search OR cuit LIKE :search OR codigo LIKE :search)
                  AND activo = 1 
                  ORDER BY razon_social ASC 
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $search_term = "%$search%";
        $stmt->bindParam(":search", $search_term);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // ==============================================
    // MÉTODO: Obtener opciones para filtros
    // ==============================================
    public function obtenerOpcionesFiltros() {
        $opciones = [];
        
        // Rubros únicos
        $query_rubros = "SELECT DISTINCT rubro FROM " . $this->table_name . " WHERE rubro IS NOT NULL AND rubro != '' AND activo = 1 ORDER BY rubro";
        $stmt_rubros = $this->conn->prepare($query_rubros);
        $stmt_rubros->execute();
        $opciones['rubros'] = $stmt_rubros->fetchAll(PDO::FETCH_COLUMN);
        
        // Localidades únicas
        $query_localidades = "SELECT DISTINCT localidad FROM " . $this->table_name . " WHERE localidad IS NOT NULL AND localidad != '' AND activo = 1 ORDER BY localidad";
        $stmt_localidades = $this->conn->prepare($query_localidades);
        $stmt_localidades->execute();
        $opciones['localidades'] = $stmt_localidades->fetchAll(PDO::FETCH_COLUMN);
        
        // Estados únicos
        $query_estados = "SELECT DISTINCT estado FROM " . $this->table_name . " WHERE estado IS NOT NULL AND activo = 1 ORDER BY estado";
        $stmt_estados = $this->conn->prepare($query_estados);
        $stmt_estados->execute();
        $opciones['estados'] = $stmt_estados->fetchAll(PDO::FETCH_COLUMN);
        
        return $opciones;
    }
}
?>