<?php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Empresa.php';
include_once $base_path . '/models/Sede.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$entity = $_GET['entity'] ?? 'empresas';

switch($entity) {
    case 'empresas':
        $empresa = new Empresa($db);
        handleEmpresaRequest($empresa, $method);
        break;
    case 'sedes':
        $sede = new Sede($db);
        handleSedeRequest($sede, $method);
        break;
    default:
        http_response_code(400);
        echo json_encode(array("message" => "Entidad no válida"));
        break;
}

function handleEmpresaRequest($empresa, $method) {
    switch($method) {
        case 'GET':
            $stmt = $empresa->leer();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $empresas_arr = array();
                $empresas_arr["empresas"] = array();
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($empresas_arr["empresas"], $row);
                }
                
                http_response_code(200);
                echo json_encode($empresas_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No se encontraron empresas"));
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->nombre) && !empty($data->cuit)) {
                $empresa->nombre = $data->nombre;
                $empresa->cuit = $data->cuit;
                $empresa->direccion = $data->direccion;
                $empresa->telefono = $data->telefono;
                $empresa->email = $data->email;
                $empresa->contacto = $data->contacto;
                
                if($empresa->crear()) {
                    http_response_code(201);
                    echo json_encode(array("message" => "Empresa creada exitosamente"));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "No se pudo crear la empresa"));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Datos incompletos"));
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(array("message" => "Método no permitido"));
            break;
    }
}

function handleSedeRequest($sede, $method) {
    switch($method) {
        case 'GET':
            $stmt = $sede->leer();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $sedes_arr = array();
                $sedes_arr["sedes"] = array();
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($sedes_arr["sedes"], $row);
                }
                
                http_response_code(200);
                echo json_encode($sedes_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No se encontraron sedes"));
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->nombre) && !empty($data->empresa_id)) {
                $sede->nombre = $data->nombre;
                $sede->direccion = $data->direccion;
                $sede->telefono = $data->telefono;
                $sede->empresa_id = $data->empresa_id;
                $sede->encargado = $data->encargado;
                
                if($sede->crear()) {
                    http_response_code(201);
                    echo json_encode(array("message" => "Sede creada exitosamente"));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "No se pudo crear la sede"));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Datos incompletos"));
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(array("message" => "Método no permitido"));
            break;
    }
}
?>