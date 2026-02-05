<?php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Personal.php';

$database = new Database();
$db = $database->getConnection();
$personal = new Personal($db);

$search = isset($_GET['q']) ? $_GET['q'] : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

$stmt = $personal->buscar($search, $limit);
$num = $stmt->rowCount();

if ($num > 0) {
    $personal_arr = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $personal_item = array(
            "id" => $row['id'],
            "nombre_completo" => $row['nombre'] . ' ' . $row['apellido'],
            "dni" => $row['dni'],
            "sector" => $row['sector']
        );
        array_push($personal_arr, $personal_item);
    }
    
    http_response_code(200);
    echo json_encode($personal_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No se encontró personal"));
}
?>