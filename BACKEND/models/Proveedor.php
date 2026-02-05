<?php
// BACKEND/models/Proveedor.php - CORREGIDO PARA COINCIDIR CON LA BD REAL
class Proveedor {
    private $conn;
    private $table_name = "proveedores";

    // Propiedades que coinciden con la tabla real
    public $id;
    public $codigo;
    public $razon_social;
    public $cuit;
    public $rubro;
    public $tipo_proveedor;
    public $sector_servicio;
    public $servicio_especifico; // CORREGIDO: en BD es servicio_especifico
    public $direccion;
    public $localidad;
    public $provincia;
    public $telefono;
    public $email;
    public $contacto_nombre;
    public $contacto_cargo;
    public $estado;
    public $seguro_RT;
    public $seguro_vida_personal; // CORREGIDO: en BD es seguro_vida_personal
    public $poliza_RT; // AGREGADO
    public $vencimiento_poliza_RT; // AGREGADO
    public $habilitacion_personal;
    public $vencimiento_habilitacion_personal;
    public $habilitacion_vehiculo;
    public $vencimiento_habilitacion_vehiculo;
    public $documentos_cantidad; // AGREGADO
    public $proximo_vencimiento;
    public $frecuencia_renovacion;
    public $campos_personalizados;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

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
                  (codigo, razon_social, cuit, rubro, tipo_proveedor, sector_servicio, servicio_especifico,
                   direccion, localidad, provincia, telefono, email, contacto_nombre, contacto_cargo,
                   estado, seguro_RT, seguro_vida_personal, poliza_RT, vencimiento_poliza_RT,
                   habilitacion_personal, vencimiento_habilitacion_personal, habilitacion_vehiculo,
                   vencimiento_habilitacion_vehiculo, documentos_cantidad, proximo_vencimiento,
                   frecuencia_renovacion, campos_personalizados, activo) 
                  VALUES 
                  (:codigo, :razon_social, :cuit, :rubro, :tipo_proveedor, :sector_servicio, :servicio_especifico,
                   :direccion, :localidad, :provincia, :telefono, :email, :contacto_nombre, :contacto_cargo,
                   :estado, :seguro_RT, :seguro_vida_personal, :poliza_RT, :vencimiento_poliza_RT,
                   :habilitacion_personal, :vencimiento_habilitacion_personal, :habilitacion_vehiculo,
                   :vencimiento_habilitacion_vehiculo, :documentos_cantidad, :proximo_vencimiento,
                   :frecuencia_renovacion, :campos_personalizados, :activo)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar - usar operador null coalescing para evitar null en strip_tags
        $this->codigo = htmlspecialchars(strip_tags($this->codigo ?? ''));
        $this->razon_social = htmlspecialchars(strip_tags($this->razon_social ?? ''));
        $this->cuit = htmlspecialchars(strip_tags($this->cuit ?? ''));
        $this->rubro = htmlspecialchars(strip_tags($this->rubro ?? ''));
        $this->tipo_proveedor = htmlspecialchars(strip_tags($this->tipo_proveedor ?? 'terciarizado'));
        $this->sector_servicio = htmlspecialchars(strip_tags($this->sector_servicio ?? ''));
        $this->servicio_especifico = htmlspecialchars(strip_tags($this->servicio_especifico ?? ''));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion ?? ''));
        $this->localidad = htmlspecialchars(strip_tags($this->localidad ?? ''));
        $this->provincia = htmlspecialchars(strip_tags($this->provincia ?? 'Buenos Aires'));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
        $this->email = htmlspecialchars(strip_tags($this->email ?? ''));
        $this->contacto_nombre = htmlspecialchars(strip_tags($this->contacto_nombre ?? ''));
        $this->contacto_cargo = htmlspecialchars(strip_tags($this->contacto_cargo ?? ''));
        $this->estado = htmlspecialchars(strip_tags($this->estado ?? 'Activo'));
        $this->seguro_RT = (int)($this->seguro_RT ?? 0);
        $this->seguro_vida_personal = (int)($this->seguro_vida_personal ?? 0);
        $this->poliza_RT = htmlspecialchars(strip_tags($this->poliza_RT ?? ''));
        // Convertir fechas vacías a null para evitar error de formato datetime
        $this->vencimiento_poliza_RT = !empty($this->vencimiento_poliza_RT) ? $this->vencimiento_poliza_RT : null;
        $this->habilitacion_personal = htmlspecialchars(strip_tags($this->habilitacion_personal ?? ''));
        $this->vencimiento_habilitacion_personal = !empty($this->vencimiento_habilitacion_personal) ? $this->vencimiento_habilitacion_personal : null;
        $this->habilitacion_vehiculo = htmlspecialchars(strip_tags($this->habilitacion_vehiculo ?? ''));
        $this->vencimiento_habilitacion_vehiculo = !empty($this->vencimiento_habilitacion_vehiculo) ? $this->vencimiento_habilitacion_vehiculo : null;
        $this->documentos_cantidad = (int)($this->documentos_cantidad ?? 0);
        $this->proximo_vencimiento = !empty($this->proximo_vencimiento) ? $this->proximo_vencimiento : null;
        $this->frecuencia_renovacion = htmlspecialchars(strip_tags($this->frecuencia_renovacion ?? 'anual'));
        $campos_json = $this->campos_personalizados ? json_encode($this->campos_personalizados) : null;
        $this->activo = (int)($this->activo ?? 1);
        
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":razon_social", $this->razon_social);
        $stmt->bindParam(":cuit", $this->cuit);
        $stmt->bindParam(":rubro", $this->rubro);
        $stmt->bindParam(":tipo_proveedor", $this->tipo_proveedor);
        $stmt->bindParam(":sector_servicio", $this->sector_servicio);
        $stmt->bindParam(":servicio_especifico", $this->servicio_especifico);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":localidad", $this->localidad);
        $stmt->bindParam(":provincia", $this->provincia);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":contacto_nombre", $this->contacto_nombre);
        $stmt->bindParam(":contacto_cargo", $this->contacto_cargo);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":seguro_RT", $this->seguro_RT, PDO::PARAM_INT);
        $stmt->bindParam(":seguro_vida_personal", $this->seguro_vida_personal, PDO::PARAM_INT);
        $stmt->bindParam(":poliza_RT", $this->poliza_RT);
        $stmt->bindParam(":vencimiento_poliza_RT", $this->vencimiento_poliza_RT);
        $stmt->bindParam(":habilitacion_personal", $this->habilitacion_personal);
        $stmt->bindParam(":vencimiento_habilitacion_personal", $this->vencimiento_habilitacion_personal);
        $stmt->bindParam(":habilitacion_vehiculo", $this->habilitacion_vehiculo);
        $stmt->bindParam(":vencimiento_habilitacion_vehiculo", $this->vencimiento_habilitacion_vehiculo);
        $stmt->bindParam(":documentos_cantidad", $this->documentos_cantidad, PDO::PARAM_INT);
        $stmt->bindParam(":proximo_vencimiento", $this->proximo_vencimiento);
        $stmt->bindParam(":frecuencia_renovacion", $this->frecuencia_renovacion);
        $stmt->bindParam(":campos_personalizados", $campos_json);
        $stmt->bindParam(":activo", $this->activo, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function leerUno() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->codigo = $row['codigo'] ?? '';
            $this->razon_social = $row['razon_social'];
            $this->cuit = $row['cuit'] ?? '';
            $this->rubro = $row['rubro'] ?? '';
            $this->tipo_proveedor = $row['tipo_proveedor'] ?? 'terciarizado';
            $this->sector_servicio = $row['sector_servicio'] ?? '';
            $this->servicio_especifico = $row['servicio_especifico'] ?? '';
            $this->direccion = $row['direccion'] ?? '';
            $this->localidad = $row['localidad'] ?? '';
            $this->provincia = $row['provincia'] ?? '';
            $this->telefono = $row['telefono'] ?? '';
            $this->email = $row['email'] ?? '';
            $this->contacto_nombre = $row['contacto_nombre'] ?? '';
            $this->contacto_cargo = $row['contacto_cargo'] ?? '';
            $this->estado = $row['estado'] ?? 'Activo';
            $this->seguro_RT = (int)($row['seguro_RT'] ?? 0);
            $this->seguro_vida_personal = (int)($row['seguro_vida_personal'] ?? 0);
            $this->poliza_RT = $row['poliza_RT'] ?? '';
            $this->vencimiento_poliza_RT = $row['vencimiento_poliza_RT'] ?? '';
            $this->habilitacion_personal = $row['habilitacion_personal'] ?? '';
            $this->vencimiento_habilitacion_personal = $row['vencimiento_habilitacion_personal'] ?? '';
            $this->habilitacion_vehiculo = $row['habilitacion_vehiculo'] ?? '';
            $this->vencimiento_habilitacion_vehiculo = $row['vencimiento_habilitacion_vehiculo'] ?? '';
            $this->documentos_cantidad = (int)($row['documentos_cantidad'] ?? 0);
            $this->proximo_vencimiento = $row['proximo_vencimiento'] ?? '';
            $this->frecuencia_renovacion = $row['frecuencia_renovacion'] ?? 'anual';
            $this->campos_personalizados = $row['campos_personalizados'] ? json_decode($row['campos_personalizados'], true) : [];
            $this->activo = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table_name . " 
                  SET codigo=:codigo, razon_social=:razon_social, cuit=:cuit, rubro=:rubro, 
                      tipo_proveedor=:tipo_proveedor, sector_servicio=:sector_servicio, 
                      servicio_especifico=:servicio_especifico, direccion=:direccion, 
                      localidad=:localidad, provincia=:provincia, telefono=:telefono, email=:email,
                      contacto_nombre=:contacto_nombre, contacto_cargo=:contacto_cargo, estado=:estado,
                      seguro_RT=:seguro_RT, seguro_vida_personal=:seguro_vida_personal, 
                      poliza_RT=:poliza_RT, vencimiento_poliza_RT=:vencimiento_poliza_RT,
                      habilitacion_personal=:habilitacion_personal, 
                      vencimiento_habilitacion_personal=:vencimiento_habilitacion_personal,
                      habilitacion_vehiculo=:habilitacion_vehiculo,
                      vencimiento_habilitacion_vehiculo=:vencimiento_habilitacion_vehiculo,
                      documentos_cantidad=:documentos_cantidad, proximo_vencimiento=:proximo_vencimiento,
                      frecuencia_renovacion=:frecuencia_renovacion, campos_personalizados=:campos_personalizados,
                      activo=:activo, updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";
        
        // Sanitizar - usar operador null coalescing para evitar null en strip_tags
        $this->id = htmlspecialchars(strip_tags($this->id ?? ''));
        $this->codigo = htmlspecialchars(strip_tags($this->codigo ?? ''));
        $this->razon_social = htmlspecialchars(strip_tags($this->razon_social ?? ''));
        $this->cuit = htmlspecialchars(strip_tags($this->cuit ?? ''));
        $this->rubro = htmlspecialchars(strip_tags($this->rubro ?? ''));
        $this->tipo_proveedor = htmlspecialchars(strip_tags($this->tipo_proveedor ?? 'terciarizado'));
        $this->sector_servicio = htmlspecialchars(strip_tags($this->sector_servicio ?? ''));
        $this->servicio_especifico = htmlspecialchars(strip_tags($this->servicio_especifico ?? ''));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion ?? ''));
        $this->localidad = htmlspecialchars(strip_tags($this->localidad ?? ''));
        $this->provincia = htmlspecialchars(strip_tags($this->provincia ?? 'Buenos Aires'));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
        $this->email = htmlspecialchars(strip_tags($this->email ?? ''));
        $this->contacto_nombre = htmlspecialchars(strip_tags($this->contacto_nombre ?? ''));
        $this->contacto_cargo = htmlspecialchars(strip_tags($this->contacto_cargo ?? ''));
        $this->estado = htmlspecialchars(strip_tags($this->estado ?? 'Activo'));
        $this->seguro_RT = (int)($this->seguro_RT ?? 0);
        $this->seguro_vida_personal = (int)($this->seguro_vida_personal ?? 0);
        $this->poliza_RT = htmlspecialchars(strip_tags($this->poliza_RT ?? ''));
        // Convertir fechas vacías a null para evitar error de formato datetime
        $this->vencimiento_poliza_RT = !empty($this->vencimiento_poliza_RT) ? $this->vencimiento_poliza_RT : null;
        $this->habilitacion_personal = htmlspecialchars(strip_tags($this->habilitacion_personal ?? ''));
        $this->vencimiento_habilitacion_personal = !empty($this->vencimiento_habilitacion_personal) ? $this->vencimiento_habilitacion_personal : null;
        $this->habilitacion_vehiculo = htmlspecialchars(strip_tags($this->habilitacion_vehiculo ?? ''));
        $this->vencimiento_habilitacion_vehiculo = !empty($this->vencimiento_habilitacion_vehiculo) ? $this->vencimiento_habilitacion_vehiculo : null;
        $this->documentos_cantidad = (int)($this->documentos_cantidad ?? 0);
        $this->proximo_vencimiento = !empty($this->proximo_vencimiento) ? $this->proximo_vencimiento : null;
        $this->frecuencia_renovacion = htmlspecialchars(strip_tags($this->frecuencia_renovacion ?? 'anual'));
        $campos_json = $this->campos_personalizados ? json_encode($this->campos_personalizados) : null;
        $this->activo = (int)($this->activo ?? 1);
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":razon_social", $this->razon_social);
        $stmt->bindParam(":cuit", $this->cuit);
        $stmt->bindParam(":rubro", $this->rubro);
        $stmt->bindParam(":tipo_proveedor", $this->tipo_proveedor);
        $stmt->bindParam(":sector_servicio", $this->sector_servicio);
        $stmt->bindParam(":servicio_especifico", $this->servicio_especifico);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":localidad", $this->localidad);
        $stmt->bindParam(":provincia", $this->provincia);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":contacto_nombre", $this->contacto_nombre);
        $stmt->bindParam(":contacto_cargo", $this->contacto_cargo);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":seguro_RT", $this->seguro_RT, PDO::PARAM_INT);
        $stmt->bindParam(":seguro_vida_personal", $this->seguro_vida_personal, PDO::PARAM_INT);
        $stmt->bindParam(":poliza_RT", $this->poliza_RT);
        $stmt->bindParam(":vencimiento_poliza_RT", $this->vencimiento_poliza_RT);
        $stmt->bindParam(":habilitacion_personal", $this->habilitacion_personal);
        $stmt->bindParam(":vencimiento_habilitacion_personal", $this->vencimiento_habilitacion_personal);
        $stmt->bindParam(":habilitacion_vehiculo", $this->habilitacion_vehiculo);
        $stmt->bindParam(":vencimiento_habilitacion_vehiculo", $this->vencimiento_habilitacion_vehiculo);
        $stmt->bindParam(":documentos_cantidad", $this->documentos_cantidad, PDO::PARAM_INT);
        $stmt->bindParam(":proximo_vencimiento", $this->proximo_vencimiento);
        $stmt->bindParam(":frecuencia_renovacion", $this->frecuencia_renovacion);
        $stmt->bindParam(":campos_personalizados", $campos_json);
        $stmt->bindParam(":activo", $this->activo, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1 ORDER BY razon_social";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function leerConFiltros($search = '', $rubro = '', $estado = '', $localidad = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (razon_social LIKE :search OR cuit LIKE :search OR codigo LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($rubro) && $rubro !== 'Todos los rubros') {
            $query .= " AND rubro = :rubro";
            $params[':rubro'] = $rubro;
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $query .= " AND estado = :estado";
            $params[':estado'] = $estado;
        }
        
        if (!empty($localidad) && $localidad !== 'Todas las localidades') {
            $query .= " AND localidad = :localidad";
            $params[':localidad'] = $localidad;
        }
        
        $query .= " ORDER BY razon_social LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    public function contarConFiltros($search = '', $rubro = '', $estado = '', $localidad = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE activo = 1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (razon_social LIKE :search OR cuit LIKE :search OR codigo LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($rubro) && $rubro !== 'Todos los rubros') {
            $query .= " AND rubro = :rubro";
            $params[':rubro'] = $rubro;
        }
        
        if (!empty($estado) && $estado !== 'Todos los estados') {
            $query .= " AND estado = :estado";
            $params[':estado'] = $estado;
        }
        
        if (!empty($localidad) && $localidad !== 'Todas las localidades') {
            $query .= " AND localidad = :localidad";
            $params[':localidad'] = $localidad;
        }
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
    
    public function obtenerOpcionesFiltros() {
        $rubros = array();
        $localidades = array();
        
        $query = "SELECT DISTINCT rubro FROM " . $this->table_name . " WHERE rubro IS NOT NULL AND rubro != '' ORDER BY rubro";
        $stmt = $this->conn->query($query);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rubros[] = $row['rubro'];
        }
        
        $query = "SELECT DISTINCT localidad FROM " . $this->table_name . " WHERE localidad IS NOT NULL AND localidad != '' ORDER BY localidad";
        $stmt = $this->conn->query($query);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $localidades[] = $row['localidad'];
        }
        
        return array(
            'rubros' => $rubros,
            'localidades' => $localidades,
            'estados' => array('Activo', 'Suspendido', 'Inactivo')
        );
    }
    
    // Método para eliminación lógica (cambiar estado a inactivo)
    public function eliminar() {
        $query = "UPDATE " . $this->table_name . " SET estado = 'Inactivo', updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id ?? ''));
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
}
?>
