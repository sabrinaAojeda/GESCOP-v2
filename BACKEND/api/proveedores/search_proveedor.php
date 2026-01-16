<?php
// BACKEND/api/proveedores/search_proveedor.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();
$proveedor = new Proveedor($db);

$search = isset($_GET['q']) ? $_GET['q'] : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

try {
    $stmt = $proveedor->buscar($search, $limit);
    $num = $stmt->rowCount();
    
    if ($num > 0) {
        $proveedores_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $proveedor_item = array(
                "id" => $row['id'],
                "codigo" => $row['codigo'],
                "razon_social" => $row['razon_social'],
                "cuit" => $row['cuit'],
                "rubro" => $row['rubro'],
                "estado" => $row['estado']
            );
            array_push($proveedores_arr, $proveedor_item);
        }
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => $proveedores_arr
        ));
    } else {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => []
        ));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error en la búsqueda",
        "error" => $e->getMessage()
    ));
}
?>