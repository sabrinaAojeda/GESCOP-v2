<?php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
include_once $base_path . '/models/Documento.php';

$database = new Database();
$db = $database->getConnection();
$documento = new Documento($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $vehiculo_id = $_GET['vehiculo_id'] ?? '';
        
        if(!empty($vehiculo_id)) {
            // Obtener documentos de un vehículo específico
            $query = "SELECT d.*, v.dominio as vehiculo_dominio 
                      FROM documentos d 
                      LEFT JOIN vehiculos v ON d.vehiculo_id = v.interno 
                      WHERE d.vehiculo_id = ? 
                      ORDER BY d.fecha_vencimiento";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $vehiculo_id);
            $stmt->execute();
            
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $documentos_arr = array();
                $documentos_arr["documentos"] = array();
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($documentos_arr["documentos"], $row);
                }
                
                http_response_code(200);
                echo json_encode($documentos_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No se encontraron documentos para este vehículo"));
            }
        } else {
            // Obtener todos los documentos
            $stmt = $documento->leer();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $documentos_arr = array();
                $documentos_arr["documentos"] = array();
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($documentos_arr["documentos"], $row);
                }
                
                http_response_code(200);
                echo json_encode($documentos_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No se encontraron documentos"));
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !empty($data->vehiculo_id) &&
            !empty($data->tipo) &&
            !empty($data->nombre)
        ) {
            $documento->vehiculo_id = $data->vehiculo_id;
            $documento->tipo = $data->tipo;
            $documento->nombre = $data->nombre;
            $documento->ruta_archivo = $data->ruta_archivo;
            $documento->fecha_vencimiento = $data->fecha_vencimiento;
            $documento->estado = $data->estado;
            $documento->observaciones = $data->observaciones;
            
            if($documento->crear()) {
                http_response_code(201);
                echo json_encode(array("message" => "Documento creado exitosamente"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "No se pudo crear el documento"));
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
?>