// BACKEND/models/Personal.php - VERSIÓN ACTUALIZADA
<?php
class Personal {
    private $conn;
    private $table_name = "personal";

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
    public $rol_sistema; // admin, usuario
    public $fecha_ingreso;
    public $fecha_nacimiento;
    public $direccion;
    public $tipo_contrato;
    public $estado_licencia; // Vigente, Vencida
    public $clase_licencia; // A, B, C, D, E
    public $vencimiento_licencia;
    public $certificados; // JSON con certificados
    public $carnet_cargas_peligrosas;
    public $vencimiento_carnet;
    public $capacitaciones; // JSON con capacitaciones
    public $observaciones;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Métodos CRUD (similar a los existentes pero con nuevos campos)
    public function crear() {
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
        
        // Sanitizar y bind (agregar todos los nuevos campos)
        $this->legajo = htmlspecialchars(strip_tags($this->legajo));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellido = htmlspecialchars(strip_tags($this->apellido));
        $this->dni = htmlspecialchars(strip_tags($this->dni));
        $this->cuil = htmlspecialchars(strip_tags($this->cuil));
        $this->correo_corporativo = htmlspecialchars(strip_tags($this->correo_corporativo));
        $this->rol_sistema = htmlspecialchars(strip_tags($this->rol_sistema));
        $this->clase_licencia = htmlspecialchars(strip_tags($this->clase_licencia));
        $this->certificados = $this->certificados ? json_encode($this->certificados) : null;
        $this->capacitaciones = $this->capacitaciones ? json_encode($this->capacitaciones) : null;
        
        // Bind parameters (agregar todos los nuevos)
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
        $stmt->bindParam(":activo", $this->activo);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Los demás métodos (leer, actualizar, eliminar) se mantienen similares
    // pero procesando los nuevos campos
}
?>