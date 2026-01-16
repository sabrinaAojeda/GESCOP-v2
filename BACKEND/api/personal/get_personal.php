<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../models/Personal.php';

$database = new Database();
$db = $database->getConnection();
$personal = new Personal($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Obtener parámetros de paginación y filtros
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $sector = isset($_GET['sector']) ? $_GET['sector'] : '';
    $estado = isset($_GET['estado']) ? $_GET['estado'] : '';
    
    $offset = ($page - 1) * $limit;
    
    // Obtener personal con filtros
    $stmt = $personal->leerConFiltros($search, $sector, $estado, $limit, $offset);
    $num = $stmt->rowCount();
    
    if ($num > 0) {
        $personal_arr = array();
        $personal_arr["data"] = array();
        $personal_arr["pagination"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Formatear datos para el frontend
            $personal_item = array(
                "id" => $row['id'],
                "legajo" => $row['id'], // Usamos ID como legajo temporal
                "nombre" => $row['nombre'],
                "apellido" => $row['apellido'],
                "dni" => $row['dni'],
                "telefono" => $row['telefono'],
                "email" => $row['email'],
                "sector" => $row['sector'],
                "cargo" => $row['puesto'],
                "fecha_ingreso" => $row['fecha_ingreso'],
                "estado" => $row['activo'] == 1 ? 'Activo' : 'Inactivo',
                "licenciaVencimiento" => '' // Campo temporal
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
        
        http_response_code(200);
        echo json_encode($personal_arr);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "No se encontró personal"));
    }
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Método no permitido"));
}
?>