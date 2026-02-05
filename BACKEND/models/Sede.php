<?php
class Sede {
    private $conn;
    private $table_name = "sedes";

    public $id;
    public $codigo;
    public $nombre;
    public $tipo;
    public $direccion;
    public $localidad;
    public $provincia;
    public $telefono;
    public $email;
    public $responsable;
    public $empresa_id;
    public $tipo_habilitacion;
    public $habilitacion_numero;
    public $vencimiento_habilitacion;
    public $certificaciones;
    public $seguridad_higiene;
    public $procesos_quimicos;
    public $vencimiento_procesos;
    public $base_madre_copesa;
    public $base_operativa;
    public $habilitada;
    public $estado;
    public $activo;
    public $vehiculos_asignados;
    public $permisos_por_vencer;
    public $tipo_predio;
    public $servicio_principal;
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
            throw new Exception("El código de sede ya está registrado");
        }

        $query = "INSERT INTO " . $this->table_name . " 
                  (codigo, nombre, tipo, direccion, localidad, provincia, telefono, email, 
                   responsable, empresa_id, tipo_habilitacion, habilitacion_numero, 
                   vencimiento_habilitacion, certificaciones, seguridad_higiene, 
                   procesos_quimicos, vencimiento_procesos, base_madre_copesa, 
                   base_operativa, habilitada, estado, activo, vehiculos_asignados, 
                   permisos_por_vencer, tipo_predio, servicio_principal) 
                  VALUES (:codigo, :nombre, :tipo, :direccion, :localidad, :provincia, 
                          :telefono, :email, :responsable, :empresa_id, :tipo_habilitacion, 
                          :habilitacion_numero, :vencimiento_habilitacion, :certificaciones, 
                          :seguridad_higiene, :procesos_quimicos, :vencimiento_procesos, 
                          :base_madre_copesa, :base_operativa, :habilitada, :estado, 
                          :activo, :vehiculos_asignados, :permisos_por_vencer, 
                          :tipo_predio, :servicio_principal)";
        
        $stmt = $this->conn->prepare($query);
        
        // Usar operador null coalescing para evitar null en strip_tags
        $this->codigo = htmlspecialchars(strip_tags($this->codigo ?? ''));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre ?? ''));
        $this->tipo = htmlspecialchars(strip_tags($this->tipo ?? ''));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion ?? ''));
        $this->localidad = htmlspecialchars(strip_tags($this->localidad ?? ''));
        $this->provincia = htmlspecialchars(strip_tags($this->provincia ?? ''));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
        $this->email = htmlspecialchars(strip_tags($this->email ?? ''));
        $this->responsable = htmlspecialchars(strip_tags($this->responsable ?? ''));
        $this->tipo_habilitacion = htmlspecialchars(strip_tags($this->tipo_habilitacion ?? ''));
        $this->habilitacion_numero = htmlspecialchars(strip_tags($this->habilitacion_numero ?? ''));
        $this->certificaciones = htmlspecialchars(strip_tags($this->certificaciones ?? ''));
        $this->seguridad_higiene = htmlspecialchars(strip_tags($this->seguridad_higiene ?? ''));
        $this->procesos_quimicos = htmlspecialchars(strip_tags($this->procesos_quimicos ?? ''));
        $this->base_madre_copesa = htmlspecialchars(strip_tags($this->base_madre_copesa ?? ''));
        $this->base_operativa = htmlspecialchars(strip_tags($this->base_operativa ?? ''));
        $this->tipo_predio = htmlspecialchars(strip_tags($this->tipo_predio ?? ''));
        $this->servicio_principal = htmlspecialchars(strip_tags($this->servicio_principal ?? ''));
        
        // Convertir fechas vacías a null
        $this->vencimiento_habilitacion = !empty($this->vencimiento_habilitacion) ? $this->vencimiento_habilitacion : null;
        $this->vencimiento_procesos = !empty($this->vencimiento_procesos) ? $this->vencimiento_procesos : null;
        $this->empresa_id = $this->empresa_id ? (int)$this->empresa_id : null;
        $this->habilitada = $this->habilitada ?: 'Si';
        $this->estado = $this->estado ?: 'Activa';
        $this->activo = isset($this->activo) ? (int)$this->activo : 1;
        $this->vehiculos_asignados = $this->vehiculos_asignados ?: 0;
        $this->permisos_por_vencer = $this->permisos_por_vencer ?: 0;
        
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":localidad", $this->localidad);
        $stmt->bindParam(":provincia", $this->provincia);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":responsable", $this->responsable);
        $stmt->bindParam(":empresa_id", $this->empresa_id);
        $stmt->bindParam(":tipo_habilitacion", $this->tipo_habilitacion);
        $stmt->bindParam(":habilitacion_numero", $this->habilitacion_numero);
        $stmt->bindParam(":vencimiento_habilitacion", $this->vencimiento_habilitacion);
        $stmt->bindParam(":certificaciones", $this->certificaciones);
        $stmt->bindParam(":seguridad_higiene", $this->seguridad_higiene);
        $stmt->bindParam(":procesos_quimicos", $this->procesos_quimicos);
        $stmt->bindParam(":vencimiento_procesos", $this->vencimiento_procesos);
        $stmt->bindParam(":base_madre_copesa", $this->base_madre_copesa);
        $stmt->bindParam(":base_operativa", $this->base_operativa);
        $stmt->bindParam(":habilitada", $this->habilitada);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":vehiculos_asignados", $this->vehiculos_asignados);
        $stmt->bindParam(":permisos_por_vencer", $this->permisos_por_vencer);
        $stmt->bindParam(":tipo_predio", $this->tipo_predio);
        $stmt->bindParam(":servicio_principal", $this->servicio_principal);
        
        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $e) {
            if ($e->getCode() == 23000 && strpos($e->getMessage(), 'Duplicate entry') !== false) {
                throw new Exception("El código '" . $this->codigo . "' ya está registrado");
            }
            throw $e;
        }
    }

    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->codigo = $row['codigo'];
            $this->nombre = $row['nombre'];
            $this->tipo = $row['tipo'];
            $this->direccion = $row['direccion'];
            $this->localidad = $row['localidad'];
            $this->provincia = $row['provincia'];
            $this->telefono = $row['telefono'];
            $this->email = $row['email'];
            $this->responsable = $row['responsable'];
            $this->empresa_id = $row['empresa_id'];
            $this->tipo_habilitacion = $row['tipo_habilitacion'];
            $this->habilitacion_numero = $row['habilitacion_numero'];
            $this->vencimiento_habilitacion = $row['vencimiento_habilitacion'];
            $this->certificaciones = $row['certificaciones'];
            $this->seguridad_higiene = $row['seguridad_higiene'];
            $this->procesos_quimicos = $row['procesos_quimicos'];
            $this->vencimiento_procesos = $row['vencimiento_procesos'];
            $this->base_madre_copesa = $row['base_madre_copesa'];
            $this->base_operativa = $row['base_operativa'];
            $this->habilitada = $row['habilitada'];
            $this->estado = $row['estado'];
            $this->activo = $row['activo'];
            $this->vehiculos_asignados = $row['vehiculos_asignados'];
            $this->permisos_por_vencer = $row['permisos_por_vencer'];
            $this->tipo_predio = $row['tipo_predio'];
            $this->servicio_principal = $row['servicio_principal'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET codigo=:codigo, nombre=:nombre, tipo=:tipo, direccion=:direccion, 
                      localidad=:localidad, provincia=:provincia, telefono=:telefono, 
                      email=:email, responsable=:responsable, empresa_id=:empresa_id,
                      tipo_habilitacion=:tipo_habilitacion, habilitacion_numero=:habilitacion_numero,
                      vencimiento_habilitacion=:vencimiento_habilitacion, 
                      certificaciones=:certificaciones, seguridad_higiene=:seguridad_higiene,
                      procesos_quimicos=:procesos_quimicos, vencimiento_procesos=:vencimiento_procesos,
                      base_madre_copesa=:base_madre_copesa, base_operativa=:base_operativa,
                      habilitada=:habilitada, estado=:estado, activo=:activo,
                      vehiculos_asignados=:vehiculos_asignados, permisos_por_vencer=:permisos_por_vencer,
                      tipo_predio=:tipo_predio, servicio_principal=:servicio_principal,
                      updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        // Usar operador null coalescing para evitar null en strip_tags
        $this->codigo = htmlspecialchars(strip_tags($this->codigo ?? ''));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre ?? ''));
        $this->tipo = htmlspecialchars(strip_tags($this->tipo ?? ''));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion ?? ''));
        $this->localidad = htmlspecialchars(strip_tags($this->localidad ?? ''));
        $this->provincia = htmlspecialchars(strip_tags($this->provincia ?? ''));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
        $this->email = htmlspecialchars(strip_tags($this->email ?? ''));
        $this->responsable = htmlspecialchars(strip_tags($this->responsable ?? ''));
        $this->tipo_habilitacion = htmlspecialchars(strip_tags($this->tipo_habilitacion ?? ''));
        $this->habilitacion_numero = htmlspecialchars(strip_tags($this->habilitacion_numero ?? ''));
        $this->certificaciones = htmlspecialchars(strip_tags($this->certificaciones ?? ''));
        $this->seguridad_higiene = htmlspecialchars(strip_tags($this->seguridad_higiene ?? ''));
        $this->procesos_quimicos = htmlspecialchars(strip_tags($this->procesos_quimicos ?? ''));
        $this->base_madre_copesa = htmlspecialchars(strip_tags($this->base_madre_copesa ?? ''));
        $this->base_operativa = htmlspecialchars(strip_tags($this->base_operativa ?? ''));
        $this->tipo_predio = htmlspecialchars(strip_tags($this->tipo_predio ?? ''));
        $this->servicio_principal = htmlspecialchars(strip_tags($this->servicio_principal ?? ''));
        
        // Convertir fechas vacías a null
        $this->vencimiento_habilitacion = !empty($this->vencimiento_habilitacion) ? $this->vencimiento_habilitacion : null;
        $this->vencimiento_procesos = !empty($this->vencimiento_procesos) ? $this->vencimiento_procesos : null;
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":localidad", $this->localidad);
        $stmt->bindParam(":provincia", $this->provincia);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":responsable", $this->responsable);
        $stmt->bindParam(":empresa_id", $this->empresa_id);
        $stmt->bindParam(":tipo_habilitacion", $this->tipo_habilitacion);
        $stmt->bindParam(":habilitacion_numero", $this->habilitacion_numero);
        $stmt->bindParam(":vencimiento_habilitacion", $this->vencimiento_habilitacion);
        $stmt->bindParam(":certificaciones", $this->certificaciones);
        $stmt->bindParam(":seguridad_higiene", $this->seguridad_higiene);
        $stmt->bindParam(":procesos_quimicos", $this->procesos_quimicos);
        $stmt->bindParam(":vencimiento_procesos", $this->vencimiento_procesos);
        $stmt->bindParam(":base_madre_copesa", $this->base_madre_copesa);
        $stmt->bindParam(":base_operativa", $this->base_operativa);
        $stmt->bindParam(":habilitada", $this->habilitada);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":vehiculos_asignados", $this->vehiculos_asignados);
        $stmt->bindParam(":permisos_por_vencer", $this->permisos_por_vencer);
        $stmt->bindParam(":tipo_predio", $this->tipo_predio);
        $stmt->bindParam(":servicio_principal", $this->servicio_principal);
        
        return $stmt->execute();
    }

    public function eliminar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }

    public function leer() {
        $query = "SELECT s.*, e.nombre as empresa_nombre 
                  FROM " . $this->table_name . " s
                  LEFT JOIN empresas e ON s.empresa_id = e.id
                  WHERE s.activo = 1 
                  ORDER BY s.nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function leerConFiltros($search = '', $provincia = '', $estado = '', $tipo = '', $limit = 10, $offset = 0) {
        $query = "SELECT s.*, e.nombre as empresa_nombre 
                  FROM " . $this->table_name . " s
                  LEFT JOIN empresas e ON s.empresa_id = e.id
                  WHERE s.activo = 1";
        
        if (!empty($search)) {
            $query .= " AND (s.nombre LIKE :search OR s.codigo LIKE :search OR s.localidad LIKE :search)";
        }
        if (!empty($provincia)) {
            $query .= " AND s.provincia = :provincia";
        }
        if (!empty($estado)) {
            $query .= " AND s.estado = :estado";
        }
        if (!empty($tipo)) {
            $query .= " AND s.tipo = :tipo";
        }
        
        $query .= " ORDER BY s.nombre LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%$search%";
            $stmt->bindParam(":search", $search_term);
        }
        if (!empty($provincia)) {
            $stmt->bindParam(":provincia", $provincia);
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

    public function contarConFiltros($search = '', $provincia = '', $estado = '', $tipo = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE activo = 1";
        
        if (!empty($search)) {
            $query .= " AND (nombre LIKE :search OR codigo LIKE :search OR localidad LIKE :search)";
        }
        if (!empty($provincia)) {
            $query .= " AND provincia = :provincia";
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
        if (!empty($provincia)) {
            $stmt->bindParam(":provincia", $provincia);
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

    public function obtenerOpcionesFiltros() {
        $opciones = [];
        
        // Provincias
        $query = "SELECT DISTINCT provincia FROM " . $this->table_name . " WHERE provincia IS NOT NULL AND provincia != '' ORDER BY provincia";
        $stmt = $this->conn->query($query);
        $opciones['provincias'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Estados
        $query = "SELECT DISTINCT estado FROM " . $this->table_name . " WHERE estado IS NOT NULL ORDER BY estado";
        $stmt = $this->conn->query($query);
        $opciones['estados'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Tipos
        $query = "SELECT DISTINCT tipo FROM " . $this->table_name . " WHERE tipo IS NOT NULL ORDER BY tipo";
        $stmt = $this->conn->query($query);
        $opciones['tipos'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return $opciones;
    }

    public function obtenerPorEmpresa($empresa_id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE empresa_id = ? AND activo = 1 
                  ORDER BY nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $empresa_id);
        $stmt->execute();
        return $stmt;
    }
}
?>
