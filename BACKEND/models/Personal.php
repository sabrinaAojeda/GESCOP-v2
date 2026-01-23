<?php
// BACKEND/models/Personal.php - VERSIÓN COMPLETA
class Personal {
    private $conn;
    private $table_name = "personal";

    // Propiedades públicas
    public $id;
    public $legajo;
    public $nombre;
    public $apellido;
    public $dni;
    public $cuil;
    public $telefono;
    public $email;
    public $correo_corporativo;
    public $puesto;
    public $sector;
    public $rol_sistema;
    public $fecha_ingreso;
    public $fecha_nacimiento;
    public $direccion;
    public $tipo_contrato;
    public $estado_licencia;
    public $clase_licencia;
    public $vencimiento_licencia;
    public $certificados;
    public $carnet_cargas_peligrosas;
    public $vencimiento_carnet;
    public $observaciones;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Leer todos los registros con filtros
    public function leerConFiltros($search = '', $sector = '', $estado = '', $limit = 10, $offset = 0) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
            $params = array();
            
            // Filtro de búsqueda
            if (!empty($search)) {
                $query .= " AND (nombre LIKE :search OR apellido LIKE :search OR dni LIKE :search OR legajo LIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }
            
            // Filtro por sector
            if (!empty($sector)) {
                $query .= " AND sector = :sector";
                $params[':sector'] = $sector;
            }
            
            // Filtro por estado
            if (!empty($estado)) {
                if ($estado === 'Activo') {
                    $query .= " AND activo = 1";
                } elseif ($estado === 'Inactivo') {
                    $query .= " AND activo = 0";
                } elseif ($estado === 'Licencia') {
                    $query .= " AND estado_licencia = 'Licencia'";
                }
            }
            
            // Orden y límite
            $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind de parámetros
            if (!empty($search)) {
                $stmt->bindParam(':search', $params[':search']);
            }
            if (!empty($sector)) {
                $stmt->bindParam(':sector', $params[':sector']);
            }
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
            
            $stmt->execute();
            return $stmt;
            
        } catch (PDOException $e) {
            error_log("Error en leerConFiltros: " . $e->getMessage());
            return false;
        }
    }

    // Contar registros con filtros
    public function contarConFiltros($search = '', $sector = '', $estado = '') {
        try {
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
                } elseif ($estado === 'Licencia') {
                    $query .= " AND estado_licencia = 'Licencia'";
                }
            }
            
            $stmt = $this->conn->prepare($query);
            
            if (!empty($search)) {
                $stmt->bindParam(':search', $params[':search']);
            }
            if (!empty($sector)) {
                $stmt->bindParam(':sector', $params[':sector']);
            }
            
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $row['total'];
            
        } catch (PDOException $e) {
            error_log("Error en contarConFiltros: " . $e->getMessage());
            return 0;
        }
    }

    // Leer un solo registro por ID
    public function leerUno() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->id);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Asignar propiedades
                $this->legajo = $row['legajo'];
                $this->nombre = $row['nombre'];
                $this->apellido = $row['apellido'];
                $this->dni = $row['dni'];
                $this->cuil = $row['cuil'];
                $this->telefono = $row['telefono'];
                $this->email = $row['email'];
                $this->correo_corporativo = $row['correo_corporativo'];
                $this->puesto = $row['puesto'];
                $this->sector = $row['sector'];
                $this->rol_sistema = $row['rol_sistema'];
                $this->fecha_ingreso = $row['fecha_ingreso'];
                $this->fecha_nacimiento = $row['fecha_nacimiento'];
                $this->direccion = $row['direccion'];
                $this->tipo_contrato = $row['tipo_contrato'];
                $this->estado_licencia = $row['estado_licencia'];
                $this->clase_licencia = $row['clase_licencia'];
                $this->vencimiento_licencia = $row['vencimiento_licencia'];
                $this->certificados = $row['certificados'];
                $this->carnet_cargas_peligrosas = $row['carnet_cargas_peligrosas'];
                $this->vencimiento_carnet = $row['vencimiento_carnet'];
                $this->observaciones = $row['observaciones'];
                $this->activo = $row['activo'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                
                return true;
            }
            
            return false;
            
        } catch (PDOException $e) {
            error_log("Error en leerUno: " . $e->getMessage());
            return false;
        }
    }

    // Crear nuevo personal
    public function crear() {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                     (legajo, nombre, apellido, dni, cuil, telefono, email, correo_corporativo, 
                      puesto, sector, rol_sistema, fecha_ingreso, fecha_nacimiento, direccion,
                      tipo_contrato, estado_licencia, clase_licencia, vencimiento_licencia,
                      certificados, carnet_cargas_peligrosas, vencimiento_carnet, observaciones, activo) 
                     VALUES 
                     (:legajo, :nombre, :apellido, :dni, :cuil, :telefono, :email, :correo_corporativo,
                      :puesto, :sector, :rol_sistema, :fecha_ingreso, :fecha_nacimiento, :direccion,
                      :tipo_contrato, :estado_licencia, :clase_licencia, :vencimiento_licencia,
                      :certificados, :carnet_cargas_peligrosas, :vencimiento_carnet, :observaciones, :activo)";
            
            $stmt = $this->conn->prepare($query);
            
            // Limpiar datos
            $this->legajo = htmlspecialchars(strip_tags($this->legajo));
            $this->nombre = htmlspecialchars(strip_tags($this->nombre));
            $this->apellido = htmlspecialchars(strip_tags($this->apellido));
            $this->dni = htmlspecialchars(strip_tags($this->dni));
            $this->cuil = htmlspecialchars(strip_tags($this->cuil));
            $this->correo_corporativo = htmlspecialchars(strip_tags($this->correo_corporativo));
            
            // Bind parameters
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
            $stmt->bindParam(":observaciones", $this->observaciones);
            $stmt->bindParam(":activo", $this->activo);
            
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
            
        } catch (PDOException $e) {
            error_log("Error en crear: " . $e->getMessage());
            return false;
        }
    }

    // Actualizar personal
    public function actualizar() {
        try {
            $query = "UPDATE " . $this->table_name . " 
                     SET legajo = :legajo, nombre = :nombre, apellido = :apellido, dni = :dni, 
                         cuil = :cuil, telefono = :telefono, email = :email, correo_corporativo = :correo_corporativo,
                         puesto = :puesto, sector = :sector, rol_sistema = :rol_sistema, fecha_ingreso = :fecha_ingreso,
                         fecha_nacimiento = :fecha_nacimiento, direccion = :direccion, tipo_contrato = :tipo_contrato,
                         estado_licencia = :estado_licencia, clase_licencia = :clase_licencia, vencimiento_licencia = :vencimiento_licencia,
                         certificados = :certificados, carnet_cargas_peligrosas = :carnet_cargas_peligrosas, 
                         vencimiento_carnet = :vencimiento_carnet, observaciones = :observaciones, activo = :activo
                     WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            // Limpiar datos
            $this->legajo = htmlspecialchars(strip_tags($this->legajo));
            $this->nombre = htmlspecialchars(strip_tags($this->nombre));
            $this->apellido = htmlspecialchars(strip_tags($this->apellido));
            $this->dni = htmlspecialchars(strip_tags($this->dni));
            $this->cuil = htmlspecialchars(strip_tags($this->cuil));
            $this->correo_corporativo = htmlspecialchars(strip_tags($this->correo_corporativo));
            
            // Bind parameters
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
            $stmt->bindParam(":observaciones", $this->observaciones);
            $stmt->bindParam(":activo", $this->activo);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Error en actualizar: " . $e->getMessage());
            return false;
        }
    }

    // Eliminar personal (lógicamente)
    public function eliminar() {
        try {
            $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Error en eliminar: " . $e->getMessage());
            return false;
        }
    }
}
?>