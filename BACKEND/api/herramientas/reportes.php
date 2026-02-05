<?php
header('Content-Type: application/json');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Reporte.php';

class ReportesController {
    private $conn;
    private $reporte;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->reporte = new Reporte($this->conn);
    }

    // GET /reportes - Obtener lista de reportes generados
    public function obtenerReportes() {
        try {
            $stmt = $this->reporte->leer();
            $reportes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                "reportes" => $reportes
            ));

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // GET /reportes/[id] - Obtener un reporte específico
    public function obtenerReporte($id) {
        try {
            $this->reporte->id = $id;
            
            if ($this->reporte->leerUno()) {
                echo json_encode(array(
                    "reporte" => array(
                        "id" => $this->reporte->id,
                        "nombre" => $this->reporte->nombre,
                        "ruta" => $this->reporte->ruta,
                        "tipo" => $this->reporte->tipo,
                        "generado_en" => $this->reporte->generado_en
                    )
                ));
            } else {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Reporte no encontrado"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // POST /reportes - Generar nuevo reporte
    public function generarReporte() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $tipo = $data['tipo'] ?? 'semanal';
            $formato = $data['formato'] ?? 'csv';
            
            // Obtener datos para el reporte
            $reporteData = $this->obtenerDatosReporte($tipo);
            
            // Usar paths absolutos para uploads
            $base_path = dirname(__FILE__, 3); // public_html/
            
            // Generar archivo
            $filename = 'reporte_' . $tipo . '_' . date('Y-m-d_H-i-s') . '.' . $formato;
            $filepath = $base_path . '/../../uploads/reportes/' . $filename;
            
            if (!is_dir($base_path . '/../../uploads/reportes/')) {
                mkdir($base_path . '/../../uploads/reportes/', 0777, true);
            }
            
            if ($formato === 'csv') {
                $this->generarCSV($reporteData, $filepath);
            } else {
                $this->generarPDF($reporteData, $filepath);
            }
            
            // Guardar registro en base de datos
            $this->reporte->nombre = $filename;
            $this->reporte->ruta = $filepath;
            $this->reporte->tipo = $tipo;
            
            if ($this->reporte->crear()) {
                echo json_encode(array(
                    "mensaje" => "Reporte generado exitosamente",
                    "archivo" => $filename,
                    "ruta" => $filepath,
                    "tipo" => $tipo,
                    "formato" => $formato
                ));
            } else {
                http_response_code(500);
                echo json_encode(array("mensaje" => "Error al guardar el registro del reporte"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    // DELETE /reportes/[id] - Eliminar reporte
    public function eliminarReporte($id) {
        try {
            $this->reporte->id = $id;
            
            if (!$this->reporte->leerUno()) {
                http_response_code(404);
                echo json_encode(array("mensaje" => "Reporte no encontrado"));
                return;
            }

            if ($this->reporte->eliminar()) {
                echo json_encode(array("mensaje" => "Reporte eliminado exitosamente"));
            } else {
                http_response_code(500);
                echo json_encode(array("mensaje" => "Error al eliminar el reporte"));
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("mensaje" => "Error: " . $e->getMessage()));
        }
    }

    private function obtenerDatosReporte($tipo) {
        $data = array();
        
        // Empresas
        $queryEmpresas = "SELECT e.*, COUNT(s.id) as num_sedes 
                         FROM empresas e 
                         LEFT JOIN sedes s ON e.id = s.empresa_id 
                         GROUP BY e.id";
        $stmt = $this->conn->prepare($queryEmpresas);
        $stmt->execute();
        $data['empresas'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Sedes (Bases)
        $querySedes = "SELECT s.*, e.nombre as empresa_nombre 
                       FROM sedes s 
                       INNER JOIN empresas e ON s.empresa_id = e.id";
        $stmt = $this->conn->prepare($querySedes);
        $stmt->execute();
        $data['sedes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Proveedores
        $queryProveedores = "SELECT * FROM proveedores";
        $stmt = $this->conn->prepare($queryProveedores);
        $stmt->execute();
        $data['proveedores'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Personal
        $queryPersonal = "SELECT p.*, pr.nombre as proveedor_nombre 
                         FROM personal p 
                         LEFT JOIN proveedores pr ON p.proveedor_id = pr.id";
        $stmt = $this->conn->prepare($queryPersonal);
        $stmt->execute();
        $data['personal'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Habilitaciones próximas a vencer
        $queryHabilitaciones = "SELECT h.*, 
                               CASE 
                                 WHEN h.entidad_tipo = 'empresa' THEN e.nombre
                                 WHEN h.entidad_tipo = 'sede' THEN s.nombre
                                 WHEN h.entidad_tipo = 'proveedor' THEN p.nombre
                                 WHEN h.entidad_tipo = 'personal' THEN CONCAT(per.nombre, ' ', per.apellido)
                               END as entidad_nombre
                               FROM habilitaciones h
                               LEFT JOIN empresas e ON h.entidad_tipo = 'empresa' AND h.entidad_id = e.id
                               LEFT JOIN sedes s ON h.entidad_tipo = 'sede' AND h.entidad_id = s.id
                               LEFT JOIN proveedores p ON h.entidad_tipo = 'proveedor' AND h.entidad_id = p.id
                               LEFT JOIN personal per ON h.entidad_tipo = 'personal' AND h.entidad_id = per.id
                               WHERE h.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                               AND h.estado = 'activo'";
        $stmt = $this->conn->prepare($queryHabilitaciones);
        $stmt->execute();
        $data['habilitaciones'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Servicios
        $queryServicios = "SELECT s.*, se.nombre as sede_nombre, e.nombre as empresa_nombre 
                          FROM servicios s
                          LEFT JOIN sedes se ON s.base_id = se.id
                          LEFT JOIN empresas e ON se.empresa_id = e.id
                          WHERE s.estado = 'activo'";
        $stmt = $this->conn->prepare($queryServicios);
        $stmt->execute();
        $data['servicios'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $data;
    }

    private function generarCSV($data, $filepath) {
        $file = fopen($filepath, 'w');
        
        // Cabecera
        fputcsv($file, ['REPORTE SISTEMA GESCOP - ' . date('Y-m-d H:i:s')]);
        fputcsv($file, []); // Línea vacía
        
        // Empresas
        fputcsv($file, ['EMPRESAS']);
        fputcsv($file, ['ID', 'Nombre', 'RUC', 'Dirección', 'Teléfono', 'Email', 'Tipo Habilitación', 'Número de Sedes']);
        foreach ($data['empresas'] as $empresa) {
            fputcsv($file, [
                $empresa['id'],
                $empresa['nombre'],
                $empresa['ruc'],
                $empresa['direccion'],
                $empresa['telefono'],
                $empresa['email'],
                $empresa['tipo_habilitacion'],
                $empresa['num_sedes']
            ]);
        }
        fputcsv($file, []); // Línea vacía
        
        // Sedes
        fputcsv($file, ['SEDES']);
        fputcsv($file, ['ID', 'Nombre', 'Dirección', 'Empresa', 'Tipo Predio', 'Servicio Principal', 'Habilitada']);
        foreach ($data['sedes'] as $sede) {
            fputcsv($file, [
                $sede['id'],
                $sede['nombre'],
                $sede['direccion'],
                $sede['empresa_nombre'],
                $sede['tipo_predio'],
                $sede['servicio_principal'],
                $sede['habilitada'] ? 'Sí' : 'No'
            ]);
        }
        fputcsv($file, []); // Línea vacía
        
        // Servicios
        fputcsv($file, ['SERVICIOS']);
        fputcsv($file, ['ID', 'Nombre', 'Tipo', 'Sede', 'Empresa', 'Estado', 'Fecha Inicio', 'Fecha Vencimiento']);
        foreach ($data['servicios'] as $servicio) {
            fputcsv($file, [
                $servicio['id'],
                $servicio['nombre_servicio'],
                $servicio['tipo_servicio'],
                $servicio['sede_nombre'],
                $servicio['empresa_nombre'],
                $servicio['estado'],
                $servicio['fecha_inicio'],
                $servicio['fecha_vencimiento']
            ]);
        }
        fputcsv($file, []); // Línea vacía
        
        // Proveedores
        fputcsv($file, ['PROVEEDORES']);
        fputcsv($file, ['ID', 'Nombre', 'RUC', 'Sector Servicio', 'Localidad', 'Seguro RT']);
        foreach ($data['proveedores'] as $proveedor) {
            fputcsv($file, [
                $proveedor['id'],
                $proveedor['nombre'],
                $proveedor['ruc'],
                $proveedor['sector_servicio'],
                $proveedor['localidad'],
                $proveedor['seguro_RT'] ? 'Sí' : 'No'
            ]);
        }
        fputcsv($file, []); // Línea vacía
        
        // Personal
        fputcsv($file, ['PERSONAL']);
        fputcsv($file, ['ID', 'Nombre', 'Apellido', 'CUI', 'Sector', 'Proveedor', 'Seguro Vida']);
        foreach ($data['personal'] as $personal) {
            fputcsv($file, [
                $personal['id'],
                $personal['nombre'],
                $personal['apellido'],
                $personal['cui'],
                $personal['sector'],
                $personal['proveedor_nombre'],
                $personal['seguro_vida'] ? 'Sí' : 'No'
            ]);
        }
        fputcsv($file, []); // Línea vacía
        
        // Habilitaciones próximas a vencer
        fputcsv($file, ['HABILITACIONES PRÓXIMAS A VENCER (30 días)']);
        fputcsv($file, ['ID', 'Entidad', 'Nombre Entidad', 'Tipo', 'Fecha Emisión', 'Fecha Vencimiento']);
        foreach ($data['habilitaciones'] as $hab) {
            fputcsv($file, [
                $hab['id'],
                $hab['entidad_tipo'],
                $hab['entidad_nombre'],
                $hab['tipo'],
                $hab['fecha_emision'],
                $hab['fecha_vencimiento']
            ]);
        }
        
        fclose($file);
    }

    private function generarPDF($data, $filepath) {
        // Para PDF necesitarías una librería como TCPDF o FPDF
        // Por ahora generamos un CSV y si se solicita PDF, mostramos mensaje
        $this->generarCSV($data, $filepath);
        
        // En un entorno real, aquí implementarías la generación de PDF
        // usando TCPDF, FPDF, o Dompdf
    }
}

// Routing
$method = $_SERVER['REQUEST_METHOD'];
$controller = new ReportesController();

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$base_path = '/BACKEND/api/herramientas/reportes.php';
$relative_path = str_replace($base_path, '', $path);

if ($relative_path == '' || $relative_path == '/') {
    switch($method) {
        case 'GET':
            $controller->obtenerReportes();
            break;
        case 'POST':
            $controller->generarReporte();
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
            $controller->obtenerReporte($id);
            break;
        case 'DELETE':
            $controller->eliminarReporte($id);
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