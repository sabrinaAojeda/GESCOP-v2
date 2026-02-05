<?php
// BACKEND/api/proveedores/search_proveedor.php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Proveedor.php';

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