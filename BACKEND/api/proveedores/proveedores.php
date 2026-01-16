<?php
// BACKEND/api/proveedores/proveedores.php
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

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Obtener parámetros de paginación y filtros
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $rubro = isset($_GET['rubro']) ? $_GET['rubro'] : '';
    $estado = isset($_GET['estado']) ? $_GET['estado'] : '';
    $localidad = isset($_GET['localidad']) ? $_GET['localidad'] : '';
    
    $offset = ($page - 1) * $limit;
    
    try {
        // Obtener proveedores con filtros
        $stmt = $proveedor->leerConFiltros($search, $rubro, $estado, $localidad, $limit, $offset);
        $num = $stmt->rowCount();
        
        $proveedores_arr = array();
        $proveedores_arr["success"] = true;
        $proveedores_arr["data"] = array();
        
        if ($num > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Formatear datos para el frontend
                $proveedor_item = array(
                    "id" => $row['id'],
                    "codigo" => $row['codigo'],
                    "razon_social" => $row['razon_social'],
                    "cuit" => $row['cuit'],
                    "rubro" => $row['rubro'],
                    "direccion" => $row['direccion'],
                    "localidad" => $row['localidad'],
                    "provincia" => $row['provincia'],
                    "telefono" => $row['telefono'],
                    "email" => $row['email'],
                    "contacto_nombre" => $row['contacto_nombre'],
                    "contacto_cargo" => $row['contacto_cargo'],
                    "estado" => $row['estado'],
                    "seguro_RT" => (bool)$row['seguro_RT'],
                    "habilitacion_personal" => $row['habilitacion_personal'],
                    "habilitacion_vehiculo" => $row['habilitacion_vehiculo'],
                    "campos_personalizados" => $row['campos_personalizados'] ? json_decode($row['campos_personalizados'], true) : [],
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                );
                array_push($proveedores_arr["data"], $proveedor_item);
            }
            
            // Obtener total para paginación
            $total = $proveedor->contarConFiltros($search, $rubro, $estado, $localidad);
            $proveedores_arr["pagination"] = array(
                "current_page" => $page,
                "per_page" => $limit,
                "total" => $total,
                "total_pages" => ceil($total / $limit)
            );
            
            // Obtener opciones de filtros
            $opciones = $proveedor->obtenerOpcionesFiltros();
            $proveedores_arr["filters"] = array(
                "rubros" => array_merge(["Todos los rubros"], $opciones['rubros']),
                "localidades" => array_merge(["Todas las localidades"], $opciones['localidades']),
                "estados" => array_merge(["Todos los estados"], $opciones['estados'])
            );
            
            http_response_code(200);
        } else {
            $proveedores_arr["pagination"] = array(
                "current_page" => $page,
                "per_page" => $limit,
                "total" => 0,
                "total_pages" => 0
            );
            
            $proveedores_arr["filters"] = array(
                "rubros" => ["Todos los rubros"],
                "localidades" => ["Todas las localidades"],
                "estados" => ["Todos los estados"]
            );
            
            http_response_code(200);
        }
        
        echo json_encode($proveedores_arr);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Error al obtener proveedores",
            "error" => $e->getMessage()
        ));
    }
} else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Método no permitido"));
}
?>