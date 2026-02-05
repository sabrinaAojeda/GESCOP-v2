<?php
header('Content-Type: application/json');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Servicio.php';

class ServiciosController {
    private $servicio;
    private $conn;

    public function __construct() {
        $this->conn = Conexion::getConexion();
        $this->servicio = new Servicio($this->conn);
    }

    // GET /empresas/[id]/servicios
    public function obtenerServiciosEmpresa($empresa_id) {
        try {
            // Obtener sedes de la empresa primero
            $querySedes = "SELECT id FROM sedes WHERE empresa_id = ?";
            $stmtSedes = $this->conn->prepare($querySedes);
            $stmtSedes->execute([$empresa_id]);
            $sedes = $stmtSedes->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($sedes)) {
                echo json_encode(array(
                    "empresa_id" => $empresa_id,
                    "servicios" => []
                ));
                return;
            }

            // Obtener servicios de las sedes
            $placeholders = str_repeat('?,', count($sedes) - 1) . '?';
            $query = "SELECT s.*, se.nombre as sede_nombre 
                      FROM servicios s 
                      LEFT JOIN sedes se ON s.base_id = se.id 
                      WHERE s.base_id IN ($placeholders) 
                      ORDER BY s.fecha_inicio DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute($sedes);
            $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "empresa_id" => $empresa_id,
                "servicios" => $servicios
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // GET /servicios (todos los servicios)
    public function obtenerTodosServicios() {
        try {
            $stmt = $this->servicio->leer();
            $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "servicios" => $servicios
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // GET /servicios/[id]
    public function obtenerServicio($id) {
        try {
            $this->servicio->id = $id;
            
            if ($this->servicio->leerUno()) {
                echo json_encode(array(
                    "servicio" => array(
                        "id" => $this->servicio->id,
                        "base_id" => $this->servicio->base_id,
                        "nombre_servicio" => $this->servicio->nombre_servicio,
                        "tipo_servicio" => $this->servicio->tipo_servicio,
                        "descripcion" => $this->servicio->descripcion,
                        "estado" => $this->servicio->estado,
                        "fecha_inicio" => $this->servicio->fecha_inicio,
                        "fecha_vencimiento" => $this->servicio->fecha_vencimiento,
                        "created_at" => $this->servicio->created_at,
                        "updated_at" => $this->servicio->updated_at
                    )
                ));
            } else {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Servicio no encontrado"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // POST /servicios
    public function crearServicio() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['nombre_servicio']) || !isset($data['base_id'])) {
            http_response_code(400);
            echo json_encode(array("mensaje" => "Los campos nombre_servicio y base_id son requeridos"));
            return;
        }

        $this->servicio->base_id = $data['base_id'];
        $this->servicio->nombre_servicio = $data['nombre_servicio'];
        $this->servicio->tipo_servicio = $data['tipo_servicio'] ?? 'operador';
        $this->servicio->descripcion = $data['descripcion'] ?? '';
        $this->servicio->estado = $data['estado'] ?? 'activo';
        $this->servicio->fecha_inicio = $data['fecha_inicio'] ?? date('Y-m-d');
        $this->servicio->fecha_vencimiento = $data['fecha_vencimiento'] ?? null;

        if ($this->servicio->crear()) {
            http_response_code(201);
            echo json_encode(array("mensaje" => "Servicio creado exitosamente"));
        } else {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error al crear el servicio"));
        }
    }

    // PUT /servicios/[id]
    public function actualizarServicio($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $this->servicio->id = $id;
        
        if (!$this->servicio->leerUno()) {
            http_response_code(404);
            echo json_encode(array("mensaje" => "Servicio no encontrado"));
            return;
        }

        $this->servicio->base_id = $data['base_id'] ?? $this->servicio->base_id;
        $this->servicio->nombre_servicio = $data['nombre_servicio'] ?? $this->servicio->nombre_servicio;
        $this->servicio->tipo_servicio = $data['tipo_servicio'] ?? $this->servicio->tipo_servicio;
        $this->servicio->descripcion = $data['descripcion'] ?? $this->servicio->descripcion;
        $this->servicio->estado = $data['estado'] ?? $this->servicio->estado;
        $this->servicio->fecha_inicio = $data['fecha_inicio'] ?? $this->servicio->fecha_inicio;
        $this->servicio->fecha_vencimiento = $data['fecha_vencimiento'] ?? $this->servicio->fecha_vencimiento;

        if ($this->servicio->actualizar()) {
            echo json_encode(array("mensaje" => "Servicio actualizado exitosamente"));
        } else {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error al actualizar el servicio"));
        }
    }

    // DELETE /servicios/[id]
    public function eliminarServicio($id) {
        $this->servicio->id = $id;
        
        if (!$this->servicio->leerUno()) {
            http_response_code(404);
            echo json_encode(array("mensaje" => "Servicio no encontrado"));
            return;
        }

        if ($this->servicio->eliminar()) {
            echo json_encode(array("mensaje" => "Servicio eliminado exitosamente"));
        } else {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error al eliminar el servicio"));
        }
    }
}

// Routing
$method = $_SERVER['REQUEST_METHOD'];
$controller = new ServiciosController();

// Obtener path info
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$base_path = '/BACKEND/api/empresas/servicios.php';
$relative_path = str_replace($base_path, '', $path);

if (preg_match('/\/empresas\/(\d+)\/servicios/', $relative_path, $matches)) {
    if ($method == 'GET') {
        $controller->obtenerServiciosEmpresa($matches[1]);
    } else {
        http_response_code(405);
        echo json_encode(array("mensaje" => "Método no permitido para este endpoint"));
    }
} elseif ($relative_path == '' || $relative_path == '/') {
    switch($method) {
        case 'GET':
            $controller->obtenerTodosServicios();
            break;
        case 'POST':
            $controller->crearServicio();
            break;
        default:
            http_response_code(405);
            echo json_encode(array("mensaje" => "Método no permitido"));
            break;
    }
} elseif (preg_match('/\/(\d+)/', $relative_path, $matches)) {
    $id = $matches[1];
    switch($method) {
        case 'GET':
            $controller->obtenerServicio($id);
            break;
        case 'PUT':
            $controller->actualizarServicio($id);
            break;
        case 'DELETE':
            $controller->eliminarServicio($id);
            break;
        default:
            http_response_code(405);
            echo json_encode(array("mensaje" => "Método no permitido"));
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(array("mensaje" => "Endpoint no encontrado"));
}
?>