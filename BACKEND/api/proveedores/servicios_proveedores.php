<?php
header('Content-Type: application/json');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Proveedor.php';
require_once $base_path . '/models/Servicio.php';

class ServiciosProveedoresController {
    private $conn;
    private $proveedor;
    private $servicio;

    public function __construct() {
        $this->conn = Conexion::getConexion();
        $this->proveedor = new Proveedor($this->conn);
        $this->servicio = new Servicio($this->conn);
    }

    // GET /proveedores/[id]/servicios - Obtener servicios de un proveedor
    public function obtenerServiciosProveedor($proveedor_id) {
        try {
            // Primero verificar que el proveedor existe
            $this->proveedor->id = $proveedor_id;
            if (!$this->proveedor->leerUno()) {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Proveedor no encontrado"));
                return;
            }

            // Obtener servicios del proveedor (a través de la tabla intermedia)
            $query = "SELECT s.*, ps.fecha_asignacion 
                      FROM servicios s 
                      INNER JOIN proveedor_servicios ps ON s.id = ps.servicio_id 
                      WHERE ps.proveedor_id = ? 
                      AND s.estado = 'activo' 
                      ORDER BY s.nombre_servicio";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$proveedor_id]);
            $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "proveedor_id" => $proveedor_id,
                "proveedor_nombre" => $this->proveedor->nombre,
                "servicios" => $servicios
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // POST /proveedores/[id]/servicios - Asignar servicio a proveedor
    public function asignarServicioProveedor($proveedor_id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['servicio_id'])) {
                http_response_code(400);
                echo json_encode(array("mensaje" => "El campo servicio_id es requerido"));
                return;
            }

            // Verificar que el proveedor existe
            $this->proveedor->id = $proveedor_id;
            if (!$this->proveedor->leerUno()) {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Proveedor no encontrado"));
                return;
            }

            // Verificar que el servicio existe
            $this->servicio->id = $data['servicio_id'];
            if (!$this->servicio->leerUno()) {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Servicio no encontrado"));
                return;
            }

            // Verificar si ya existe la relación
            $queryCheck = "SELECT * FROM proveedor_servicios 
                          WHERE proveedor_id = ? AND servicio_id = ?";
            $stmtCheck = $this->conn->prepare($queryCheck);
            $stmtCheck->execute([$proveedor_id, $data['servicio_id']]);
            
            if ($stmtCheck->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(array("mensaje" => "El servicio ya está asignado a este proveedor"));
                return;
            }

            // Crear la relación
            $query = "INSERT INTO proveedor_servicios (proveedor_id, servicio_id, fecha_asignacion) 
                      VALUES (?, ?, NOW())";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute([$proveedor_id, $data['servicio_id']])) {
                http_response_code(201);
                echo json_encode(array("mensaje" => "Servicio asignado al proveedor exitosamente"));
            } else {
                http_response_code(500);
                echo json_encode(array("mensaje" => "Error al asignar el servicio"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // DELETE /proveedores/[id]/servicios/[servicio_id] - Remover servicio de proveedor
    public function removerServicioProveedor($proveedor_id, $servicio_id) {
        try {
            // Verificar que existe la relación
            $queryCheck = "SELECT * FROM proveedor_servicios 
                          WHERE proveedor_id = ? AND servicio_id = ?";
            $stmtCheck = $this->conn->prepare($queryCheck);
            $stmtCheck->execute([$proveedor_id, $servicio_id]);
            
            if ($stmtCheck->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(array("mensaje" => "El servicio no está asignado a este proveedor"));
                return;
            }

            // Eliminar la relación
            $query = "DELETE FROM proveedor_servicios 
                      WHERE proveedor_id = ? AND servicio_id = ?";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute([$proveedor_id, $servicio_id])) {
                echo json_encode(array("mensaje" => "Servicio removido del proveedor exitosamente"));
            } else {
                http_response_code(500);
                echo json_encode(array("mensaje" => "Error al remover el servicio"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }
}

// Routing
$method = $_SERVER['REQUEST_METHOD'];
$controller = new ServiciosProveedoresController();

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$base_path = '/BACKEND/api/proveedores/servicios_proveedores.php';
$relative_path = str_replace($base_path, '', $path);

if (preg_match('/\/proveedores\/(\d+)\/servicios/', $relative_path, $matches)) {
    $proveedor_id = $matches[1];
    
    if (preg_match('/\/proveedores\/\d+\/servicios\/(\d+)/', $relative_path, $servicio_matches)) {
        $servicio_id = $servicio_matches[1];
        if ($method == 'DELETE') {
            $controller->removerServicioProveedor($proveedor_id, $servicio_id);
        } else {
            http_response_code(405);
            echo json_encode(array("mensaje" => "Método no permitido"));
        }
    } else {
        switch($method) {
            case 'GET':
                $controller->obtenerServiciosProveedor($proveedor_id);
                break;
            case 'POST':
                $controller->asignarServicioProveedor($proveedor_id);
                break;
            default:
                http_response_code(405);
                echo json_encode(array("mensaje" => "Método no permitido"));
                break;
        }
    }
} else {
    http_response_code(404);
    echo json_encode(array("mensaje" => "Endpoint no encontrado"));
}
?>