<?php
header('Content-Type: application/json');

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Habilitacion.php';

class HabilitacionesController {
    private $habilitacion;
    private $conn;

    public function __construct() {
        $this->conn = Conexion::getConexion();
        $this->habilitacion = new Habilitacion($this->conn);
    }

    // GET /empresa/[id]/habilitaciones
    public function obtenerHabilitacionesEmpresa($empresa_id) {
        try {
            $stmt = $this->habilitacion->obtenerPorEntidad('empresa', $empresa_id);
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "empresa_id" => $empresa_id,
                "habilitaciones" => $habilitaciones
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // GET /sede/[id]/habilitaciones
    public function obtenerHabilitacionesSede($sede_id) {
        try {
            $stmt = $this->habilitacion->obtenerPorEntidad('sede', $sede_id);
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "sede_id" => $sede_id,
                "habilitaciones" => $habilitaciones
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // GET /habilitaciones (todas)
    public function obtenerTodasHabilitaciones() {
        try {
            $stmt = $this->habilitacion->leer();
            $habilitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "habilitaciones" => $habilitaciones
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // GET /habilitaciones/[id]
    public function obtenerHabilitacion($id) {
        try {
            $this->habilitacion->id = $id;
            
            if ($this->habilitacion->leerUno()) {
                echo json_encode(array(
                    "habilitacion" => array(
                        "id" => $this->habilitacion->id,
                        "entidad_tipo" => $this->habilitacion->entidad_tipo,
                        "entidad_id" => $this->habilitacion->entidad_id,
                        "tipo" => $this->habilitacion->tipo,
                        "archivo" => $this->habilitacion->archivo,
                        "fecha_emision" => $this->habilitacion->fecha_emision,
                        "fecha_vencimiento" => $this->habilitacion->fecha_vencimiento,
                        "estado" => $this->habilitacion->estado,
                        "created_at" => $this->habilitacion->created_at,
                        "updated_at" => $this->habilitacion->updated_at
                    )
                ));
            } else {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Habilitación no encontrada"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // POST /habilitaciones
        public function crearHabilitacion() {
        try {
            // Usar paths absolutos para uploads
            $base_path = dirname(__FILE__, 3); // public_html/
            
            // Verificar si es upload de archivo
            if (isset($_FILES['archivo'])) {
                $uploadDir = $base_path . '/../../uploads/habilitaciones/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $fileName = time() . '_' . basename($_FILES['archivo']['name']);
                $uploadFile = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES['archivo']['tmp_name'], $uploadFile)) {
                    $data = $_POST;
                    
                    $this->habilitacion->entidad_tipo = $data['entidad_tipo'];
                    $this->habilitacion->entidad_id = $data['entidad_id'];
                    $this->habilitacion->tipo = $data['tipo'];
                    $this->habilitacion->archivo = $fileName;
                    $this->habilitacion->fecha_emision = $data['fecha_emision'];
                    $this->habilitacion->fecha_vencimiento = $data['fecha_vencimiento'];
                    $this->habilitacion->estado = 'activo';

                    if ($this->habilitacion->crear()) {
                        http_response_code(201);
                        echo json_encode(array(
                            "mensaje" => "Habilitación creada exitosamente",
                            "archivo" => $fileName
                        ));
                    } else {
                        http_response_code(500);
                        echo json_encode(array("mensaje" => "Error al crear la habilitación"));
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(array("mensaje" => "Error al subir el archivo"));
                }
            } else {
                // Sin archivo (solo datos)
                $data = json_decode(file_get_contents("php://input"), true);
                
                if (!isset($data['entidad_tipo']) || !isset($data['entidad_id']) || !isset($data['tipo'])) {
                    http_response_code(400);
                    echo json_encode(array("mensaje" => "Faltan campos requeridos: entidad_tipo, entidad_id, tipo"));
                    return;
                }

                $this->habilitacion->entidad_tipo = $data['entidad_tipo'];
                $this->habilitacion->entidad_id = $data['entidad_id'];
                $this->habilitacion->tipo = $data['tipo'];
                $this->habilitacion->archivo = $data['archivo'] ?? null;
                $this->habilitacion->fecha_emision = $data['fecha_emision'] ?? date('Y-m-d');
                $this->habilitacion->fecha_vencimiento = $data['fecha_vencimiento'];
                $this->habilitacion->estado = 'activo';

                if ($this->habilitacion->crear()) {
                    http_response_code(201);
                    echo json_encode(array("mensaje" => "Habilitación creada exitosamente"));
                } else {
                    http_response_code(500);
                    echo json_encode(array("mensaje" => "Error al crear la habilitación"));
                }
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // PUT /habilitaciones/[id]
    public function actualizarHabilitacion($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $this->habilitacion->id = $id;
        
        if (!$this->habilitacion->leerUno()) {
            http_response_code(404);
            echo json_encode(array("mensaje" => "Habilitación no encontrada"));
            return;
        }

        $this->habilitacion->entidad_tipo = $data['entidad_tipo'] ?? $this->habilitacion->entidad_tipo;
        $this->habilitacion->entidad_id = $data['entidad_id'] ?? $this->habilitacion->entidad_id;
        $this->habilitacion->tipo = $data['tipo'] ?? $this->habilitacion->tipo;
        $this->habilitacion->archivo = $data['archivo'] ?? $this->habilitacion->archivo;
        $this->habilitacion->fecha_emision = $data['fecha_emision'] ?? $this->habilitacion->fecha_emision;
        $this->habilitacion->fecha_vencimiento = $data['fecha_vencimiento'] ?? $this->habilitacion->fecha_vencimiento;
        $this->habilitacion->estado = $data['estado'] ?? $this->habilitacion->estado;

        if ($this->habilitacion->actualizar()) {
            echo json_encode(array("mensaje" => "Habilitación actualizada exitosamente"));
        } else {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error al actualizar la habilitación"));
        }
    }

    // DELETE /habilitaciones/[id]
    public function eliminarHabilitacion($id) {
        $this->habilitacion->id = $id;
        
        if (!$this->habilitacion->leerUno()) {
            http_response_code(404);
            echo json_encode(array("mensaje" => "Habilitación no encontrada"));
            return;
        }

        // Eliminar archivo físico si existe
        if (!empty($this->habilitacion->archivo)) {
            $filePath = $base_path . '/../../uploads/habilitaciones/' . $this->habilitacion->archivo;
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        if ($this->habilitacion->eliminar()) {
            echo json_encode(array("mensaje" => "Habilitación eliminada exitosamente"));
        } else {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error al eliminar la habilitación"));
        }
    }
}

// Routing
$method = $_SERVER['REQUEST_METHOD'];
$controller = new HabilitacionesController();

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$base_path = '/BACKEND/api/empresas/habilitaciones.php';
$relative_path = str_replace($base_path, '', $path);

if (preg_match('/\/empresa\/(\d+)\/habilitaciones/', $relative_path, $matches)) {
    if ($method == 'GET') {
        $controller->obtenerHabilitacionesEmpresa($matches[1]);
    }
} elseif (preg_match('/\/sede\/(\d+)\/habilitaciones/', $relative_path, $matches)) {
    if ($method == 'GET') {
        $controller->obtenerHabilitacionesSede($matches[1]);
    }
} elseif ($relative_path == '' || $relative_path == '/') {
    switch($method) {
        case 'GET':
            $controller->obtenerTodasHabilitaciones();
            break;
        case 'POST':
            $controller->crearHabilitacion();
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
            $controller->obtenerHabilitacion($id);
            break;
        case 'PUT':
            $controller->actualizarHabilitacion($id);
            break;
        case 'DELETE':
            $controller->eliminarHabilitacion($id);
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