<?php
// BACKEND/api/personal/get_personal.php - VERSIÓN COMPLETA CORREGIDA
header("Content-Type: application/json; charset=UTF-8");

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
include_once $base_path . '/config/database.php';
include_once $base_path . '/models/Personal.php';

$database = new Database();
$db = $database->getConnection();

// Verificar conexión a la base de datos
if (!$db) {
    http_response_code(503);
    echo json_encode(array(
        "success" => false,
        "message" => "Error de conexión a la base de datos",
        "error" => "No se pudo conectar a MySQL"
    ));
    exit();
}

$personal = new Personal($db);

// Solo método GET permitido
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        // Obtener parámetros de paginación y filtros
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $sector = isset($_GET['sector']) ? $_GET['sector'] : '';
        $estado = isset($_GET['estado']) ? $_GET['estado'] : '';
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        $offset = ($page - 1) * $limit;
        
        // Si se solicita un ID específico
        if ($id) {
            $personal->id = $id;
            if ($personal->leerUno()) {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id' => $personal->id,
                        'legajo' => $personal->legajo ?: 'P' . str_pad($personal->id, 4, '0', STR_PAD_LEFT),
                        'nombre' => $personal->nombre,
                        'apellido' => $personal->apellido,
                        'dni' => $personal->dni,
                        'cuil' => $personal->cuil,
                        'telefono' => $personal->telefono,
                        'email' => $personal->email,
                        'correo_corporativo' => $personal->correo_corporativo,
                        'sector' => $personal->sector,
                        'puesto' => $personal->puesto,
                        'cargo' => $personal->puesto,
                        'rol_sistema' => $personal->rol_sistema,
                        'fecha_ingreso' => $personal->fecha_ingreso,
                        'fecha_nacimiento' => $personal->fecha_nacimiento,
                        'direccion' => $personal->direccion,
                        'tipo_contrato' => $personal->tipo_contrato,
                        'estado_licencia' => $personal->estado_licencia,
                        'clase_licencia' => $personal->clase_licencia,
                        'vencimiento_licencia' => $personal->vencimiento_licencia,
                        'certificados_capacitacion' => $personal->certificados,
                        'carnet_cargas_peligrosas' => $personal->carnet_cargas_peligrosas,
                        'vencimiento_carnet' => $personal->vencimiento_carnet,
                        'observaciones' => $personal->observaciones,
                        'activo' => $personal->activo,
                        'estado' => $personal->activo == 1 ? 'Activo' : 'Inactivo',
                        'created_at' => $personal->created_at
                    ]
                ]);
                exit();
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Personal no encontrado'
                ]);
                exit();
            }
        }
        
        // Obtener personal con filtros
        $stmt = $personal->leerConFiltros($search, $sector, $estado, $limit, $offset);
        
        if (!$stmt) {
            throw new Exception("Error en la consulta a la base de datos");
        }
        
        $num = $stmt->rowCount();
        
        $personal_arr = array();
        $personal_arr["data"] = array();
        
        if ($num > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Formatear datos COMPLETOS para el frontend
                $personal_item = array(
                    "id" => $row['id'],
                    "legajo" => $row['legajo'] ?: 'P' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
                    "nombre" => $row['nombre'],
                    "apellido" => $row['apellido'],
                    "dni" => $row['dni'],
                    "cuil" => $row['cuil'],
                    "telefono" => $row['telefono'],
                    "email" => $row['email'],
                    "correo_corporativo" => $row['correo_corporativo'],
                    "sector" => $row['sector'],
                    "puesto" => $row['puesto'],
                    "cargo" => $row['puesto'],
                    "rol_sistema" => $row['rol_sistema'],
                    "rol" => $row['rol_sistema'], // alias para frontend
                    "fecha_ingreso" => $row['fecha_ingreso'],
                    "fecha_nacimiento" => $row['fecha_nacimiento'],
                    "direccion" => $row['direccion'],
                    "tipo_contrato" => $row['tipo_contrato'],
                    "estado_licencia" => $row['estado_licencia'],
                    "clase_licencia" => $row['clase_licencia'],
                    "categoria_licencia" => $row['clase_licencia'], // alias
                    "vencimiento_licencia" => $row['vencimiento_licencia'],
                    "licencia_conducir" => $row['estado_licencia'] ? 'Sí' : 'No',
                    "certificados_capacitacion" => $row['certificados'],
                    "carnet_cargas_peligrosas" => $row['carnet_cargas_peligrosas'],
                    "vencimiento_carnet" => $row['vencimiento_carnet'],
                    "observaciones" => $row['observaciones'],
                    "activo" => $row['activo'],
                    "estado" => $row['activo'] == 1 ? 'Activo' : 'Inactivo',
                    "created_at" => $row['created_at']
                );
                array_push($personal_arr["data"], $personal_item);
            }
            
            // Obtener total para paginación
            $total = $personal->contarConFiltros($search, $sector, $estado);
            $personal_arr["pagination"] = array(
                "current_page" => $page,
                "per_page" => $limit,
                "total" => $total,
                "total_pages" => ceil($total / $limit)
            );
            $personal_arr["success"] = true;
            
            http_response_code(200);
            echo json_encode($personal_arr);
        } else {
            // No hay datos, pero éxito en la consulta
            $personal_arr["data"] = array();
            $personal_arr["pagination"] = array(
                "current_page" => $page,
                "per_page" => $limit,
                "total" => 0,
                "total_pages" => 0
            );
            $personal_arr["success"] = true;
            
            http_response_code(200);
            echo json_encode($personal_arr);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Error del servidor",
            "error" => $e->getMessage()
        ));
    }
} else {
    http_response_code(405);
    echo json_encode(array(
        "success" => false,
        "message" => "Método no permitido"
    ));
}
?>