<?php
// BACKEND/models/Personal.php - CORREGIDO PARA COINCIDIR CON LA BD REAL
class Personal {
    private $conn;
    private $table_name = "personal";

    // Propiedades que coinciden con la tabla real
    public $id;
    public $legajo;
    public $nombre;
    public $apellido;
    public $dni;
    public $cuil;
    public $telefono;
    public $email;
    public $correo_corporativo; // CORREGIDO: en BD es correo_corporativo
    public $puesto;
    public $sector;
    public $rol_sistema;
    public $fecha_ingreso;
    public $fecha_nacimiento;
    public $direccion;
    public $tipo_contrato;
    public $estado_licencia; // CORREGIDO: en BD es estado_licencia
    public $clase_licencia; // CORREGIDO: en BD es clase_licencia
    public $vencimiento_licencia;
    public $certificados; // CORREGIDO: en BD es certificados (json)
    public $carnet_cargas_peligrosas;
    public $vencimiento_carnet;
    public $capacitaciones; // AGREGADO: existe en BD
    public $observaciones;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crear() {
        // Verificar si DNI ya existe
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE dni = :dni AND activo = 1";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":dni", $this->dni);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            throw new Exception("El DNI ya está registrado");
        }

        // Verificar si legajo ya existe (solo si legajo no está vacío)
        if (!empty($this->legajo)) {
            $check_query = "SELECT id FROM " . $this->table_name . " WHERE legajo = :legajo AND activo = 1";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(":legajo", $this->legajo);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() > 0) {
                throw new Exception("El legajo ya está registrado");
            }
        }

        $query = "INSERT INTO " . $this->table_name . " 
                  (legajo, nombre, apellido, dni, cuil, telefono, email, correo_corporativo, 
                   puesto, sector, rol_sistema, fecha_ingreso, fecha_nacimiento, direccion, 
                   tipo_contrato, estado_licencia, clase_licencia, vencimiento_licencia,
                   certificados, carnet_cargas_peligrosas, vencimiento_carnet, capacitaciones,
                   observaciones, activo) 
                  VALUES 
                  (:legajo, :nombre, :apellido, :dni, :cuil, :telefono, :email, :correo_corporativo,
                   :puesto, :sector, :rol_sistema, :fecha_ingreso, :fecha_nacimiento, :direccion,
                   :tipo_contrato, :estado_licencia, :clase_licencia, :vencimiento_licencia,
                   :certificados, :carnet_cargas_peligrosas, :vencimiento_carnet, :capacitaciones,
                   :observaciones, :activo)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar - usar operador null coalescing para evitar null en strip_tags
        $this->legajo = htmlspecialchars(strip_tags($this->legajo ?? ''));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre ?? ''));
        $this->apellido = htmlspecialchars(strip_tags($this->apellido ?? ''));
        $this->dni = htmlspecialchars(strip_tags($this->dni ?? ''));
        $this->cuil = htmlspecialchars(strip_tags($this->cuil ?? ''));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
        $this->email = htmlspecialchars(strip_tags($this->email ?? ''));
        $this->correo_corporativo = htmlspecialchars(strip_tags($this->correo_corporativo ?? ''));
        $this->puesto = htmlspecialchars(strip_tags($this->puesto ?? ''));
        $this->sector = htmlspecialchars(strip_tags($this->sector ?? ''));
        $this->rol_sistema = htmlspecialchars(strip_tags($this->rol_sistema ?? 'usuario'));
        $this->fecha_ingreso = !empty($this->fecha_ingreso) ? $this->fecha_ingreso : date('Y-m-d');
        $this->fecha_nacimiento = !empty($this->fecha_nacimiento) ? $this->fecha_nacimiento : null;
        $this->direccion = htmlspecialchars(strip_tags($this->direccion ?? ''));
        $this->tipo_contrato = htmlspecialchars(strip_tags($this->tipo_contrato ?? ''));
        $this->estado_licencia = htmlspecialchars(strip_tags($this->estado_licencia ?? ''));
        $this->clase_licencia = htmlspecialchars(strip_tags($this->clase_licencia ?? ''));
        $this->vencimiento_licencia = !empty($this->vencimiento_licencia) ? $this->vencimiento_licencia : null;
        $this->certificados = $this->certificados ? json_encode($this->certificados) : null;
        $this->carnet_cargas_peligrosas = htmlspecialchars(strip_tags($this->carnet_cargas_peligrosas ?? ''));
        $this->vencimiento_carnet = !empty($this->vencimiento_carnet) ? $this->vencimiento_carnet : null;
        $this->capacitaciones = $this->capacitaciones ? json_encode($this->capacitaciones) : null;
        $this->observaciones = htmlspecialchars(strip_tags($this->observaciones ?? ''));
        $this->activo = (int)($this->activo ?? 1);
        
        $stmt->bindParam(":legajo", $this->legajo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellido", $this->apellido);
        $stmt->bindParam(":dni", $this->dni);
        $stmt->bindParam(":cuil", $this->cuil);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":correo_corporativo", $this->correo_corporativo);
        $stmt->bindParam(":puesto", $this->puesto);
        $stmt->bindParam(":sector", $this->sector);
        $stmt->bindParam(":rol_sistema", $this->rol_sistema);
        $stmt->bindParam(":fecha_ingreso", $this->fecha_ingreso);
        $stmt->bindParam(":fecha_nacimiento", $this->fecha_nacimiento);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":tipo_contrato", $this->tipo_contrato);
        $stmt->bindParam(":estado_licencia", $this->estado_licencia);
        $stmt->bindParam(":clase_licencia", $this->clase_licencia);
        $stmt->bindParam(":vencimiento_licencia", $this->vencimiento_licencia);
        $stmt->bindParam(":certificados", $this->certificados);
        $stmt->bindParam(":carnet_cargas_peligrosas", $this->carnet_cargas_peligrosas);
        $stmt->bindParam(":vencimiento_carnet", $this->vencimiento_carnet);
        $stmt->bindParam(":capacitaciones", $this->capacitaciones);
        $stmt->bindParam(":observaciones", $this->observaciones);
        $stmt->bindParam(":activo", $this->activo, PDO::PARAM_INT);
        
        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $e) {
            // Manejar errores de duplicado de manera amigable
            if ($e->getCode() == 23000) {
                // Error de integridad (duplicado)
                if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    if (strpos($e->getMessage(), 'legajo') !== false) {
                        throw new Exception("El legajo '" . $this->legajo . "' ya está registrado");
                    } elseif (strpos($e->getMessage(), 'dni') !== false) {
                        throw new Exception("El DNI '" . $this->dni . "' ya está registrado");
                    } else {
                        throw new Exception("Ya existe un registro con estos datos");
                    }
                }
            }
            // Re-lanzar otros errores
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
            $this->legajo = $row['legajo'] ?? '';
            $this->nombre = $row['nombre'];
            $this->apellido = $row['apellido'];
            $this->dni = $row['dni'];
            $this->cuil = $row['cuil'] ?? '';
            $this->telefono = $row['telefono'] ?? '';
            $this->email = $row['email'] ?? '';
            $this->correo_corporativo = $row['correo_corporativo'] ?? '';
            $this->puesto = $row['puesto'] ?? '';
            $this->sector = $row['sector'] ?? '';
            $this->rol_sistema = $row['rol_sistema'] ?? 'usuario';
            $this->fecha_ingreso = $row['fecha_ingreso'] ?? '';
            $this->fecha_nacimiento = $row['fecha_nacimiento'] ?? '';
            $this->direccion = $row['direccion'] ?? '';
            $this->tipo_contrato = $row['tipo_contrato'] ?? '';
            $this->estado_licencia = $row['estado_licencia'] ?? '';
            $this->clase_licencia = $row['clase_licencia'] ?? '';
            $this->vencimiento_licencia = $row['vencimiento_licencia'] ?? '';
            $this->certificados = $row['certificados'] ? json_decode($row['certificados'], true) : [];
            $this->carnet_cargas_peligrosas = $row['carnet_cargas_peligrosas'] ?? '';
            $this->vencimiento_carnet = $row['vencimiento_carnet'] ?? '';
            $this->capacitaciones = $row['capacitaciones'] ? json_decode($row['capacitaciones'], true) : [];
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
                  SET legajo=:legajo, nombre=:nombre, apellido=:apellido, dni=:dni, cuil=:cuil,
                      telefono=:telefono, email=:email, correo_corporativo=:correo_corporativo,
                      puesto=:puesto, sector=:sector, rol_sistema=:rol_sistema, fecha_ingreso=:fecha_ingreso,
                      fecha_nacimiento=:fecha_nacimiento, direccion=:direccion, tipo_contrato=:tipo_contrato,
                      estado_licencia=:estado_licencia, clase_licencia=:clase_licencia, 
                      vencimiento_licencia=:vencimiento_licencia, certificados=:certificados,
                      carnet_cargas_peligrosas=:carnet_cargas_peligrosas, vencimiento_carnet=:vencimiento_carnet,
                      capacitaciones=:capacitaciones, observaciones=:observaciones, activo=:activo,
                      updated_at=CURRENT_TIMESTAMP 
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id ?? ''));
        $this->legajo = htmlspecialchars(strip_tags($this->legajo ?? ''));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre ?? ''));
        $this->apellido = htmlspecialchars(strip_tags($this->apellido ?? ''));
        $this->dni = htmlspecialchars(strip_tags($this->dni ?? ''));
        $this->cuil = htmlspecialchars(strip_tags($this->cuil ?? ''));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
        $this->email = htmlspecialchars(strip_tags($this->email ?? ''));
        $this->correo_corporativo = htmlspecialchars(strip_tags($this->correo_corporativo ?? ''));
        $this->puesto = htmlspecialchars(strip_tags($this->puesto ?? ''));
        $this->sector = htmlspecialchars(strip_tags($this->sector ?? ''));
        $this->rol_sistema = htmlspecialchars(strip_tags($this->rol_sistema ?? 'usuario'));
        $this->fecha_ingreso = !empty($this->fecha_ingreso) ? $this->fecha_ingreso : date('Y-m-d');
        $this->fecha_nacimiento = !empty($this->fecha_nacimiento) ? $this->fecha_nacimiento : null;
        $this->direccion = htmlspecialchars(strip_tags($this->direccion ?? ''));
        $this->tipo_contrato = htmlspecialchars(strip_tags($this->tipo_contrato ?? ''));
        $this->estado_licencia = htmlspecialchars(strip_tags($this->estado_licencia ?? ''));
        $this->clase_licencia = htmlspecialchars(strip_tags($this->clase_licencia ?? ''));
        $this->vencimiento_licencia = !empty($this->vencimiento_licencia) ? $this->vencimiento_licencia : null;
        $this->certificados = $this->certificados ? json_encode($this->certificados) : null;
        $this->carnet_cargas_peligrosas = htmlspecialchars(strip_tags($this->carnet_cargas_peligrosas ?? ''));
        $this->vencimiento_carnet = !empty($this->vencimiento_carnet) ? $this->vencimiento_carnet : null;
        $this->capacitaciones = $this->capacitaciones ? json_encode($this->capacitaciones) : null;
        $this->observaciones = htmlspecialchars(strip_tags($this->observaciones ?? ''));
        $this->activo = (int)($this->activo ?? 1);
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":legajo", $this->legajo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellido", $this->apellido);
        $stmt->bindParam(":dni", $this->dni);
        $stmt->bindParam(":cuil", $this->cuil);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":correo_corporativo", $this->correo_corporativo);
        $stmt->bindParam(":puesto", $this->puesto);
        $stmt->bindParam(":sector", $this->sector);
        $stmt->bindParam(":rol_sistema", $this->rol_sistema);
        $stmt->bindParam(":fecha_ingreso", $this->fecha_ingreso);
        $stmt->bindParam(":fecha_nacimiento", $this->fecha_nacimiento);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":tipo_contrato", $this->tipo_contrato);
        $stmt->bindParam(":estado_licencia", $this->estado_licencia);
        $stmt->bindParam(":clase_licencia", $this->clase_licencia);
        $stmt->bindParam(":vencimiento_licencia", $this->vencimiento_licencia);
        $stmt->bindParam(":certificados", $this->certificados);
        $stmt->bindParam(":carnet_cargas_peligrosas", $this->carnet_cargas_peligrosas);
        $stmt->bindParam(":vencimiento_carnet", $this->vencimiento_carnet);
        $stmt->bindParam(":capacitaciones", $this->capacitaciones);
        $stmt->bindParam(":observaciones", $this->observaciones);
        $stmt->bindParam(":activo", $this->activo, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
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

    public function leerConFiltros($search = '', $sector = '', $estado = '', $limit = 10, $offset = 0) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (nombre LIKE :search OR apellido LIKE :search OR dni LIKE :search OR legajo LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($sector)) {
            $query .= " AND sector = :sector";
            $params[':sector'] = $sector;
        }
        
        if (!empty($estado)) {
            if ($estado === 'Activo') {
                $query .= " AND activo = 1";
            } elseif ($estado === 'Inactivo') {
                $query .= " AND activo = 0";
            } else {
                $query .= " AND estado_licencia = :estado_licencia";
                $params[':estado_licencia'] = $estado;
            }
        }
        
        $query .= " ORDER BY nombre, apellido LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    public function contarConFiltros($search = '', $sector = '', $estado = '') {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE 1=1";
        $params = array();
        
        if (!empty($search)) {
            $query .= " AND (nombre LIKE :search OR apellido LIKE :search OR dni LIKE :search OR legajo LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        if (!empty($sector)) {
            $query .= " AND sector = :sector";
            $params[':sector'] = $sector;
        }
        
        if (!empty($estado)) {
            if ($estado === 'Activo') {
                $query .= " AND activo = 1";
            } elseif ($estado === 'Inactivo') {
                $query .= " AND activo = 0";
            } else {
                $query .= " AND estado_licencia = :estado_licencia";
                $params[':estado_licencia'] = $estado;
            }
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
        $sectores = array();
        
        $query = "SELECT DISTINCT sector FROM " . $this->table_name . " WHERE sector IS NOT NULL AND sector != '' ORDER BY sector";
        $stmt = $this->conn->query($query);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $sectores[] = $row['sector'];
        }
        
        return array(
            'sectores' => $sectores,
            'estados' => array('Activo', 'Inactivo', 'Licencia')
        );
    }
    
    // Método para eliminación lógica (cambiar estado a inactivo)
    public function eliminar() {
        $query = "UPDATE " . $this->table_name . " SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id ?? ''));
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
}
?>
